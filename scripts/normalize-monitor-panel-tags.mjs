/**
 * Normalize monitor panel display values and monitorFilterTags across lib/*.ts
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LIB = path.join(__dirname, "..", "lib")

const PANEL_DISPLAY_TO_TAG = {
  IPS: "panel-ips",
  IPS非光沢: "panel-ips-matte",
  "Fast IPS": "panel-fast-ips",
  "Fast IPS非光沢": "panel-fast-ips-matte",
  VA: "panel-va",
  VA非光沢: "panel-va-matte",
  TN: "panel-tn",
  有機EL: "panel-oled",
  ADS: "panel-ads",
  "Mini LED": "panel-miniled",
}

const ALL_PANEL_TAGS = new Set([
  ...Object.values(PANEL_DISPLAY_TO_TAG),
  "panel-tn-matte",
  "panel-tn",
])

function normalizeMonitorPanelDisplay(raw) {
  if (!raw || raw === "—") return raw

  let s = raw.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim()
  if (/\bAHVA\b/i.test(s)) s = s.replace(/\bAHVA\b/gi, "IPS")

  const matte = /非光沢|ノングレア|non-?glossy|matte|matt/i.test(s)

  if (/miniled|mini\s*led|ミニ\s*led/i.test(s)) return "Mini LED"
  if (/有機EL|\boled\b|w?oled|qd-oled|woled/i.test(s)) return "有機EL"
  if (/\bads\b/i.test(s)) return "ADS"
  if (/fast\s*ips|rapid\s*ips/i.test(s)) return matte ? "Fast IPS非光沢" : "Fast IPS"
  if (/\bva\b|mva|sva/i.test(s)) return matte ? "VA非光沢" : "VA"
  if (/\btn\b|tn非光沢|tnパネル/i.test(s)) return "TN"
  if (/\bips\b/i.test(s)) return matte ? "IPS非光沢" : "IPS"

  return s
}

function panelDisplayToFilterTag(display) {
  const normalized = normalizeMonitorPanelDisplay(display)
  return PANEL_DISPLAY_TO_TAG[normalized] ?? null
}

function normalizePanelFields(src) {
  return src.replace(/\{ label: "パネル(?:種類)?", value: "([^"]*)" \}/g, (_full, value) => {
    return `{ label: "パネル", value: "${normalizeMonitorPanelDisplay(value)}" }`
  })
}

function normalizeMonitorFilterTagLines(src) {
  return src.replace(/monitorFilterTags: \[([^\]]*)\]/g, (full, inner, offset) => {
    const blockStart = src.lastIndexOf('\n    id: "', offset)
    const blockEnd = src.indexOf("\n  }", offset)
    const chunk = src.slice(
      blockStart >= 0 ? blockStart : Math.max(0, offset - 4000),
      blockEnd >= 0 ? blockEnd : offset + 4000,
    )

    let panel = null
    for (const m of chunk.matchAll(/\{ label: "パネル", value: "([^"]*)" \}/g)) {
      panel = m[1]
    }

    const tags = inner
      .split(",")
      .map((t) => t.trim().replace(/^"|"$/g, ""))
      .filter(Boolean)
      .filter((t) => !ALL_PANEL_TAGS.has(t))
      .map((t) => (t === "panel-tn-matte" ? "panel-tn" : t))

    const panelTag = panel ? panelDisplayToFilterTag(panel) : null
    if (panelTag) tags.push(panelTag)

    const unique = [...new Set(tags)]
    return `monitorFilterTags: [${unique.map((t) => `"${t}"`).join(",")}]`
  })
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "monitor"')) return false

  let next = src.replace(/\bAHVA\b/g, "IPS")
  next = next.replace(/"panel-tn-matte"/g, '"panel-tn"')
  next = normalizePanelFields(next)
  next = normalizeMonitorFilterTagLines(next)

  if (next === src) return false
  fs.writeFileSync(filePath, next)
  return true
}

let filesChanged = 0
for (const file of fs.readdirSync(LIB)) {
  if (!file.endsWith(".ts")) continue
  if (processFile(path.join(LIB, file))) {
    filesChanged++
    console.log("updated:", file)
  }
}

console.log(`Done. ${filesChanged} files updated.`)

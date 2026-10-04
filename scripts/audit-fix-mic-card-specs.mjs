/**
 * Bulk-fix mic card specs from connection field, title inference, and frequency cache.
 * Does NOT guess sample rates — only sets DASH for analog XLR-only mics.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { DASH, toSpecFormat } from "./mic-card-specs-known.mjs"
import { getMicCardSpecsForAsin } from "./amazon-mic-card-specs.mjs"
import { isJunkSpecValue, inferPolarFromText } from "./spec-value-sanitize.mjs"
import { formatMicConnectionDisplay, inferConnectionFromText } from "./mic-connection-format.mjs"
import { MIC_CONNECTION_KNOWN } from "./mic-connection-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const FIELDS = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

function inferPolar(title) {
  if (/4パターン|4つの指向性|指向性切替|指向性の変更|マルチパターン|multi-pattern|4指向性|multi-direction|multi direction|マルチダイレクション/i.test(title)) {
    return "指向性切替対応 (マルチパターン)"
  }
  if (/超単一指向|スーパーカーディオイド|supercardioid/i.test(title)) {
    return "超単一指向性 (スーパーカーディオイド)"
  }
  if (/全指向性|無指向性|360°|360˚|omnidirectional/i.test(title)) {
    return /360/.test(title) ? "全指向性 (360°)" : "全指向性"
  }
  if (/単一指向|カーディオイド|cardioid|unidirectional/i.test(title)) {
    return "単一指向性"
  }
  if (/双指向|bidirectional/i.test(title)) return "双指向性"
  return null
}

function inferSampleRateFromText(text) {
  if (!text) return null
  const t = text
  const m = t.match(/(\d+)\s*bit\s*[\/／]\s*(\d+(?:\.\d+)?)\s*kHz/i)
  if (m) return `${m[1]}bit / ${m[2]}kHz`
  const m2 = t.match(/(\d+(?:\.\d+)?)\s*kHz\s*[\/／]\s*(\d+)\s*bit/i)
  if (m2) return `${m2[1]}bit / ${m2[2]}kHz`
  if (/192\s*kHz.*24\s*bit|24\s*bit.*192\s*kHz/i.test(t)) return "192kHz/24bit"
  if (/96\s*kHz.*24\s*bit|24\s*bit.*96\s*kHz/i.test(t)) return "96kHz/24bit"
  if (/48\s*kHz.*24\s*bit|24\s*bit.*48\s*kHz/i.test(t)) return "48kHz/24bit"
  if (/48\s*kHz.*16\s*bit|16\s*bit.*48\s*kHz/i.test(t)) return "48kHz/16bit"
  if (/44\.1\s*kHz.*16\s*bit|16\s*bit.*44\.1\s*kHz/i.test(t)) return "44.1kHz/16bit"
  return null
}

function inferFrequencyFromText(text) {
  if (!text) return null
  const m = text.match(/(\d+)\s*Hz\s*[–—\-~〜～]\s*(\d+(?:\.\d+)?)\s*kHz/i)
  if (m) return `${m[1]}Hz-${m[2]}kHz`
  const m2 = text.match(/(\d+)\s*Hz\s*[–—\-~〜～]\s*(\d+)\s*Hz/i)
  if (m2) {
    const high = Number(m2[2])
    const highStr = high >= 1000 ? `${high / 1000}kHz` : `${high}Hz`
    return `${m2[1]}Hz-${highStr}`
  }
  return null
}

function inferConnection(connection, hay, asin) {
  return (
    MIC_CONNECTION_KNOWN[asin] ??
    (connection ? formatMicConnectionDisplay(connection) : null) ??
    inferConnectionFromText(hay) ??
    null
  )
}

function isEmpty(val) {
  return !val || val === DASH || val === "-" || val === "MISSING"
}

function needsFix(val, field) {
  return isEmpty(val) || isJunkSpecValue(val, field)
}

function getField(block, label) {
  const m = block.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
  return m?.[1]
}

function getConnection(block) {
  const m = block.match(/connection: "([^"]*)"/)
  return m?.[1]
}

function getTitleHaystack(block) {
  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  return `${name} ${tagline}`
}

function replaceField(block, label, value) {
  const re = new RegExp(`(\\{ label: "${label}", value: ")[^"]*(" \\})`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}$2`)
  return { block: next, changed: next !== block }
}

function updateBlock(block, asin) {
  let next = block
  let changed = false
  const hay = getTitleHaystack(block)
  const connection = getConnection(block)

  const known = getMicCardSpecsForAsin(asin, null, FIELDS)

  for (const field of FIELDS) {
    const current = getField(next, field)
    if (!needsFix(current, field)) continue
    const wasJunk = isJunkSpecValue(current, field)

    let value = known[field]?.highlight ?? null

    if ((!value || isJunkSpecValue(value, field)) && field === "接続方式") {
      value = inferConnection(connection, hay, asin)
    }
    if ((!value || isJunkSpecValue(value, field)) && field === "指向性") {
      value = inferPolar(hay) ?? inferPolarFromText(hay) ?? inferPolarFromText(current)
    }
    if (!value && field === "サンプルレート") {
      const terminal = getField(next, "接続方式") ?? getField(next, "端子") ?? inferConnection(connection, hay, asin) ?? ""
      if (/^xlr$/i.test(terminal.trim()) || (/xlr/i.test(terminal) && !/usb|type-c|bluetooth|2\.4/i.test(terminal))) {
        value = DASH
      }
    }

    if (wasJunk && (!value || isJunkSpecValue(value, field))) {
      value = DASH
    }

    if (!value) continue
    if (value === DASH && !wasJunk) continue

    const r1 = replaceField(next, field, value)
    next = r1.block
    if (r1.changed) changed = true

    const specVal = known[field]?.spec ?? toSpecFormat(value, field)
    const specStart = next.indexOf("specGroups:")
    if (specStart !== -1) {
      const specPart = next.slice(specStart)
      const re = new RegExp(`(\\{ label: "${field}", value: ")[^"]*(" \\})`, "g")
      const newSpec = specPart.replace(re, `$1${specVal}$2`)
      if (newSpec !== specPart) {
        next = next.slice(0, specStart) + newSpec
        changed = true
      }
    }
  }

  return { block: next, changed }
}

let total = 0
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue

  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  const out = src.replace(blockRe, (block, asin) => {
    const { block: next, changed } = updateBlock(block, asin)
    if (changed) total++
    return next
  })

  if (out !== src) writeFileSync(path, out)
}

console.log(`Fixed blocks: ${total}`)

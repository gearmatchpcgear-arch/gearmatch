/**
 * Apply refreshRate from spec override JSON + known spec maps to monitor TS files.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { MONITOR_LG_DISPLAY_SPECS_KNOWN } from "./monitor-lg-display-specs-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const DRY = process.argv.includes("--dry-run")

const REFRESH_TAGS = ["refresh-60", "refresh-75", "refresh-100", "refresh-144-plus", "refresh-240-plus"]

function loadOverrideMaps() {
  const byAsin = { ...MONITOR_LG_DISPLAY_SPECS_KNOWN }
  for (const file of readdirSync(__dirname)) {
    if (!file.endsWith("-spec-overrides.json") && file !== "monitor-spec-overrides.json") continue
    const data = JSON.parse(readFileSync(join(__dirname, file), "utf8"))
    for (const [asin, spec] of Object.entries(data)) {
      if (spec?.refreshRate) byAsin[asin] = { ...byAsin[asin], ...spec }
    }
  }
  return byAsin
}

function parseHz(value) {
  if (!value) return 0
  const m = String(value).match(/(\d{2,3})/)
  return m ? Number(m[1]) : 0
}

function formatRefresh(hz) {
  return `${hz}Hz`
}

function inferRefreshTags(hz) {
  const tags = []
  if (hz <= 60) tags.push("refresh-60")
  else if (hz === 75) tags.push("refresh-75")
  else if (hz < 144) tags.push("refresh-100")
  if (hz >= 144) tags.push("refresh-144-plus")
  if (hz >= 240) tags.push("refresh-240-plus")
  return tags
}

function patchBlock(blockText, hz) {
  const formatted = formatRefresh(hz)
  let next = blockText
  next = next.replace(
    /\{\s*label: "リフレッシュ",\s*value: "[^"]*"\s*\}/g,
    `{ label: "リフレッシュ", value: "${formatted}" }`,
  )
  next = next.replace(
    /\{\s*label: "リフレッシュレート",\s*value: "[^"]*"\s*\}/g,
    `{ label: "リフレッシュレート", value: "${formatted}" }`,
  )
  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const m = next.match(tagRe)
  if (m) {
    const existing = m[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean)
      .filter((t) => !REFRESH_TAGS.includes(t))
    const merged = [...existing, ...inferRefreshTags(hz)]
    next = next.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
  }
  return next
}

function parseBlocks(source) {
  const blocks = []
  const re = /(\{\s*\n\s*id: "(mon-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while ((m = re.exec(source))) {
    blocks.push({ id: m[2], block: m[1] })
  }
  return blocks
}

const byAsin = loadOverrideMaps()
const monitorFiles = readdirSync(LIB)
  .filter(
    (f) =>
      f.startsWith("monitor-") &&
      f.endsWith(".ts") &&
      !f.includes("arm") &&
      !f.includes("filter") &&
      !f.includes("detail") &&
      !f.includes("vesa"),
  )
  .map((f) => join(LIB, f))

let patched = 0
for (const file of monitorFiles) {
  let source = readFileSync(file, "utf8")
  let changed = false
  for (const b of parseBlocks(source)) {
    const hl = b.block.match(/\{\s*label: "リフレッシュ",\s*value: "([^"]*)"\s*\}/)?.[1] ?? "—"
    const spec =
      b.block.match(/\{\s*label: "リフレッシュレート",\s*value: "([^"]*)"\s*\}/)?.[1] ?? "—"
    if (hl !== "—" || spec !== "—") continue

    const asin =
      b.block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1] ?? null
    if (!asin || !byAsin[asin]?.refreshRate) continue

    const hz = parseHz(byAsin[asin].refreshRate)
    if (hz <= 0) continue

    const next = patchBlock(b.block, hz)
    if (next === b.block) continue
    source = source.replace(b.block, next)
    b.block = next
    changed = true
    patched++
    console.log(`${b.id}: → ${hz}Hz (ASIN ${asin})`)
  }
  if (changed && !DRY) writeFileSync(file, source)
}

console.log(`${DRY ? "[dry-run] " : ""}Patched ${patched} from overrides`)

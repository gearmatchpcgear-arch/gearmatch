/**
 * Scan mouse gadgets for missing button counts and auto-fill from name/tagline text.
 * Also patches mouse-specs-cache.json and regenerates generated TS files.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import {
  extractButtonCountFromText,
  applyButtonCountFromText,
} from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const GADGET_FILES = [
  join(ROOT, "lib", "mouse-popular-brands.ts"),
  join(ROOT, "lib", "mouse-bestsellers.ts"),
  join(ROOT, "lib", "gadgets.ts"),
]

const DASH = "—"
const MISSING = new Set([DASH, "-", "未設定", "", undefined, null])

function hasButtonCount(gadget) {
  const sensorGroup = gadget.specGroups?.find((g) => /センサー|入力/i.test(g.title))
  const row = sensorGroup?.rows.find((r) => r.label === "ボタン数")
  const raw = row?.value?.trim()
  return raw && !MISSING.has(raw)
}

function parseGadgetBlocks(content) {
  const blocks = []
  const re = /\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?\n\s*\},?\n(?=\s*\{|\s*\])/g
  let m
  while ((m = re.exec(content)) !== null) {
    const block = m[0]
    const id = m[1]
    const name = block.match(/name:\s*"((?:\\.|[^"\\])*)"/)?.[1]?.replace(/\\"/g, '"') ?? ""
    const tagline =
      block.match(/tagline:\s*"((?:\\.|[^"\\])*)"/)?.[1]?.replace(/\\"/g, '"') ?? ""
    const category = block.match(/category:\s*"([^"]+)"/)?.[1] ?? ""
    const specGroupsRaw = block.match(/specGroups:\s*(\[[\s\S]*?\]),\s*\n\s*(?:mouseFilterTags|compat)/)
    if (category !== "mouse" || !specGroupsRaw) continue

    let specGroups
    try {
      specGroups = JSON.parse(specGroupsRaw[1])
    } catch {
      continue
    }

    blocks.push({ id, name, tagline, block, specGroups, start: m.index, end: m.index + block.length })
  }
  return blocks
}

function patchGadgetFile(filePath) {
  let content = readFileSync(filePath, "utf8")
  const blocks = parseGadgetBlocks(content)
  let fixed = 0
  const fixes = []

  for (const b of blocks.reverse()) {
    const gadget = { name: b.name, tagline: b.tagline, specGroups: b.specGroups }
    if (hasButtonCount(gadget)) continue

    const count = extractButtonCountFromText(`${b.name} ${b.tagline}`)
    if (count === null) continue

    const next = applyButtonCountFromText(gadget)
    const sensorGroup = next.specGroups.find((g) => /センサー|入力/i.test(g.title))
    const newRow = sensorGroup?.rows.find((r) => r.label === "ボタン数")
    if (!newRow) continue

    const newSpecGroupsJson = JSON.stringify(next.specGroups)
    const oldSpecGroupsJson = JSON.stringify(b.specGroups)
    if (newSpecGroupsJson === oldSpecGroupsJson) continue

    const specMatch = b.block.match(/(specGroups:\s*)(\[[\s\S]*?\])(,\s*\n\s*(?:mouseFilterTags|compat))/)
    if (!specMatch) continue

    const newBlock = b.block.replace(
      specMatch[0],
      `${specMatch[1]}${newSpecGroupsJson}${specMatch[3]}`,
    )
    content = content.slice(0, b.start) + newBlock + content.slice(b.end)
    fixed++
    fixes.push({ id: b.id, name: b.name.slice(0, 60), count })
  }

  if (fixed > 0) writeFileSync(filePath, content)
  return { fixed, fixes }
}

function patchCache() {
  const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  let fixed = 0

  for (const [asin, entry] of Object.entries(cache)) {
    const title = entry.title ?? ""
    const sensorRows = entry.specs?.sensorRows ?? []
    const hasRow = sensorRows.some(
      (r) => r.label === "ボタン数" && r.value && !MISSING.has(r.value),
    )
    const metaCount = entry.specs?.meta?.buttonCount
    const metaValid =
      metaCount != null && Number.isFinite(metaCount) && metaCount >= 1 && metaCount <= 20

    if (hasRow && metaValid) continue

    const fromText = extractButtonCountFromText(title)
    if (fromText === null) continue

    if (!entry.specs) entry.specs = { sensorRows: [], meta: {} }
    if (!entry.specs.sensorRows) entry.specs.sensorRows = []
    if (!entry.specs.meta) entry.specs.meta = {}

    const idx = entry.specs.sensorRows.findIndex((r) => r.label === "ボタン数")
    if (idx >= 0) {
      entry.specs.sensorRows[idx].value = String(fromText)
    } else {
      entry.specs.sensorRows.push({ label: "ボタン数", value: String(fromText) })
    }
    entry.specs.meta.buttonCount = fromText
    console.log(`CACHE ${asin}: ${title.slice(0, 55)} → ${fromText}`)
    fixed++
  }

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
  return fixed
}

function countMissingInFile(filePath) {
  const blocks = parseGadgetBlocks(readFileSync(filePath, "utf8"))
  return blocks.filter((b) => !hasButtonCount({ specGroups: b.specGroups })).length
}

console.log("=== Before ===")
for (const f of GADGET_FILES) {
  console.log(`${f.replace(ROOT + "\\", "")}: ${countMissingInFile(f)} missing`)
}

const cacheFixed = patchCache()
console.log(`\nCache patched: ${cacheFixed}`)

console.log("\nRegenerating mouse-popular-brands.ts and mouse-bestsellers.ts...")
for (const script of ["merge-popular-brands.mjs", "merge-bestsellers.mjs"]) {
  const r = spawnSync("node", [join(__dirname, script)], { cwd: ROOT, encoding: "utf8" })
  if (r.status !== 0) {
    console.error(`FAIL ${script}:`, r.stderr || r.stdout)
    process.exit(1)
  }
  console.log(`OK ${script}`)
}

console.log("\n=== Patching remaining gadgets ===")
let totalFixed = 0
for (const f of GADGET_FILES) {
  const { fixed, fixes } = patchGadgetFile(f)
  if (fixes.length) {
    for (const x of fixes) console.log(`  ${x.id}: ${x.count} ← ${x.name}`)
  }
  console.log(`${f.replace(ROOT + "\\", "")}: ${fixed} patched`)
  totalFixed += fixed
}

console.log("\n=== After ===")
for (const f of GADGET_FILES) {
  console.log(`${f.replace(ROOT + "\\", "")}: ${countMissingInFile(f)} missing`)
}

console.log(`\nDone. Cache: ${cacheFixed}, TS files: ${totalFixed}`)

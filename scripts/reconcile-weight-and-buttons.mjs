/**
 * Bulk reconcile weight + button count from Amazon specs cache and browser extracts.
 * 1. Re-process browser-spec-batches with latest parser (oz→g, text fallbacks)
 * 2. Patch cache entries still missing weight/button from title text
 * 3. Fetch uncached ASINs (Node fetch; may fail on bot pages)
 * 4. Regenerate mouse-bestsellers.ts + mouse-popular-brands.ts
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import {
  parseAmazonMouseSpecs,
  extractWeightFromText,
  extractButtonCountFromText,
  formatWeight,
} from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const BATCH_DIR = join(__dirname, "browser-spec-batches")
const DASH = "—"
const MISSING = new Set([DASH, "-", "未設定", "", null, undefined])
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function buildHtml(entry) {
  const rows = Object.entries(entry.map ?? {})
    .map(
      ([k, v]) =>
        `<th class="prodDetSectionEntry">${k}</th><td class="prodDetAttrValue">${v}</td>`,
    )
    .join("")
  return [
    `<div id="productTitle">${entry.title ?? ""}</div>`,
    `<div id="feature-bullets">${entry.bullets ?? ""}</div>`,
    `<div id="productDescription">${entry.desc ?? ""}</div>`,
    `<table id="prodDetails">${rows}</table>`,
  ].join("")
}

function collectAsins() {
  const asins = new Map()
  for (const file of [
    "lib/mouse-bestsellers.ts",
    "lib/mouse-popular-brands.ts",
    "lib/gadgets.ts",
  ]) {
    const src = readFileSync(join(ROOT, file), "utf8")
    for (const m of src.matchAll(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g,
    )) {
      asins.set(m[1], true)
    }
  }
  return [...asins.keys()]
}

function isMissingWeight(specs) {
  const w = specs?.highlights?.weight?.trim?.() ?? specs?.highlights?.weight
  return MISSING.has(w)
}

function isMissingButton(specs) {
  const row = specs?.sensorRows?.find((r) => r.label === "ボタン数")
  const v = row?.value?.trim?.() ?? row?.value
  if (v && !MISSING.has(v)) return false
  const meta = specs?.meta?.buttonCount
  return !(meta != null && meta >= 1 && meta <= 20)
}

function upsertWeight(specs, weight) {
  if (!weight) return false
  specs.highlights.weight = weight
  const idx = specs.sizeRows.findIndex((r) => r.label === "重量")
  if (idx >= 0) specs.sizeRows[idx].value = weight
  else specs.sizeRows.push({ label: "重量", value: weight })
  return true
}

function upsertButton(specs, count) {
  if (count == null || !Number.isFinite(count) || count < 1 || count > 20) return false
  if (!specs.meta) specs.meta = {}
  specs.meta.buttonCount = count
  const idx = specs.sensorRows.findIndex((r) => r.label === "ボタン数")
  if (idx >= 0) specs.sensorRows[idx].value = String(count)
  else specs.sensorRows.push({ label: "ボタン数", value: String(count) })
  return true
}

function patchSpecsFromText(specs, title, extra = "") {
  const hay = `${title} ${extra}`.trim()
  let changed = false
  if (isMissingWeight(specs)) {
    const w = extractWeightFromText(hay)
    if (upsertWeight(specs, w)) changed = true
  }
  if (isMissingButton(specs)) {
    const c = extractButtonCountFromText(hay)
    if (upsertButton(specs, c)) changed = true
  }
  return changed
}

function auditCache(cache) {
  let missW = 0
  let missB = 0
  for (const entry of Object.values(cache)) {
    if (isMissingWeight(entry.specs)) missW++
    if (isMissingButton(entry.specs)) missB++
  }
  return { entries: Object.keys(cache).length, missW, missB }
}

function auditGadgetFiles() {
  let missW = 0
  let missB = 0
  let total = 0
  for (const file of ["lib/mouse-bestsellers.ts", "lib/mouse-popular-brands.ts"]) {
    const src = readFileSync(join(ROOT, file), "utf8")
    const blocks = [...src.matchAll(/category: "mouse"[\s\S]*?\n  \}/g)]
    for (const b of blocks) {
      total++
      const block = b[0]
      const w = block.match(/label: "重量", value: "([^"]*)"/)?.[1]
      if (!w || MISSING.has(w)) missW++
      const btn = block.match(/label: "ボタン数", value: "([^"]*)"/)
      if (!btn || MISSING.has(btn[1])) missB++
    }
  }
  return { total, missW, missB }
}

async function fetchPage(asin) {
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) return null
    const html = await res.text()
    if (html.includes("prodDetSectionEntry") || html.includes("productTitle")) return html
  } catch {}
  return null
}

// --- Step 0: baseline ---
console.log("=== Before ===")
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
console.log("Cache:", auditCache(cache))
console.log("Gadget files:", auditGadgetFiles())

// --- Step 1: re-process browser batches ---
let batchCount = 0
if (existsSync(BATCH_DIR)) {
  for (const file of readdirSync(BATCH_DIR).sort()) {
    if (!file.endsWith(".json")) continue
    for (const entry of JSON.parse(readFileSync(join(BATCH_DIR, file), "utf8"))) {
      if (!entry?.asin || entry.error) continue
      const html = buildHtml(entry)
      const title = entry.title ?? ""
      cache[entry.asin] = {
        asin: entry.asin,
        title,
        specs: parseAmazonMouseSpecs(html, title),
        fetchedAt: new Date().toISOString(),
        source: "browser-extract",
      }
      batchCount++
    }
  }
  console.log(`\nRe-processed ${batchCount} browser-extract entries`)
}

// --- Step 2: patch cache from title/text ---
let patched = 0
for (const [asin, entry] of Object.entries(cache)) {
  if (patchSpecsFromText(entry.specs, entry.title ?? "")) {
    patched++
  }
}
console.log(`Patched ${patched} cache entries from title/text`)

// --- Step 3: fetch missing / incomplete ASINs ---
const allAsins = collectAsins()
const needFetch = allAsins.filter((asin) => {
  const e = cache[asin]
  if (!e?.specs) return true
  return isMissingWeight(e.specs) || isMissingButton(e.specs)
})

console.log(`\nFetching up to ${needFetch.length} ASINs (missing cache or specs)...`)
let fetched = 0
let fetchFailed = 0
const fetchLimit = Number(process.env.FETCH_LIMIT ?? needFetch.length)

for (const asin of needFetch.slice(0, fetchLimit)) {
  await new Promise((r) => setTimeout(r, 1500))
  const html = await fetchPage(asin)
  if (!html) {
    fetchFailed++
    continue
  }
  const title =
    html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ?? ""
  const specs = parseAmazonMouseSpecs(html, title)
  cache[asin] = {
    asin,
    title: title || cache[asin]?.title || "",
    specs,
    fetchedAt: new Date().toISOString(),
    source: "node-fetch",
  }
  fetched++
  if (fetched % 5 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
    console.log(`  fetched ${fetched}...`)
  }
}
writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Fetch done: ${fetched} ok, ${fetchFailed} failed`)

// --- Step 4: regenerate TS files ---
for (const script of ["merge-popular-brands.mjs", "merge-bestsellers.mjs"]) {
  const r = spawnSync("node", [join(__dirname, script)], { cwd: ROOT, encoding: "utf8" })
  if (r.status !== 0) {
    console.error(`FAIL ${script}:`, r.stderr || r.stdout)
    process.exit(1)
  }
  console.log(`OK ${script}`)
}

console.log("\n=== After ===")
console.log("Cache:", auditCache(cache))
console.log("Gadget files:", auditGadgetFiles())

if (fetchFailed > 0) {
  console.log(`\nNote: ${fetchFailed} ASINs could not be fetched (Amazon bot block).`)
  console.log("Use browser-extract batches for those ASINs if further enrichment is needed.")
}

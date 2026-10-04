/**
 * Merge browser-fetched gpro page3 product pages into mouse-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs, formatWeight } from "./amazon-mouse-specs.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-gpro-page3-specs.json"
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "mouse-image-cache.json")
const OVERRIDES_PATH = join(__dirname, "mouse-gpro-page3-spec-overrides.json")

function toJaTable(flat, title) {
  const rows = []
  const map = {
    "Item Weight": "商品の重量",
    "Mouse Maximum Sensitivity": "マウス最大感度",
    "Button Quantity": "ボタン数",
    "Model Number": "型番",
    "Movement Detection": "ムーブメント検出技術",
    "Power Source": "電源",
    "Number of Batteries": "電池",
    センサー: "ムーブメント検出技術",
  }
  for (const [en, ja] of Object.entries(map)) {
    if (flat[en]) rows.push(`<tr><th>${ja}</th><td>${flat[en]}</td></tr>`)
  }
  if (flat["Connectivity Technology"]) {
    rows.push(
      `<tr><th>通信・接続インターフェース</th><td>${flat["Connectivity Technology"]}</td></tr>`,
    )
  }
  rows.push(`<tr><th>商品の追加説明1</th><td>${title}</td></tr>`)
  return `<table>${rows.join("")}</table>`
}

if (!existsSync(CDP_PATH)) {
  console.error(`Missing ${CDP_PATH}`)
  process.exit(1)
}

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const data = cdp.result?.value ?? cdp
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}

let updated = 0
for (const [asin, entry] of Object.entries(data)) {
  if (entry.error || !entry.title) continue
  const flat = entry.specs ?? {}
  const html = toJaTable(flat, entry.title)
  const parsed = parseAmazonMouseSpecs(html, entry.title)
  const o = overrides[asin] ?? {}

  if (o.weight) {
    parsed.highlights.weight = o.weight
    parsed.sizeRows = [{ label: "重量", value: o.weight }]
  } else if (flat["Item Weight"]) {
    const w = formatWeight(flat["Item Weight"])
    if (w && w !== "—") {
      parsed.highlights.weight = w
      parsed.sizeRows = [{ label: "重量", value: w }]
    }
  }

  if (o.reading) {
    parsed.highlights.reading = o.reading
    parsed.sensorRows = [
      { label: "読み取り方式", value: o.reading },
      ...parsed.sensorRows.filter((r) => r.label !== "読み取り方式"),
    ]
  }

  if (o.buttonCount) {
    parsed.sensorRows = [
      ...parsed.sensorRows.filter((r) => r.label !== "ボタン数"),
      { label: "ボタン数", value: o.buttonCount },
    ]
  }

  if (o.power) {
    parsed.powerRows = [{ label: "電源", value: o.power }, ...parsed.powerRows.filter((r) => r.label !== "電源")]
  }

  cache[asin] = {
    asin,
    title: entry.title,
    specs: parsed,
    price: entry.price ?? cache[asin]?.price ?? null,
    fetchedAt: new Date().toISOString(),
  }

  if (entry.image) {
    imageCache[asin] = {
      url: normalizeAmazonImageUrl(entry.image),
      source: "apply-gpro-page3-browser-specs",
    }
  }
  updated++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2) + "\n")
console.log(`Updated mouse-specs-cache: ${updated} ASINs`)

/**
 * Re-fetch Amazon pages for mice with missing reading method and update cache.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const readingOverrides = JSON.parse(
  readFileSync(join(__dirname, "reading-overrides.json"), "utf8"),
)
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function collectMissingReadingMice() {
  const files = [
    join(ROOT, "lib", "mouse-bestsellers.ts"),
    join(ROOT, "lib", "gadgets.ts"),
  ]
  const mice = []
  for (const file of files) {
    const src = readFileSync(file, "utf8")
    const re =
      /id: "([^"]+)"[\s\S]*?category: "mouse"[\s\S]*?name: "([^"]+)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[[\s\S]*?\{ label: "読み取り方式", value: "([^"]+)" \}/g
    let m
    while ((m = re.exec(src)) !== null) {
      if (m[4] === "—" || m[4] === "-") {
        mice.push({ id: m[1], name: m[2], asin: m[3] })
      }
    }
  }
  const byAsin = new Map()
  for (const item of mice) byAsin.set(item.asin, item)
  return [...byAsin.values()]
}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  return null
}

function mergeReadingIntoCacheEntry(entry, specs) {
  const reading = specs.highlights.reading
  if (!reading || reading === "—") return false

  entry.specs.highlights.reading = reading

  const hasReadingRow = entry.specs.sensorRows.some((r) => r.label === "読み取り方式")
  if (hasReadingRow) {
    entry.specs.sensorRows = entry.specs.sensorRows.map((r) =>
      r.label === "読み取り方式" ? { ...r, value: reading } : r,
    )
  } else {
    const insertAt = entry.specs.sensorRows.findIndex((r) => r.label === "最大 DPI")
    const row = { label: "読み取り方式", value: reading }
    if (insertAt >= 0) entry.specs.sensorRows.splice(insertAt + 1, 0, row)
    else entry.specs.sensorRows.unshift(row)
  }

  const movement = specs.meta?.movementRaw
  if (movement && !entry.specs.sensorRows.some((r) => r.label === "センサー")) {
    entry.specs.sensorRows.push({ label: "センサー", value: movement })
  }

  return true
}

const targets = collectMissingReadingMice()
console.log(`Missing reading: ${targets.length} mice`)

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

let updated = 0
let stillMissing = 0
let failed = 0

for (const { id, asin, name } of targets) {
  console.log(`\n${id} ${asin}`)
  await new Promise((r) => setTimeout(r, 1400))
  const html = await fetchPage(asin)
  if (!html) {
    console.warn("  fetch failed")
    failed++
    continue
  }
  const title =
    html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ??
    name
  const specs = parseAmazonMouseSpecs(html, title)
  console.log(`  reading: ${specs.highlights.reading}`)

  if (!cache[asin]) cache[asin] = { asin, title, specs, fetchedAt: new Date().toISOString() }
  else {
    cache[asin].title = title
    cache[asin].fetchedAt = new Date().toISOString()
    cache[asin].specs = { ...cache[asin].specs, ...specs }
  }

  if (specs.meta) cache[asin].specs.meta = { ...cache[asin].specs.meta, ...specs.meta }

  if (mergeReadingIntoCacheEntry(cache[asin], specs)) {
    updated++
  } else if (readingOverrides[asin]?.reading) {
    const reading = readingOverrides[asin].reading
    cache[asin].specs.highlights.reading = reading
    mergeReadingIntoCacheEntry(cache[asin], {
      highlights: { reading },
      meta: { movementRaw: null },
    })
    updated++
    console.log(`  override: ${reading}`)
  } else {
    stillMissing++
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`\ndone: updated ${updated}, still missing ${stillMissing}, failed ${failed}`)

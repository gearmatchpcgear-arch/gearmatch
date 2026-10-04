/**
 * Build mic-dynamic-bestsellers-raw.json from browser CDP scrape JSON string file.
 * Usage: node parse-mic-dynamic-cdp.mjs <items-json-file>
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isDynamicMicBodyTitle } from "./mic-dynamic-exclusions.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const inPath = process.argv[2]
if (!inPath) {
  console.error("Usage: node parse-mic-dynamic-cdp.mjs <items.json>")
  process.exit(1)
}

const SOURCE_URL =
  "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130075051"

let items
const rawText = readFileSync(inPath, "utf8")
try {
  const parsed = JSON.parse(rawText)
  items = Array.isArray(parsed) ? parsed : JSON.parse(parsed.result?.value ?? "[]")
} catch {
  console.error("Invalid JSON input")
  process.exit(1)
}

const raw = items.map((item) => ({
  amazonRank: item.amazonRank,
  asin: item.asin.toUpperCase(),
  title: item.title,
  rating: item.rating ?? 4.0,
  reviews: item.reviews ?? 0,
  price: item.price ?? null,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
  page: item.page,
}))

const excluded = raw.filter((item) => !isDynamicMicBodyTitle(item.title))
const microphones = raw.filter((item) => isDynamicMicBodyTitle(item.title))

writeFileSync(
  join(__dirname, "mic-dynamic-bestsellers-raw.json"),
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: SOURCE_URL,
      source: "browser-cdp-scrape",
      totalItems: raw.length,
      microphones,
      excluded,
      raw,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${microphones.length} mics, excluded ${excluded.length}, raw ${raw.length}`)
for (const x of excluded) {
  console.log(`  EXCLUDED #${x.amazonRank} ${x.asin} ${x.title.slice(0, 70)}`)
}

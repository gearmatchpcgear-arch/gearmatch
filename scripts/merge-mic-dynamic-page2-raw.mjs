/**
 * Merge page-2 browser scrape into mic-dynamic-bestsellers-raw.json
 * Usage: node merge-mic-dynamic-page2-raw.mjs <page2-items.json>
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isDynamicMicBodyTitle } from "./mic-dynamic-exclusions.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawPath = join(__dirname, "mic-dynamic-bestsellers-raw.json")
const inPath = process.argv[2]

if (!inPath) {
  console.error("Usage: node merge-mic-dynamic-page2-raw.mjs <page2-items.json>")
  process.exit(1)
}

const page2Items = JSON.parse(readFileSync(inPath, "utf8")).map((item) => ({
  amazonRank: item.amazonRank,
  asin: item.asin.toUpperCase(),
  title: item.title,
  rating: item.rating ?? 4.0,
  reviews: item.reviews ?? 0,
  price: item.price ?? null,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
  page: 2,
}))

const existing = existsSync(rawPath)
  ? JSON.parse(readFileSync(rawPath, "utf8"))
  : { raw: [], microphones: [], excluded: [] }

const page1Raw = (existing.raw ?? []).filter((i) => i.amazonRank < 51)
const page1Mics = page1Raw.filter((i) => isDynamicMicBodyTitle(i.title))

const raw = [...page1Raw, ...page2Items].sort((a, b) => a.amazonRank - b.amazonRank)
const excluded = raw.filter((i) => !isDynamicMicBodyTitle(i.title))
const microphones = raw.filter((i) => isDynamicMicBodyTitle(i.title))

writeFileSync(
  rawPath,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl:
        "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130075051",
      source: "browser-cdp-page2-merge",
      totalItems: raw.length,
      microphones,
      excluded,
      raw,
    },
    null,
    2,
  ),
)

const page2Kept = page2Items.filter((i) => isDynamicMicBodyTitle(i.title))
console.log(
  `Merged raw=${raw.length}, page1=${page1Raw.length}, page2 kept=${page2Kept.length}, excluded=${excluded.length}`,
)
for (const x of page2Items.filter((i) => !isDynamicMicBodyTitle(i.title))) {
  console.log(`  EXCLUDED #${x.amazonRank} ${x.asin} ${x.title.slice(0, 70)}`)
}

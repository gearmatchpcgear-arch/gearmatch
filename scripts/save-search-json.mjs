/**
 * Save browser CDP full search response → popular-brand-search.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const cdpFile = process.argv[2]
if (!cdpFile) {
  console.error("Usage: node scripts/save-search-json.mjs <cdp-response.json>")
  process.exit(1)
}

const raw = JSON.parse(readFileSync(cdpFile, "utf8"))
const parsed = JSON.parse(raw.result.value)
const OUT = join(dirname(fileURLToPath(import.meta.url)), "popular-brand-search.json")
writeFileSync(OUT, JSON.stringify(parsed, null, 2))
console.log(`Saved ${parsed.total ?? parsed.items?.length} mice → ${OUT}`)

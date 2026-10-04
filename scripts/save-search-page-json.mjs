/**
 * Save browser CDP extraction JSON to page file.
 * node scripts/save-search-page-json.mjs 2 '<json>'
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const page = process.argv[2]
const raw = process.argv[3]
if (!page || !raw) {
  console.error("Usage: node scripts/save-search-page-json.mjs <page> '<json>'")
  process.exit(1)
}
const out = join(__dirname, `monitor-search-22-120-page${page}.json`)
const data = JSON.parse(raw)
writeFileSync(out, JSON.stringify(data, null, 2) + "\n")
console.log(`Wrote ${out} (${data.length} items)`)

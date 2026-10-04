import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const page = process.argv[2]
if (!page) {
  console.error("Usage: node scripts/save-page-json-from-stdin.mjs <page>")
  process.exit(1)
}
let data = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => {
  data += chunk
})
process.stdin.on("end", () => {
  const parsed = JSON.parse(data)
  const out = join(__dirname, `monitor-search-22-120-page${page}.json`)
  writeFileSync(out, JSON.stringify(parsed, null, 2) + "\n")
  console.log(`Wrote ${out} (${parsed.length} items)`)
})

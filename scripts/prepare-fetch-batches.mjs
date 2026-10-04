/** Split need-fetch-asins.json into browser fetch batches. */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const need = JSON.parse(readFileSync(join(__dirname, "need-fetch-asins.json"), "utf8"))
const size = Number(process.argv[2] || 12)
const batches = []
for (let i = 0; i < need.needFetch.length; i += size) {
  batches.push(need.needFetch.slice(i, i + size))
}
writeFileSync(join(__dirname, "fetch-batches.json"), JSON.stringify({ batchSize: size, batches }, null, 2) + "\n")
console.log(`${batches.length} batches of up to ${size} (${need.needFetch.length} ASINs)`)

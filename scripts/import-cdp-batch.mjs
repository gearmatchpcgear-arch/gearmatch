/** Extract browser CDP Runtime.evaluate result and save as fetch batch. */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const cdpFile = process.argv[2]
const batchIdx = process.argv[3] ?? "00"
if (!cdpFile) {
  console.error("Usage: node scripts/import-cdp-batch.mjs <cdp-response.json> [batchIndex]")
  process.exit(1)
}

const cdp = JSON.parse(readFileSync(cdpFile, "utf8"))
const raw = cdp.result?.value
if (!raw) {
  console.error("No result.value in CDP response")
  process.exit(1)
}

const data = JSON.parse(raw)
const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "browser-spec-batches",
  `fetch-batch-${String(batchIdx).padStart(2, "0")}.json`,
)
writeFileSync(out, JSON.stringify(data, null, 2) + "\n")
console.log(`Saved ${data.length} entries → ${out}`)

/**
 * Save browser CDP extract response → scripts/browser-spec-batches/batch-NN.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cdpFile = process.argv[2]
const batchName = process.argv[3] || "batch-00"
if (!cdpFile) {
  console.error("Usage: node scripts/save-extract-batch.mjs <cdp.json> [batch-name]")
  process.exit(1)
}

const raw = JSON.parse(readFileSync(cdpFile, "utf8"))
const entries = JSON.parse(raw.result.value)
const dir = join(__dirname, "browser-spec-batches")
mkdirSync(dir, { recursive: true })
const out = join(dir, `${batchName}.json`)
writeFileSync(out, JSON.stringify(entries, null, 2))
console.log(`Saved ${entries.length} entries → ${out}`)

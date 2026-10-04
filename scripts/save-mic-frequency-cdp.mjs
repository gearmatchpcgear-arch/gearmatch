/** Save CDP Runtime.evaluate response → mic-frequency-batches/results-XX.json */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const cdpFile = process.argv[2]
const batchIdx = String(process.argv[3] ?? "00").padStart(2, "0")
if (!cdpFile) {
  console.error("Usage: node scripts/save-mic-frequency-cdp.mjs <cdp-response.json> [batchIndex]")
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
  "mic-frequency-batches",
  `results-${batchIdx}.json`,
)
writeFileSync(out, JSON.stringify(data, null, 2) + "\n")
const withFreq = data.filter((x) =>
  Object.keys(x.table ?? {}).some((k) => /frequency range|周波数範囲|周波数帯域/i.test(k)),
).length
console.log(`Saved ${data.length} entries → ${out} (${withFreq} with Frequency Range)`)

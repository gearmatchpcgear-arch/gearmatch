/**
 * Collect all mic ASINs + metadata for browser batch fetching.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT_DIR = join(__dirname, "mic-frequency-batches")

function collectMics() {
  const mics = []
  const seen = new Set()
  for (const file of readdirSync(join(ROOT, "lib"))) {
    if (!file.endsWith(".ts")) continue
    const src = readFileSync(join(ROOT, "lib", file), "utf8")
    if (!src.includes('category: "mic"')) continue
    const blockRe =
      /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = blockRe.exec(src)) !== null) {
      if (seen.has(m[4])) continue
      seen.add(m[4])
      mics.push({ id: m[1], name: m[2], brand: m[3], asin: m[4], file })
    }
  }
  return mics.sort((a, b) => a.asin.localeCompare(b.asin))
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const mics = collectMics()
const batchSize = 25
const batches = []
for (let i = 0; i < mics.length; i += batchSize) {
  batches.push(mics.slice(i, i + batchSize))
}

writeFileSync(join(__dirname, "mic-asins-all.json"), JSON.stringify(mics, null, 2))

for (let i = 0; i < batches.length; i++) {
  writeFileSync(join(OUT_DIR, `batch-${String(i).padStart(2, "0")}.json`), JSON.stringify(batches[i], null, 2))
}

console.log(`Mic ASINs: ${mics.length}, batches: ${batches.length} (${batchSize}/batch)`)

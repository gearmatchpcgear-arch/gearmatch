/**
 * Fetch all remaining spec batches via browser CDP helper.
 * Generates mega-batch ASIN arrays for CDP evaluate expressions.
 */
import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const batches = JSON.parse(readFileSync(join(__dirname, "batch-list.json"), "utf8"))
const done = new Set()
const dir = join(__dirname, "browser-spec-batches")
try {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue
    for (const e of JSON.parse(readFileSync(join(dir, f), "utf8"))) done.add(e.asin)
  }
} catch {}

const remaining = batches.asinBatches.flat().filter((a) => !done.has(a))
const megaSize = Number(process.argv[2] || 36)
const mega = []
for (let i = 0; i < remaining.length; i += megaSize) {
  mega.push(remaining.slice(i, i + megaSize))
}
writeFileSync(join(__dirname, "mega-batches.json"), JSON.stringify(mega, null, 2))
console.log(`remaining ${remaining.length}, mega batches ${mega.length}`)

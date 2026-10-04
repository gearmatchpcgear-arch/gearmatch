/**
 * Build remaining ASIN list after completed batches.
 */
import { readFileSync, readdirSync } from "fs"
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

const all = batches.asinBatches.flat()
const remaining = all.filter((a) => !done.has(a))
console.log(JSON.stringify({ done: done.size, remaining: remaining.length, asins: remaining }))

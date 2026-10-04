/**
 * Save page-2 browser scrape JSON (stdin) → monitor-refresh144-page2-browser-items.json
 * Usage: node save-page2-scrape.mjs < page2-scrape.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "monitor-refresh144-page2-browser-items.json")

let raw = ""
process.stdin.setEncoding("utf8")
for await (const chunk of process.stdin) raw += chunk
const items = JSON.parse(raw.trim())
writeFileSync(OUT, JSON.stringify(items, null, 2))
console.log(`Wrote ${OUT}: ${items.length} items`)

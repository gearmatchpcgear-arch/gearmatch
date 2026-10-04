/**
 * Extract browser scrape from CDP log → monitor-refresh144-browser-items.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  "C:/Users/mnmap/.cursor/browser-logs/cdp-response-Runtime.evaluate-2026-08-14T14-00-55-495Z.json"
const OUT_PATH = join(__dirname, "monitor-refresh144-browser-items.json")

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const parsed = JSON.parse(cdp.result.value)
writeFileSync(OUT_PATH, JSON.stringify(parsed.items, null, 2))
console.log(`Wrote ${OUT_PATH}: ${parsed.items.length} items`)

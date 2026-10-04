/**
 * モニター vesaStandard が "—" の件数を集計
 */
import { readFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const SKIP = new Set([
  "monitor-filter-tags.ts",
  "monitor-detail-specs.ts",
  "monitor-arm-filter-tags.ts",
])

let dash = 0
let filled = 0
const dashAsins = []

for (const file of readdirSync(LIB).filter(
  (f) => f.startsWith("monitor") && f.endsWith(".ts") && !SKIP.has(f) && !f.startsWith("monitor-arm"),
)) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe =
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?vesaStandard: "([^"]*)"/g
  let m
  while ((m = blockRe.exec(src))) {
    if (m[2] === "—") {
      dash++
      dashAsins.push({ asin: m[1], file, cacheVesa: cache[m[1]]?.vesaStandard ?? null })
    } else filled++
  }
}

const cacheCanFill = dashAsins.filter((x) => x.cacheVesa && x.cacheVesa !== "—").length
console.log(JSON.stringify({ dash, filled, cacheCanFill, stillMissing: dash - cacheCanFill }, null, 2))

/**
 * Print failed/missing monitor ASINs for browser batch fetch.
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const cache = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "monitor-body-specs-cache.json"), "utf8"),
)
const asins = Object.entries(cache)
  .filter(([, v]) => v.error === "fetch_failed" || (v.dimensions === "—" && v.weight === "—"))
  .map(([a]) => a)

console.log(JSON.stringify(asins))

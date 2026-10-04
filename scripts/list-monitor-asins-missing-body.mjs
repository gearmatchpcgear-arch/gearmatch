/**
 * List monitor ASINs still missing body specs in cache.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cache = JSON.parse(readFileSync(join(__dirname, "monitor-body-specs-cache.json"), "utf8"))
const asins = new Set()
for (const file of readdirSync(join(__dirname, "..", "lib"))) {
  if (!file.startsWith("monitor-") || !file.endsWith(".ts")) continue
  const src = readFileSync(join(__dirname, "..", "lib", file), "utf8")
  for (const m of src.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g)) {
    asins.add(m[1])
  }
}

const missing = [...asins].filter((asin) => {
  const e = cache[asin]
  if (!e) return true
  return e.dimensions === "—" && e.weight === "—"
})

console.log(JSON.stringify(missing))

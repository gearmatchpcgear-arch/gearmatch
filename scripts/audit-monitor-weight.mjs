/**
 * Audit monitor weight fill status across lib/*.ts
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const CACHE_PATH = join(dirname(fileURLToPath(import.meta.url)), "monitor-body-specs-cache.json")

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

const items = []
const blockRe =
  /id: "([^"]+)"[\s\S]*?category: "monitor"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "monitor"')) continue
  let m
  while ((m = blockRe.exec(src))) {
    const block = m[0]
    const weights = [...block.matchAll(/label: "重量", value: "([^"]*)"/g)].map((x) => x[1])
    const isMissing = weights.length === 0 || weights.every((v) => v === DASH || v === "-" || v === "")
    items.push({
      id: m[1],
      asin: m[2],
      file,
      weights,
      missing: isMissing,
      cache: cache[m[2]] ?? null,
    })
  }
}

const missing = items.filter((i) => i.missing)
const cacheHasWeight = missing.filter((i) => i.cache?.weight && i.cache.weight !== DASH)
const cacheMissing = missing.filter((i) => !i.cache?.weight || i.cache.weight === DASH)

console.log(`Total monitors: ${items.length}`)
console.log(`Missing weight in data: ${missing.length}`)
console.log(`Missing but cache has weight: ${cacheHasWeight.length}`)
console.log(`Missing and cache has no weight: ${cacheMissing.length}`)

writeFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "monitor-weight-missing.json"),
  JSON.stringify({ missing, cacheHasWeight, cacheMissing }, null, 2),
)

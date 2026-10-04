/**
 * Backfill scripts/asin-title-cache.json image fields from lib/*.ts gadget.image values.
 * Prevents empty live-fetch results from wiping known-good Amazon image URLs.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { isValidAmazonProductImage, normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
let updated = 0

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[1]
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    const image = block.match(/\bimage: "([^"]*)"/)?.[1]
    if (!asin || !isValidAmazonProductImage(image)) continue
    const normalized = normalizeAmazonImageUrl(image)
    const prev = cache[asin]
    if (prev?.image === normalized) continue
    cache[asin] = {
      asin,
      title: prev?.title ?? "",
      image: normalized,
      fetchedAt: new Date().toISOString(),
      source: prev?.source ?? "gadget-data",
    }
    updated++
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Backfilled ${updated} ASIN image entries in asin-title-cache.json`)

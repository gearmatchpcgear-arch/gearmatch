/**
 * lib/*.ts の rating / reviews を正規化（ダミー値削除・キャッシュ反映）。
 * Usage: npx tsx scripts/sanitize-gadget-reviews.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { sanitizeAmazonListingRatingReviews } from "./amazon-listing-rating-parse.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const LIB = path.join(ROOT, "lib")
const CACHE_PATH = path.join(__dirname, "amazon-review-cache.json")
const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {}

function parsePurchaseAsin(block) {
  return (
    block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1] ??
    block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/gp\/product\/([A-Z0-9]{10})"/)?.[1] ??
    null
  )
}

function parseNumberField(block, field) {
  const m = block.match(new RegExp(`${field}: ([\\d.]+)`))
  return m ? Number(m[1]) : null
}

function replaceScalarField(block, field, value) {
  const re = new RegExp(`(${field}: )([\\d.]+)`, "m")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}`)
  return { block: next, changed: next !== block }
}

function resolveTargetMeta(block, asin) {
  const currentRating = parseNumberField(block, "rating")
  const currentReviews = parseNumberField(block, "reviews")
  const cached = asin ? cache[asin] : null

  if (cached?.ok) {
    return sanitizeAmazonListingRatingReviews(cached.rating, cached.reviews)
  }

  if (
    cached &&
    cached.ok === false &&
    cached.reviews == null &&
    cached.rating == null
  ) {
    return { rating: 0, reviews: 0 }
  }

  return sanitizeAmazonListingRatingReviews(currentRating, currentReviews)
}

let totalUpdated = 0
const fileUpdates = []

for (const file of fs.readdirSync(LIB)) {
  if (!file.endsWith(".ts")) continue
  const filePath = path.join(LIB, file)
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes("rating:") || !src.includes("reviews:")) continue

  let updated = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?\n  \}(?:,|\n)/g

  src = src.replace(blockRe, (block) => {
    const asin = parsePurchaseAsin(block)
    const target = resolveTargetMeta(block, asin)
    const currentRating = parseNumberField(block, "rating")
    const currentReviews = parseNumberField(block, "reviews")

    if (currentRating === target.rating && currentReviews === target.reviews) {
      return block
    }

    let next = block
    let changed = false
    for (const [field, value] of [
      ["rating", target.rating],
      ["reviews", target.reviews],
    ]) {
      const result = replaceScalarField(next, field, value)
      next = result.block
      if (result.changed) changed = true
    }

    if (changed) updated++
    return next
  })

  if (updated > 0) {
    fs.writeFileSync(filePath, src)
    fileUpdates.push({ file, updated })
    totalUpdated += updated
  }
}

console.log(`Sanitized ${totalUpdated} gadget blocks`)
for (const { file, updated } of fileUpdates) {
  console.log(`  ${file}: ${updated}`)
}

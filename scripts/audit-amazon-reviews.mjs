/**
 * Audit rating/reviews consistency across gadget source files.
 * - duplicate ASINs with different stored rating/reviews
 * - suspicious low ratings with high review counts
 * - mismatch vs amazon-review-cache.json
 *
 * Usage: npx tsx scripts/audit-amazon-reviews.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const LIB = path.join(ROOT, "lib")
const CACHE_PATH = path.join(__dirname, "amazon-review-cache.json")
const REPORT_PATH = path.join(__dirname, "audit-amazon-reviews-report.json")

const cache = fs.existsSync(CACHE_PATH)
  ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"))
  : {}

function parseNumberField(block, field) {
  const m = block.match(new RegExp(`${field}: ([\\d.]+)`))
  return m ? Number(m[1]) : null
}

function parsePurchaseAsin(block) {
  return (
    block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1] ??
    block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/gp\/product\/([A-Z0-9]{10})"/)?.[1] ??
    null
  )
}

function collectGadgetEntries() {
  const entries = []
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?\n  \}(?:,|\n)/g

  for (const file of fs.readdirSync(LIB)) {
    if (!file.endsWith(".ts")) continue
    const src = fs.readFileSync(path.join(LIB, file), "utf8")
    if (!src.includes("purchaseUrl:")) continue

    for (const match of src.matchAll(blockRe)) {
      const block = match[0]
      const id = match[1]
      const asin = parsePurchaseAsin(block)
      if (!asin) continue

      entries.push({
        id,
        file,
        asin,
        category: block.match(/category: "([^"]+)"/)?.[1] ?? "unknown",
        name: block.match(/name: "([^"]+)"/)?.[1] ?? id,
        rating: parseNumberField(block, "rating"),
        reviews: parseNumberField(block, "reviews"),
      })
    }
  }

  return entries
}

function isSuspiciousRating(rating, reviews) {
  return (
    rating != null &&
    Number.isFinite(rating) &&
    reviews != null &&
    Number.isFinite(reviews) &&
    reviews >= 100 &&
    rating <= 1.5
  )
}

function differs(a, b, tolerance = 0.05) {
  if (a == null || b == null) return false
  return Math.abs(a - b) > tolerance
}

const entries = collectGadgetEntries()
const byAsin = new Map()

for (const entry of entries) {
  const list = byAsin.get(entry.asin) ?? []
  list.push(entry)
  byAsin.set(entry.asin, list)
}

const duplicateAsinConflicts = []
for (const [asin, list] of byAsin) {
  if (list.length < 2) continue
  const ratings = new Set(list.map((e) => e.rating))
  const reviews = new Set(list.map((e) => e.reviews))
  if (ratings.size > 1 || reviews.size > 1) {
    duplicateAsinConflicts.push({ asin, entries: list })
  }
}

const suspicious = entries.filter((e) => isSuspiciousRating(e.rating, e.reviews))

const cacheMismatches = []
for (const entry of entries) {
  const cached = cache[entry.asin]
  if (!cached?.ok) continue
  const ratingDiff = differs(entry.rating, cached.rating)
  const reviewDiff =
    entry.reviews != null &&
    cached.reviews != null &&
    Math.abs(entry.reviews - cached.reviews) > Math.max(5, cached.reviews * 0.05)
  if (ratingDiff || reviewDiff) {
    cacheMismatches.push({
      id: entry.id,
      asin: entry.asin,
      name: entry.name,
      file: entry.file,
      stored: { rating: entry.rating, reviews: entry.reviews },
      cached: { rating: cached.rating, reviews: cached.reviews, fetchedAt: cached.fetchedAt },
    })
  }
}

const missing = entries.filter(
  (e) =>
    e.rating == null ||
    !Number.isFinite(e.rating) ||
    e.rating <= 0 ||
    e.reviews == null ||
    !Number.isFinite(e.reviews) ||
    e.reviews <= 0,
)

const report = {
  totalWithAsin: entries.length,
  uniqueAsins: byAsin.size,
  duplicateAsinConflicts: duplicateAsinConflicts.length,
  suspiciousRatings: suspicious.length,
  cacheMismatches: cacheMismatches.length,
  missingRatingOrReviews: missing.length,
  samples: {
    duplicateAsinConflicts: duplicateAsinConflicts.slice(0, 20),
    suspicious: suspicious.slice(0, 30),
    cacheMismatches: cacheMismatches.slice(0, 50),
    missing: missing.slice(0, 30),
  },
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

console.log("Amazon review audit")
console.log(JSON.stringify(report, null, 2))
console.log(`Report: ${REPORT_PATH}`)

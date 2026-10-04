/**
 * Fetch Amazon.co.jp rating & review count and patch lib/*.ts gadget sources.
 *
 * Usage:
 *   npx tsx scripts/update-amazon-reviews.mjs --list
 *   npx tsx scripts/update-amazon-reviews.mjs --apply --limit=20
 *   npx tsx scripts/update-amazon-reviews.mjs --apply --playwright
 *   npx tsx scripts/update-amazon-reviews.mjs --apply --all
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  AMAZON_FETCH_HEADERS,
  extractAmazonRatingAndReviews,
  fetchAmazonProductHtml,
} from "./amazon-review-meta.mjs"
import { sanitizeAmazonListingRatingReviews } from "./amazon-listing-rating-parse.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const LIB = path.join(ROOT, "lib")
const CACHE_PATH = path.join(__dirname, "amazon-review-cache.json")
const REPORT_PATH = path.join(__dirname, "update-amazon-reviews-report.json")

const LIST = process.argv.includes("--list")
const APPLY = process.argv.includes("--apply")
const ALL = process.argv.includes("--all")
const RESYNC_ALL = process.argv.includes("--resync-all")
const USE_PLAYWRIGHT = process.argv.includes("--playwright")
const REFRESH = process.argv.includes("--refresh")
const RETRY_FAILED = process.argv.includes("--retry-failed")
const ONLY_ASIN = process.argv.find((a) => a.startsWith("--asin="))?.split("=")[1]?.toUpperCase()
const limitArg = process.argv.find((a) => a.startsWith("--limit="))
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null

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

      const category = block.match(/category: "([^"]+)"/)?.[1] ?? "unknown"
      entries.push({
        id,
        file,
        asin,
        category,
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

function isMissingRating(value) {
  return value == null || !Number.isFinite(value) || value <= 0
}

function isMissingReviews(value) {
  return value == null || !Number.isFinite(value) || value <= 0
}

function differsFromCache(entry) {
  const cached = cache[entry.asin]
  if (!cached?.ok) return false
  const ratingDiff =
    entry.rating != null &&
    cached.rating != null &&
    Math.abs(entry.rating - cached.rating) > 0.05
  const reviewDiff =
    entry.reviews != null &&
    cached.reviews != null &&
    Math.abs(entry.reviews - cached.reviews) > Math.max(5, cached.reviews * 0.05)
  return ratingDiff || reviewDiff
}

function needsUpdate(entry) {
  if (!entry.asin) return false
  if (ALL || RESYNC_ALL) return true
  return (
    isMissingRating(entry.rating) ||
    isMissingReviews(entry.reviews) ||
    isSuspiciousRating(entry.rating, entry.reviews) ||
    differsFromCache(entry)
  )
}

function replaceScalarField(block, field, value) {
  const re = new RegExp(`(${field}: )([\\d.]+)`, "m")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}`)
  return { block: next, changed: next !== block }
}

function updateBlockReviews(block, meta) {
  let next = block
  let changed = false
  const sanitized = sanitizeAmazonListingRatingReviews(meta.rating, meta.reviews)

  for (const [field, value] of [
    ["rating", sanitized.rating],
    ["reviews", sanitized.reviews],
  ]) {
    if (value == null || !Number.isFinite(value)) continue
    const result = replaceScalarField(next, field, field === "reviews" ? Math.round(value) : value)
    next = result.block
    if (result.changed) changed = true
  }

  return { block: next, changed }
}

function clearRatingsWithoutReviews(entries) {
  const idsToClear = new Set(
    entries.filter((e) => e.reviews === 0).map((e) => `${e.file}:${e.id}`),
  )
  if (idsToClear.size === 0) return { blocksCleared: 0, fileUpdates: [] }

  const byFile = new Map()
  for (const entry of entries) {
    if (entry.reviews !== 0 || entry.rating == null || entry.rating <= 0) continue
    if (!byFile.has(entry.file)) byFile.set(entry.file, new Set())
    byFile.get(entry.file).add(entry.id)
  }

  let blocksCleared = 0
  const fileUpdates = []

  for (const [file, ids] of byFile) {
    const filePath = path.join(LIB, file)
    let src = fs.readFileSync(filePath, "utf8")
    const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?\n  \}(?:,|\n)/g
    let fileChanged = 0

    src = src.replace(blockRe, (block, id) => {
      if (!ids.has(id)) return block
      const reviews = parseNumberField(block, "reviews")
      const rating = parseNumberField(block, "rating")
      if (reviews !== 0 || rating == null || rating <= 0) return block
      const { block: next, changed } = replaceScalarField(block, "rating", 0)
      if (changed) {
        fileChanged++
        blocksCleared++
      }
      return next
    })

    if (fileChanged > 0) {
      fs.writeFileSync(filePath, src)
      fileUpdates.push({ file, blocks: fileChanged })
    }
  }

  return { blocksCleared, fileUpdates }
}

async function fetchWithPlaywright(asin) {
  const { chromium } = await import("playwright")
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext({
      locale: "ja-JP",
      userAgent: AMAZON_FETCH_HEADERS["User-Agent"],
    })
    const page = await context.newPage()
    await page.waitForTimeout(1200)
    const res = await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    })
    if (!res?.ok()) throw new Error(`HTTP ${res.status()}`)
    const html = await page.content()
    await context.close()
    return html
  } finally {
    await browser.close()
  }
}

async function fetchMetaForAsin(asin, playwrightPage = null) {
  if (!REFRESH && cache[asin]?.ok) {
    return cache[asin]
  }

  let html = null
  let source = USE_PLAYWRIGHT || playwrightPage ? "playwright" : "fetch"

  if (playwrightPage) {
    try {
      await playwrightPage.waitForTimeout(1200)
      const res = await playwrightPage.goto(`https://www.amazon.co.jp/dp/${asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      })
      if (!res?.ok()) throw new Error(`HTTP ${res.status()}`)
      html = await playwrightPage.content()
    } catch (err) {
      cache[asin] = {
        ...(cache[asin] ?? {}),
        asin,
        ok: false,
        error: String(err.message ?? err),
        fetchedAt: new Date().toISOString(),
        source,
      }
      return cache[asin]
    }
  } else if (!USE_PLAYWRIGHT) {
    try {
      html = await fetchAmazonProductHtml(asin)
      source = "fetch"
    } catch (err) {
      cache[asin] = {
        ...(cache[asin] ?? {}),
        asin,
        ok: false,
        error: String(err.message ?? err),
        fetchedAt: new Date().toISOString(),
        source: "fetch",
      }
      return cache[asin]
    }
  } else {
    html = await fetchWithPlaywright(asin)
  }

  const parsed = extractAmazonRatingAndReviews(html, asin)
  cache[asin] = {
    asin,
    rating: parsed.rating,
    reviews: parsed.reviews,
    ok: parsed.ok,
    source: parsed.source ?? source,
    error: parsed.ok ? undefined : "parse_failed",
    fetchedAt: new Date().toISOString(),
  }

  return cache[asin]
}

function saveCache() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

function applyUpdates(entries, metaByAsin) {
  const byFile = new Map()

  for (const entry of entries) {
    const meta = metaByAsin.get(entry.asin)
    if (!meta?.ok) continue

    if (!byFile.has(entry.file)) byFile.set(entry.file, [])
    byFile.get(entry.file).push({ id: entry.id, meta })
  }

  let blocksUpdated = 0
  const fileUpdates = []

  for (const [file, updates] of byFile) {
    const filePath = path.join(LIB, file)
    let src = fs.readFileSync(filePath, "utf8")
    const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?\n  \}(?:,|\n)/g
    const updateById = new Map(updates.map((u) => [u.id, u.meta]))
    let fileChanged = 0

    src = src.replace(blockRe, (block, id) => {
      const meta = updateById.get(id)
      if (!meta) return block
      const { block: next, changed } = updateBlockReviews(block, meta)
      if (changed) {
        fileChanged++
        blocksUpdated++
      }
      return next
    })

    if (fileChanged > 0) {
      fs.writeFileSync(filePath, src)
      fileUpdates.push({ file, blocks: fileChanged })
    }
  }

  return { blocksUpdated, fileUpdates }
}

const allEntries = collectGadgetEntries()
const targetEntries = RESYNC_ALL ? allEntries : allEntries.filter(needsUpdate)
const uniqueAsins = [...new Set((RESYNC_ALL ? allEntries : targetEntries).map((e) => e.asin))]

let asinsToFetch = ONLY_ASIN ? [ONLY_ASIN] : [...uniqueAsins]
if (RETRY_FAILED) {
  asinsToFetch = asinsToFetch.filter((asin) => cache[asin]?.ok !== true)
}
if (LIMIT != null && Number.isFinite(LIMIT)) {
  asinsToFetch = asinsToFetch.slice(0, LIMIT)
}

const summary = {
  totalGadgets: allEntries.length,
  targetGadgets: targetEntries.length,
  uniqueAsins: uniqueAsins.length,
  asinsToFetch: asinsToFetch.length,
  missingRating: allEntries.filter((e) => isMissingRating(e.rating)).length,
  missingReviews: allEntries.filter((e) => isMissingReviews(e.reviews)).length,
  missingBoth: allEntries.filter(
    (e) => isMissingRating(e.rating) && isMissingReviews(e.reviews),
  ).length,
}

console.log("Amazon review sync")
console.log(JSON.stringify(summary, null, 2))

if (LIST && !APPLY) {
  console.log("\nSample targets (first 30):")
  for (const entry of targetEntries.slice(0, 30)) {
    console.log(
      `  ${entry.id} | ${entry.asin} | rating=${entry.rating ?? "—"} reviews=${entry.reviews ?? "—"} | ${entry.file}`,
    )
  }
  console.log("\nDry run only. Re-run with --apply to fetch and patch.")
  process.exit(0)
}

if (!APPLY) {
  console.log("\nDry run only. Re-run with --apply to fetch and patch.")
  process.exit(0)
}

const metaByAsin = new Map()
let fetched = 0
let failed = 0

let playwrightBrowser = null
let playwrightPage = null

if (USE_PLAYWRIGHT) {
  const { chromium } = await import("playwright")
  playwrightBrowser = await chromium.launch({ headless: true })
  const context = await playwrightBrowser.newContext({
    locale: "ja-JP",
    userAgent: AMAZON_FETCH_HEADERS["User-Agent"],
  })
  playwrightPage = await context.newPage()
}

try {
  for (const asin of asinsToFetch) {
    if (!REFRESH && cache[asin]?.ok) {
      metaByAsin.set(asin, cache[asin])
      fetched++
      continue
    }

    process.stdout.write(`fetch ${asin}... `)
    if (!USE_PLAYWRIGHT) {
      await new Promise((r) => setTimeout(r, 1100))
    }
    const meta = await fetchMetaForAsin(asin, playwrightPage)
    metaByAsin.set(asin, meta)
    if (meta.ok) {
      fetched++
      console.log(`OK rating=${meta.rating} reviews=${meta.reviews} (${meta.source})`)
    } else {
      failed++
      console.log(`FAILED (${meta.error ?? "unknown"})`)
    }
    if ((fetched + failed) % 10 === 0) saveCache()
  }
} finally {
  if (playwrightBrowser) await playwrightBrowser.close()
}

saveCache()

const affectedEntries = RESYNC_ALL
  ? allEntries.filter((e) => asinsToFetch.includes(e.asin))
  : targetEntries.filter((e) => asinsToFetch.includes(e.asin))
const { blocksUpdated, fileUpdates } = applyUpdates(affectedEntries, metaByAsin)
const { blocksCleared, fileUpdates: clearedFiles } = clearRatingsWithoutReviews(allEntries)

const report = {
  ...summary,
  fetched,
  failed,
  blocksUpdated,
  blocksCleared,
  fileUpdates,
  clearedFiles,
  completedAt: new Date().toISOString(),
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

console.log("\nDone")
console.log(`Fetched OK: ${fetched}, failed: ${failed}`)
console.log(`Blocks updated: ${blocksUpdated}`)
console.log(`Placeholder ratings cleared: ${blocksCleared}`)
for (const { file, blocks } of fileUpdates) {
  console.log(`  ${file}: ${blocks}`)
}
if (blocksCleared > 0) {
  console.log("Cleared rating without reviews:")
  for (const { file, blocks } of clearedFiles) {
    console.log(`  ${file}: ${blocks}`)
  }
}
console.log(`Report: ${REPORT_PATH}`)

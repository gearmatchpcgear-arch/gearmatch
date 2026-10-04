/**
 * Backfill price: null gadgets from overrides, spec cache, and Amazon.co.jp.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonPrice } from "./amazon-price.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OVERRIDES_PATH = join(__dirname, "mouse-overrides.json")
const SPEC_CACHE_PATH = join(__dirname, "mouse-specs-cache.json")

const USER_PRICES = {
  B0FG2N6QYX: 2399, // Womier G706
  B09C13PZX7: 9305, // Razer Basilisk V3
}

const FILES = [
  "lib/gadgets.ts",
  "lib/mouse-bestsellers.ts",
  "lib/mouse-gaming-bestsellers.ts",
  "lib/mouse-popular-brands.ts",
]

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const SEARCH_PATH = join(__dirname, "popular-brand-search.json")
const searchByAsin = existsSync(SEARCH_PATH)
  ? Object.fromEntries(
      JSON.parse(readFileSync(SEARCH_PATH, "utf8")).items.map((i) => [i.asin, i.price]),
    )
  : {}
const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
const specCache = JSON.parse(readFileSync(SPEC_CACHE_PATH, "utf8"))

function collectNullPriceGadgets() {
  const items = []
  for (const rel of FILES) {
    const src = readFileSync(join(ROOT, rel), "utf8")
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(src)) !== null) {
      const asin = m[1]
      const marker = `/dp/${asin}"`
      const idx = src.indexOf(marker, m.index)
      const start = src.lastIndexOf("\n  {", idx)
      const end = src.indexOf("\n  },", idx)
      if (start < 0 || end < 0) continue
      const block = src.slice(start, end)
      const id = block.match(/id: "([^"]+)"/)?.[1]
      if (!/price: null/.test(block)) continue
      items.push({ file: rel, id, asin })
    }
  }
  return items
}

async function fetchAmazonPrice(asin) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      const html = await res.text()
      const price = parseAmazonPrice(html)
      if (price) return price
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2500 * (i + 1)))
  }
  return null
}

function resolvePrice(asin) {
  if (USER_PRICES[asin] != null) return USER_PRICES[asin]
  if (overrides[asin]?.price != null) return overrides[asin].price
  if (specCache[asin]?.price != null) return specCache[asin].price
  const searchPrice = searchByAsin[asin]
  if (searchPrice != null && searchPrice > 0) return searchPrice
  return null
}

function patchFile(rel, asin, price) {
  const path = join(ROOT, rel)
  let src = readFileSync(path, "utf8")
  const marker = `/dp/${asin}"`
  const idx = src.indexOf(marker)
  if (idx < 0) return "skip"

  const start = src.lastIndexOf("\n  {", idx)
  const end = src.indexOf("\n  },", idx)
  if (start < 0 || end < 0) return "skip"
  const block = src.slice(start, end + "\n  },".length)
  if (!/price: (null|\d+)/.test(block)) return "skip"
  const current = block.match(/price: (null|\d+)/)?.[1]
  if (current !== "null" && USER_PRICES[asin] == null) return "skip"
  const newBlock = block.replace(/price: (null|\d+)/, `price: ${price}`)
  if (newBlock === block) return "skip"
  src = src.slice(0, start) + newBlock + src.slice(end + "\n  },".length)
  writeFileSync(path, src)
  return current === "null" ? "patched" : "updated"
}

async function main() {
  const items = collectNullPriceGadgets()
  console.log(`null price gadgets: ${items.length}`)

  const prices = {}
  let fetched = 0
  let failed = 0

  for (const item of items) {
    let price = resolvePrice(item.asin)
    if (price == null) {
      console.log(`fetch ${item.asin} (${item.id})...`)
      await new Promise((r) => setTimeout(r, 2800))
      price = await fetchAmazonPrice(item.asin)
      if (price) {
        fetched++
        if (!overrides[item.asin]) overrides[item.asin] = {}
        overrides[item.asin].price = price
        overrides[item.asin].source = "Amazon.co.jp 商品ページ（2026-08-13 確認）"
      } else {
        failed++
        console.warn(`  failed ${item.asin}`)
        continue
      }
    }
    prices[item.asin] = price
  }

  for (const [asin, price] of Object.entries(USER_PRICES)) {
    if (!overrides[asin]) overrides[asin] = {}
    overrides[asin].price = price
    overrides[asin].source = "ユーザー指定価格（2026-08-13）"
    prices[asin] = price
  }

  writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2) + "\n")

  let patched = 0
  let updated = 0
  for (const item of items) {
    const price = prices[item.asin]
    if (price == null) continue
    const result = patchFile(item.file, item.asin, price)
    if (result === "patched") patched++
    if (result === "updated") updated++
  }

  for (const [asin, price] of Object.entries(USER_PRICES)) {
    for (const rel of FILES) {
      const result = patchFile(rel, asin, price)
      if (result === "updated") updated++
    }
  }

  const remaining = collectNullPriceGadgets()
  console.log(
    `done: fetched ${fetched}, failed ${failed}, patched ${patched}, updated ${updated}, remaining null ${remaining.length}`,
  )
  if (remaining.length) {
    for (const x of remaining) console.log(`  still null: ${x.asin} ${x.id}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

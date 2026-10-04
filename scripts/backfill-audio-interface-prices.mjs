/**
 * オーディオIF: price: 0 / null を Amazon から取得して lib/audio-interface-bestsellers.ts を更新
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonPrice } from "./amazon-price.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const TARGET = join(ROOT, "lib", "audio-interface-bestsellers.ts")
const CACHE_PATH = join(__dirname, "audio-interface-price-cache.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

/** ユーザー確認済み・手動（Amazon 2026-08-15） */
const MANUAL = {
  B07C2KLXCD: 30228, // Steinberg UR-RT2
}

function findBlockBounds(src, idx) {
  const start = src.lastIndexOf("\n  {", idx)
  if (start < 0) return null
  let end = src.indexOf("\n  },", idx)
  let endLen = "\n  },".length
  if (end < 0) {
    end = src.indexOf("\n  }\n", idx)
    endLen = "\n  }".length
  }
  if (end < 0) return null
  return { start, end, endLen }
}

function collectZeroPriceAsins() {
  const src = readFileSync(TARGET, "utf8")
  const asins = []
  const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = re.exec(src)) !== null) {
    const asin = m[1]
    const bounds = findBlockBounds(src, m.index)
    if (!bounds) continue
    const block = src.slice(bounds.start, bounds.end)
    const priceMatch = block.match(/^\s*price: (\d+|null)/m)?.[1]
    if (priceMatch === "0" || priceMatch === "null") asins.push(asin)
  }
  return [...new Set(asins)]
}

async function fetchAmazonPrice(asin) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      const html = await res.text()
      const price = parseAmazonPrice(html)
      if (price) return price
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  return null
}

function patchAsin(asin, price) {
  let src = readFileSync(TARGET, "utf8")
  let patched = 0
  let searchFrom = 0
  while (true) {
    const idx = src.indexOf(`/dp/${asin}"`, searchFrom)
    if (idx < 0) break
    const bounds = findBlockBounds(src, idx)
    if (!bounds) break
    const { start, end, endLen } = bounds
    const block = src.slice(start, end + endLen)
    if (/price: (0|null)/.test(block)) {
      const newBlock = block.replace(/price: (0|null)/, `price: ${price}`)
      src = src.slice(0, start) + newBlock + src.slice(end + endLen)
      patched++
      searchFrom = start + newBlock.length
    } else {
      searchFrom = end + 1
    }
  }
  if (patched) writeFileSync(TARGET, src)
  return patched
}

async function main() {
  const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
  const asins = collectZeroPriceAsins()
  console.log(`Zero/null price ASINs: ${asins.length}`)

  let fetched = 0
  let failed = 0

  for (const asin of asins) {
    if (MANUAL[asin]) {
      cache[asin] = { price: MANUAL[asin], source: "manual", at: new Date().toISOString() }
      continue
    }
    if (cache[asin]?.price > 0) continue

    console.log(`fetch ${asin}...`)
    await new Promise((r) => setTimeout(r, 1500))
    const price = await fetchAmazonPrice(asin)
    if (price) {
      cache[asin] = { price, source: "amazon", at: new Date().toISOString() }
      fetched++
      console.log(`  -> ${price}`)
    } else {
      failed++
      console.log(`  -> fail`)
    }
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  }

  let patched = 0
  for (const asin of asins) {
    const price = MANUAL[asin] ?? cache[asin]?.price
    if (price > 0) patched += patchAsin(asin, price)
  }

  const remaining = collectZeroPriceAsins()
  console.log(`done: fetched ${fetched}, failed ${failed}, patched blocks ${patched}, remaining ${remaining.length}`)
  if (remaining.length) console.log(remaining.join(", "))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

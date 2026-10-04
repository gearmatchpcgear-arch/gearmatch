/**
 * Monitor category: backfill new-item prices from Amazon.co.jp and remove
 * refurbished-only / unavailable listings.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"
import { parseAmazonPrice } from "./amazon-price.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "monitor-price-cache.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const REFURBISHED_RE =
  /整備済み|refurbished|renewed|再生品|【中古】|\(中古\)|中古品のみ|used only/i

/** Amazon ページで確認済みの新品価格（税込） */
const MANUAL_PRICES = {
  B0BW8W1VN3: 22182,
  B0D6QB71XD: 79800,
  B0GWNQWXMF: 74280,
  B08QHYD2BP: 45446,
  B0BL6TK685: 61000,
  B0F8F1GXCV: 21208,
}

const skipFetch = process.argv.includes("--no-fetch")
const dryRun = process.argv.includes("--dry-run")

function monitorDataFiles() {
  return readdirSync(LIB).filter(
    (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.startsWith("monitor-arm"),
  )
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

function collectMissingMonitors() {
  const items = []
  for (const file of monitorDataFiles()) {
    const path = join(LIB, file)
    const src = readFileSync(path, "utf8")
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(src)) !== null) {
      const asin = m[1]
      const bounds = findBlockBounds(src, m.index)
      if (!bounds) continue
      const block = src.slice(bounds.start, bounds.end)
      if (!/category: "monitor"/.test(block)) continue
      const priceMatch = block.match(/^\s*price: (null|\d+)/m)?.[1]
      if (priceMatch !== "null" && priceMatch !== "0") continue
      const name = block.match(/name: "([^"]*)"/)?.[1] ?? "?"
      const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
      items.push({ file, asin, name, tagline })
    }
  }
  return items
}

function isRefurbishedListing(name, tagline) {
  return REFURBISHED_RE.test(`${name} ${tagline}`)
}

function patchPriceInFile(file, asin, price) {
  const path = join(LIB, file)
  let src = readFileSync(path, "utf8")
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
  if (patched && !dryRun) writeFileSync(path, src)
  return patched
}

function removeAsinFromFile(file, asin) {
  const path = join(LIB, file)
  let src = readFileSync(path, "utf8")
  let removed = 0
  while (true) {
    const marker = `/dp/${asin}"`
    const idx = src.indexOf(marker)
    if (idx < 0) break
    const bounds = findBlockBounds(src, idx)
    if (!bounds) break
    const { start, end, endLen } = bounds
    src = src.slice(0, start) + src.slice(end + endLen)
    removed++
  }
  if (removed && !dryRun) writeFileSync(path, src)
  return removed
}

const PAGE_EVAL = `(() => {
  function parseYen(text) {
    const m = String(text ?? "").match(/[¥￥]\\s*([\\d,]+)/)
    if (!m) return null
    const n = Number(m[1].replace(/,/g, ""))
    return Number.isFinite(n) && n >= 1000 && n <= 500000 ? Math.round(n) : null
  }
  function isUsedContext(text) {
    return /Used|中古|リユース|再生品|整備済み|Refurbished|Renewed/i.test(String(text ?? ""))
  }
  function inUsedSubtree(el) {
    if (!el) return false
    if (el.closest("#usedOnlyBuybox, #usedBuyBox")) return true
    const row = el.closest('[data-a-accordion-row-name="usedAccordionRow"], [data-a-accordion-row-name="usedBuybox"]')
    return Boolean(row)
  }

  const title = (document.querySelector("#productTitle")?.textContent ?? "").replace(/\\s+/g, " ").trim()
  const buyboxText = (document.querySelector("#buybox")?.textContent ?? "").replace(/\\s+/g, " ")
  const usedPrimary = /購入\\s*中古|Currently unavailable|在庫切れ|新品の出品者がありません|新品は現在取り扱いがありません/i.test(
    buyboxText + " " + title,
  )

  const selectors = [
    ".reinventPricePriceToPayMargin .a-offscreen",
    ".reinventPricePriceToPayMargin .aok-offscreen",
    "#corePrice_feature_div .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-offscreen",
    "#apex_price .a-offscreen",
  ]

  const candidates = []
  for (const sel of selectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (inUsedSubtree(el)) continue
      const txt = el.textContent ?? ""
      if (/参考価格|list price|typical price/i.test(txt)) continue
      const p = parseYen(txt)
      if (p) candidates.push(p)
    }
  }

  const price = candidates.length ? Math.max(...candidates) : null
  const refurbishedTitle = /整備済み|Refurbished|Renewed|再生品|【中古】/i.test(title)

  return {
    price,
    unavailable: usedPrimary,
    usedOnlyBuybox: usedPrimary,
    refurbishedTitle,
    title: title.slice(0, 120),
  }
})()`

async function fetchWithPlaywright(page, asin) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await page.waitForTimeout(5000)
  const result = await page.evaluate(PAGE_EVAL)
  if (result.price) {
    return {
      price: result.price,
      unavailable: result.unavailable,
      usedOnlyBuybox: result.usedOnlyBuybox,
      refurbishedTitle: result.refurbishedTitle,
      title: result.title,
      source: "playwright",
    }
  }

  const html = await page.content()
  const htmlPrice = parseAmazonPrice(html)
  if (htmlPrice) {
    return {
      price: htmlPrice,
      unavailable: result.unavailable,
      usedOnlyBuybox: result.usedOnlyBuybox,
      refurbishedTitle: result.refurbishedTitle,
      title: result.title,
      source: "html",
    }
  }

  return { ...result, price: null, source: "none" }
}

async function fetchWithHttp(asin, retries = 4) {
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2500 * attempt))
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) continue
    const html = await res.text()
    if (html.length < 50000 || (!html.includes("productTitle") && !html.includes("prodDetSectionEntry"))) {
      continue
    }
    const title = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ?? ""
    if (!title) continue

    const buybox = html.match(/id="buybox"[\s\S]{0,12000}/i)?.[0] ?? ""
    const corePrice = html.match(/id="corePrice_feature_div"[\s\S]{0,4000}/i)?.[0] ?? ""
    const buyboxCompact = buybox.replace(/\s+/g, " ")
    const unavailable =
      /Currently unavailable|在庫切れ|新品の出品者がありません|新品は現在取り扱いがありません|この商品は現在お取り扱いできません/i.test(
        buyboxCompact + title,
      )
    const usedOnlyBuybox =
      /購入\s*中古/.test(buyboxCompact) &&
      !/One-time purchase|一回限りの購入|新品/.test(buyboxCompact) &&
      !corePrice.includes("a-offscreen")
    const refurbishedTitle = REFURBISHED_RE.test(title)
    const price = parseAmazonPrice(html)
    return { price, unavailable, usedOnlyBuybox, refurbishedTitle, title: title.slice(0, 120), source: "http" }
  }
  throw new Error("empty or blocked response")
}

function loadCache() {
  return existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
}

async function main() {
  const cache = loadCache()
  const items = collectMissingMonitors()
  const byAsin = new Map()
  for (const item of items) {
    if (!byAsin.has(item.asin)) byAsin.set(item.asin, item)
  }

  console.log(`Missing monitor prices: ${items.length} blocks / ${byAsin.size} unique ASINs`)

  const toRemove = new Set()
  const toPatch = new Map()

  for (const [asin, item] of byAsin) {
    if (isRefurbishedListing(item.name, item.tagline)) {
      console.log(`REMOVE (data refurbished) ${asin} ${item.name.slice(0, 50)}`)
      toRemove.add(asin)
    }
  }

  let browser
  let page
  const usePlaywright = !skipFetch && !process.argv.includes("--http-only")
  if (usePlaywright) {
    browser = await chromium.launch({ headless: true })
    page = await (await browser.newContext({ locale: "ja-JP" })).newPage()
  }

  for (const [asin, item] of byAsin) {
    if (toRemove.has(asin)) continue

    if (MANUAL_PRICES[asin]) {
      toPatch.set(asin, MANUAL_PRICES[asin])
      cache[asin] = { price: MANUAL_PRICES[asin], source: "manual", at: new Date().toISOString() }
      continue
    }

    if (cache[asin]?.price > 0) {
      toPatch.set(asin, cache[asin].price)
      continue
    }
    if (cache[asin]?.remove === true) {
      toRemove.add(asin)
      continue
    }

    if (skipFetch) {
      console.warn(`SKIP fetch ${asin} (no cache)`)
      continue
    }

    console.log(`fetch ${asin} | ${item.name.slice(0, 50)}`)
    let result
    try {
      if (usePlaywright) {
        result = await fetchWithPlaywright(page, asin)
      } else {
        await new Promise((r) => setTimeout(r, 2200))
        result = await fetchWithHttp(asin)
      }
    } catch (e) {
      console.warn(`  fetch fail: ${e.message}`)
      cache[asin] = { price: null, reason: "fetch-failed", at: new Date().toISOString() }
      continue
    }

    if (result.refurbishedTitle) {
      console.log(`  REMOVE refurbished page: ${result.title}`)
      cache[asin] = { remove: true, reason: "refurbished-page", at: new Date().toISOString() }
      toRemove.add(asin)
      continue
    }

    if (result.price > 0) {
      console.log(`  PATCH ${result.price} (${result.source})`)
      cache[asin] = { price: result.price, source: result.source, at: new Date().toISOString() }
      toPatch.set(asin, result.price)
      continue
    }

    if (result.unavailable || result.usedOnlyBuybox) {
      console.log(`  REMOVE used-only/unavailable: ${result.title}`)
      cache[asin] = { remove: true, reason: "used-only", at: new Date().toISOString() }
      toRemove.add(asin)
      continue
    }

    console.warn(`  KEEP (no price, inconclusive): ${result.title}`)
    cache[asin] = { price: null, reason: "no-price-kept", at: new Date().toISOString() }
  }

  if (browser) await browser.close()
  if (!dryRun) saveCache(cache)

  let patchedBlocks = 0
  let removedBlocks = 0
  const allFiles = monitorDataFiles()

  for (const file of allFiles) {
    for (const [asin, price] of toPatch) {
      patchedBlocks += patchPriceInFile(file, asin, price)
    }
    for (const asin of toRemove) {
      removedBlocks += removeAsinFromFile(file, asin)
    }
  }

  const remaining = collectMissingMonitors()
  console.log(`\nDone: patched blocks=${patchedBlocks}, removed blocks=${removedBlocks}`)
  console.log(`Remaining missing: ${remaining.length} blocks / ${new Set(remaining.map((r) => r.asin)).size} ASINs`)
  if (remaining.length) {
    for (const x of remaining.slice(0, 20)) {
      console.log(`  ${x.asin}\t${x.name.slice(0, 50)}\t${x.file}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

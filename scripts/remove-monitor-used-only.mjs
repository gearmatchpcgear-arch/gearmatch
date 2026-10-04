/**
 * Scan all monitor ASINs on Amazon.co.jp for used-only / refurbished listings
 * and remove matching blocks from lib/monitor*.ts.
 *
 * Usage:
 *   node scripts/remove-monitor-used-only.mjs           # dry-run scan
 *   node scripts/remove-monitor-used-only.mjs --apply   # scan + remove
 *   node scripts/remove-monitor-used-only.mjs --apply --no-fetch  # remove from cache only
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"
import { parseAmazonPrice } from "./amazon-price.mjs"
import { isUsedOrRefurbishedText } from "./used-refurbished-lib.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "monitor-used-only-scan.json")
const REPORT_PATH = join(__dirname, "remove-monitor-used-only-report.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const REFURBISHED_RE =
  /整備済み|refurbished|renewed|再生品|【中古】|\(中古\)|中古品のみ|used only/i

const apply = process.argv.includes("--apply")
const skipFetch = process.argv.includes("--no-fetch")
const delayMs = Number(process.argv.find((a) => a.startsWith("--delay="))?.split("=")[1] ?? 1800)

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

function collectAllMonitors() {
  const byAsin = new Map()
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
      const name = block.match(/name: "([^"]*)"/)?.[1] ?? "?"
      const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
      const id = block.match(/id: "([^"]+)"/)?.[1] ?? ""
      if (!byAsin.has(asin)) {
        byAsin.set(asin, { asin, name, tagline, id, file })
      }
    }
  }
  return byAsin
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
  if (removed) writeFileSync(path, src)
  return removed
}

const PAGE_EVAL = `(() => {
  function parseYen(text) {
    const m = String(text ?? "").match(/[¥￥]\\s*([\\d,]+)/)
    if (!m) return null
    const n = Number(m[1].replace(/,/g, ""))
    return Number.isFinite(n) && n >= 1000 && n <= 500000 ? Math.round(n) : null
  }
  function inUsedSubtree(el) {
    if (!el) return false
    if (el.closest("#usedOnlyBuybox, #usedBuyBox")) return true
    const row = el.closest('[data-a-accordion-row-name="usedAccordionRow"], [data-a-accordion-row-name="usedBuybox"]')
    return Boolean(row)
  }

  const title = (document.querySelector("#productTitle")?.textContent ?? "").replace(/\\s+/g, " ").trim()
  const buyboxText = (document.querySelector("#buybox")?.textContent ?? "").replace(/\\s+/g, " ")
  const hasUsedOnlyBuybox = Boolean(document.querySelector("#usedOnlyBuybox"))
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
    usedOnlyBuybox: (usedPrimary || hasUsedOnlyBuybox || refurbishedTitle) && !price,
    refurbishedTitle,
    title: title.slice(0, 120),
  }
})()`

async function fetchWithPlaywright(page, asin) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await page.waitForTimeout(3500)
  const result = await page.evaluate(PAGE_EVAL)

  const remove =
    result.refurbishedTitle ||
    result.unavailable ||
    result.usedOnlyBuybox ||
    (result.price == null && result.usedOnlyBuybox)

  return {
    ...result,
    remove,
    reason: result.refurbishedTitle
      ? "refurbished-title"
      : result.unavailable
        ? "unavailable"
        : result.usedOnlyBuybox
          ? "used-only-buybox"
          : "keep",
    source: "playwright",
  }
}

async function fetchWithHttp(asin, retries = 3) {
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
    const usedOnly = html.match(/id="usedOnlyBuybox"[\s\S]{0,8000}/i)?.[0] ?? ""
    const usedBuyBox = html.match(/id="usedBuyBox"[\s\S]{0,8000}/i)?.[0] ?? ""
    const corePrice = html.match(/id="corePrice_feature_div"[\s\S]{0,4000}/i)?.[0] ?? ""
    const buyboxCompact = (buybox + usedOnly + usedBuyBox).replace(/\s+/g, " ")

    const unavailable =
      /Currently unavailable|在庫切れ|新品の出品者がありません|新品は現在取り扱いがありません|この商品は現在お取り扱いできません/i.test(
        buyboxCompact + " " + title,
      )
    const usedOnlyBuybox =
      /id="usedOnlyBuybox"/.test(html) ||
      (/購入\s*中古/.test(buyboxCompact) &&
        !/One-time purchase|一回限りの購入|新品の選択/.test(buyboxCompact) &&
        !corePrice.includes("a-offscreen"))
    const refurbishedTitle = REFURBISHED_RE.test(title)
    const hasNewCorePrice =
      corePrice.includes("a-offscreen") &&
      !/Used|中古|リユース|再生品|整備済み|Refurbished|Renewed/i.test(corePrice)
    const price = parseAmazonPrice(html)

    const remove =
      refurbishedTitle ||
      unavailable ||
      usedOnlyBuybox ||
      (price == null && /購入\s*中古|usedOnlyBuybox/i.test(buyboxCompact))

    return {
      title: title.slice(0, 120),
      price,
      hasNewCorePrice,
      unavailable,
      usedOnlyBuybox,
      refurbishedTitle,
      remove,
      reason: refurbishedTitle
        ? "refurbished-title"
        : unavailable
          ? "unavailable"
          : usedOnlyBuybox
            ? "used-only-buybox"
            : remove
              ? "no-new-price"
              : "keep",
      source: "http",
    }
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
  const monitors = collectAllMonitors()
  console.log(`Monitor ASINs: ${monitors.size}`)

  const cache = loadCache()
  const toRemove = new Map()
  const report = {
    mode: apply ? "apply" : "dry-run",
    scannedAt: new Date().toISOString(),
    removed: [],
    errors: [],
  }

  let browser
  let page
  if (!skipFetch) {
    browser = await chromium.launch({ headless: true })
    page = await (await browser.newContext({ locale: "ja-JP" })).newPage()
  }

  let i = 0
  for (const [asin, item] of monitors) {
    i++
    if (isUsedOrRefurbishedText(item.name, item.tagline)) {
      console.log(`[${i}/${monitors.size}] REMOVE (data) ${asin} ${item.name}`)
      toRemove.set(asin, { ...item, reason: "data-text" })
      continue
    }

    if (cache[asin]?.remove === true) {
      toRemove.set(asin, { ...item, reason: cache[asin].reason ?? "cached" })
      if (apply) {
        for (const file of monitorDataFiles()) {
          removeAsinFromFile(file, asin)
        }
      }
      continue
    }
    if (cache[asin]?.remove === false) {
      continue
    }

    if (skipFetch) {
      continue
    }

    process.stdout.write(`[${i}/${monitors.size}] fetch ${asin} ${item.name.slice(0, 40)}... `)
    let result
    try {
      await new Promise((r) => setTimeout(r, delayMs))
      result = await fetchWithPlaywright(page, asin)
    } catch (e) {
      console.log(`FAIL (${e.message})`)
      report.errors.push({ asin, name: item.name, error: e.message })
      cache[asin] = { error: e.message, at: new Date().toISOString() }
      saveCache(cache)
      continue
    }

    if (result.remove) {
      console.log(`REMOVE (${result.reason}) ${result.title ?? ""}`)
      cache[asin] = { remove: true, reason: result.reason, title: result.title, at: new Date().toISOString() }
      toRemove.set(asin, { ...item, reason: result.reason, amazonTitle: result.title })
      if (apply) {
        for (const file of monitorDataFiles()) {
          removeAsinFromFile(file, asin)
        }
      }
    } else {
      console.log(`keep (${result.price ?? "no price"})`)
      cache[asin] = { remove: false, price: result.price, at: new Date().toISOString() }
    }
    saveCache(cache)
  }

  if (browser) await browser.close()

  for (const [asin, info] of toRemove) {
    report.removed.push({
      asin,
      id: info.id,
      name: info.name,
      file: info.file,
      reason: info.reason,
      amazonTitle: info.amazonTitle,
    })
  }

  let removedBlocks = 0
  if (apply) {
    for (const [asin] of toRemove) {
      for (const file of monitorDataFiles()) {
        removedBlocks += removeAsinFromFile(file, asin)
      }
    }
  }

  report.removedBlocks = removedBlocks
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n")

  console.log(`\n${apply ? "Applied" : "Dry-run"}: ${toRemove.size} ASINs to remove (${removedBlocks} blocks)`)
  for (const r of report.removed.slice(0, 30)) {
    console.log(`  ${r.asin}\t${r.reason}\t${r.name}`)
  }
  if (report.removed.length > 30) console.log(`  ... and ${report.removed.length - 30} more`)
  if (!apply) console.log("\nPass --apply to write removals.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

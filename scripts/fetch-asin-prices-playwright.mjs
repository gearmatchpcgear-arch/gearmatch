import { readFileSync } from "node:fs"
import { chromium } from "playwright"

const evalExpr = readFileSync(
  new URL("./amazon-buybox-price-eval.js", import.meta.url),
  "utf8"
)
  .replace(/^\/\*\*[\s\S]*?\*\/\s*/m, "")
  .trim()

const manualFallback = `(() => {
  function parseYen(text) {
    const m = String(text ?? "").match(/[¥￥]\\s*([\\d,]+)/)
    if (!m) return null
    const n = Number(m[1].replace(/,/g, ""))
    return Number.isFinite(n) && n >= 100 ? n : null
  }
  function isUsedContext(text) {
    return /Used|中古|リユース|再生品/i.test(String(text ?? ""))
  }
  function inCarousel(el) {
    let node = el
    for (let i = 0; i < 15 && node; i++, node = node.parentElement) {
      const cls = node.className?.toString?.() ?? ""
      const id = node.id ?? ""
      if (/carousel|p13n|sims|similarities|sp_detail|HLCXComparison|purchase-sims|sponsored/i.test(cls + id))
        return true
    }
    return false
  }
  function inUsedSubtree(el) {
    if (el.closest("#usedOnlyBuybox")) return true
    const offer = el.closest(
      '[data-a-accordion-row-name="usedAccordionRow"], [data-a-accordion-row-name="usedBuybox"], #usedBuyBox'
    )
    if (offer) return true
    const buybox = el.closest("#buybox")
    if (buybox && /^\\s*購入\\s*中古/.test((buybox.textContent ?? "").replace(/\\s+/g, " ")))
      return true
    return false
  }

  const selectors = [
    ".reinventPricePriceToPayMargin .aok-offscreen",
    ".reinventPricePriceToPayMargin .a-offscreen",
    ".reinventPricePriceToPayMargin .apex-pricetopay-value",
    ".centralizedApexPricePriceToPayMargin",
    ".centralizedApexPricePriceToPayMargin .aok-offscreen",
    ".centralizedApexPricePriceToPayMargin .a-offscreen",
    ".centralizedApexPricePriceToPayMargin .apex-pricetopay-value",
    ".apex-pricetopay-value",
    "#corePrice_feature_div .a-offscreen",
    "#corePrice_feature_div .aok-offscreen",
  ]

  function collect(roots) {
    const candidates = []
    for (const root of roots) {
      for (const sel of selectors) {
        for (const el of root.querySelectorAll(sel)) {
          if (inCarousel(el) || inUsedSubtree(el)) continue
          const txt = el.textContent ?? ""
          if (/参考価格|list price|typical price/i.test(txt)) continue
          const p = parseYen(txt)
          if (p && p >= 1000) candidates.push(p)
        }
      }
    }
    return candidates
  }

  const usedPrimary = /購入\\s*中古/.test(
    (document.querySelector("#buybox")?.textContent ?? "").replace(/\\s+/g, " ")
  )
  if (usedPrimary) {
    const twisterRoots = [
      document.querySelector("#apex_price"),
      document.querySelector("#inline-twister-dim-values-container"),
      document.querySelector("#tp-inline-twister-dim-values-container"),
    ].filter(Boolean)
    const twisterCandidates = collect(twisterRoots)
    if (twisterCandidates.length) return Math.max(...twisterCandidates)
  }

  const roots = [
    document.querySelector("#apex_price"),
    document.querySelector("#apex_desktop"),
    document.querySelector("#corePriceDisplay_desktop_feature_div"),
    document.querySelector("#corePrice_feature_div"),
    document.querySelector("#buybox"),
  ].filter(Boolean)

  const candidates = collect(roots)
  return candidates.length ? Math.max(...candidates) : null
})()`

async function extractPrice(page) {
  const fromEval = await page.evaluate((expression) => {
    try {
      return eval(expression)
    } catch {
      return null
    }
  }, evalExpr)
  if (fromEval != null) return { price: fromEval, source: "eval" }

  const manual = await page.evaluate((expression) => eval(expression), manualFallback)
  return { price: manual, source: "manual" }
}

const asins = process.argv.slice(2)
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  locale: "ja-JP",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
})
const page = await context.newPage()
const prices = {}
const failures = []

for (const asin of asins) {
  try {
    await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    })
    await page.waitForTimeout(8000)
    const { price } = await extractPrice(page)
    prices[asin] = price
    if (price == null) failures.push(asin)
  } catch (e) {
    prices[asin] = null
    failures.push(`${asin}: ${e.message}`)
  }
}

await browser.close()
console.log(JSON.stringify({ prices, failures }, null, 2))

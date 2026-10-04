import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"

const PAGE_EVAL = `(() => {
  function parseYen(text) {
    const m = String(text ?? "").match(/[¥￥]\\s*([\\d,]+)/)
    if (!m) return null
    const n = Number(m[1].replace(/,/g, ""))
    return Number.isFinite(n) && n >= 1000 ? Math.round(n) : null
  }
  function inUsedSubtree(el) {
    if (!el) return false
    if (el.closest("#usedOnlyBuybox, #usedBuyBox")) return true
    return Boolean(el.closest('[data-a-accordion-row-name="usedAccordionRow"], [data-a-accordion-row-name="usedBuybox"]'))
  }
  const title = (document.querySelector("#productTitle")?.textContent ?? "").replace(/\\s+/g, " ").trim()
  const buyboxText = (document.querySelector("#buybox")?.textContent ?? "").replace(/\\s+/g, " ")
  const hasUsedOnlyBuybox = Boolean(document.querySelector("#usedOnlyBuybox"))
  const unavailable = /Currently unavailable|在庫切れ|新品の出品者がありません|新品は現在取り扱いがありません/i.test(buyboxText + title)
  const refurbishedTitle = /整備済み|Refurbished|Renewed|再生品|【中古】/i.test(title)
  let newPrice = null
  for (const sel of ["#corePrice_feature_div .a-offscreen", ".reinventPricePriceToPayMargin .a-offscreen"]) {
    for (const el of document.querySelectorAll(sel)) {
      if (inUsedSubtree(el)) continue
      const p = parseYen(el.textContent)
      if (p) newPrice = Math.max(newPrice ?? 0, p)
    }
  }
  const usedOnly = (hasUsedOnlyBuybox || unavailable || refurbishedTitle) && !newPrice
  return { title: title.slice(0, 80), newPrice, hasUsedOnlyBuybox, unavailable, refurbishedTitle, usedOnly }
})()`

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "monitor-lg-display-bestsellers.ts"), "utf8")
const asins = [...src.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g)].map((m) => m[1])

const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext({ locale: "ja-JP" })).newPage()
for (const asin of asins) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForTimeout(3000)
  const r = await page.evaluate(PAGE_EVAL)
  console.log(JSON.stringify({ asin, ...r }))
  await new Promise((x) => setTimeout(x, 600))
}
await browser.close()

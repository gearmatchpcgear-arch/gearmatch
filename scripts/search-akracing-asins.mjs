/**
 * Amazon 検索で AKRacing シリーズ ASIN を収集
 */
import { chromium } from "playwright"

const queries = [
  "AKRacing Gyaza",
  "AKRacing ギャザ",
  "AKRacing Premium",
  "AKRacing Overture",
  "AKRacing Nitro V2",
  "AKRacing Eclair",
  "AKRacing Pro-X V2",
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })

for (const q of queries) {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 })
  await page.waitForTimeout(1500)
  const items = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('[data-asin]')) {
      const asin = el.getAttribute("data-asin")
      if (!asin || asin.length !== 10) continue
      const title = el.querySelector("h2")?.textContent?.trim() ?? ""
      if (!/akracing|エーケーレーシング/i.test(title)) continue
      out.push({ asin, title: title.slice(0, 90) })
    }
    return out
  })
  console.log(`\n=== ${q} (${items.length}) ===`)
  const seen = new Set()
  for (const i of items) {
    if (seen.has(i.asin)) continue
    seen.add(i.asin)
    console.log(i.asin, i.title)
  }
}

await browser.close()

/**
 * AKRacing Amazon ストアページから商品 ASIN を収集 → akracing-store-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORE_URL =
  "https://www.amazon.co.jp/stores/page/1E82A3E5-DE51-4FCA-BF88-4509709FF11D"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })

await page.goto(STORE_URL, { waitUntil: "domcontentloaded", timeout: 60000 })
await page.waitForTimeout(3000)

// Scroll to load lazy products
for (let i = 0; i < 8; i++) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.2))
  await page.waitForTimeout(800)
}

const data = await page.evaluate(() => {
  const items = []
  const seen = new Set()

  for (const a of document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')) {
    const href = a.getAttribute("href") ?? ""
    const m = href.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)
    if (!m) continue
    const asin = m[1].toUpperCase()
    if (seen.has(asin)) continue
    seen.add(asin)

    let title = (a.getAttribute("aria-label") ?? a.textContent ?? "").replace(/\s+/g, " ").trim()
    const img = a.querySelector("img")?.src ?? ""
    if (!title && img) {
      title = a.querySelector("img")?.alt ?? ""
    }
    items.push({ asin, title, href, image: img })
  }

  const seriesLinks = [...document.querySelectorAll("a")].map((a) => ({
    text: (a.textContent ?? "").replace(/\s+/g, " ").trim(),
    href: a.getAttribute("href") ?? "",
  }))

  return {
    pageTitle: document.title,
    itemCount: items.length,
    items,
    seriesLinks: seriesLinks.filter((l) => /akracing|シリーズ|overture|pro-x|nitro|wolf|gyaza|eclair|premium|faura/i.test(l.text + l.href)).slice(0, 40),
    bodySnippet: document.body.innerText.slice(0, 8000),
  }
})

console.log("Page:", data.pageTitle)
console.log("Items found:", data.itemCount)
for (const item of data.items) {
  console.log(item.asin, item.title.slice(0, 70))
}
console.log("\nSeries links:")
for (const l of data.seriesLinks) console.log(l.text.slice(0, 60), l.href.slice(0, 80))

writeFileSync(join(__dirname, "akracing-store-raw.json"), JSON.stringify({ ...data, fetchedAt: new Date().toISOString() }, null, 2))
await browser.close()

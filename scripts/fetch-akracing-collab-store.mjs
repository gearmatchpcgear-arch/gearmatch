/**
 * AKRacing Collaboration Chair ストアページから商品 ASIN を収集
 * https://www.amazon.co.jp/stores/page/AD8C00B9-8797-40C6-9F4F-47777D832F8B
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORE_URL =
  "https://www.amazon.co.jp/stores/page/AD8C00B9-8797-40C6-9F4F-47777D832F8B"

async function collectAsins(page) {
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.2))
    await page.waitForTimeout(700)
  }

  return page.evaluate(() => {
    const items = []
    const seen = new Set()
    for (const a of document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')) {
      const href = a.getAttribute("href") ?? ""
      const m = href.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)
      if (!m) continue
      const asin = m[1].toUpperCase()
      if (seen.has(asin)) continue
      seen.add(asin)
      const title = (a.getAttribute("aria-label") ?? a.textContent ?? a.querySelector("img")?.alt ?? "")
        .replace(/\s+/g, " ")
        .trim()
      items.push({ asin, title, href })
    }
    return items
  })
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })
await page.goto(STORE_URL, { waitUntil: "domcontentloaded", timeout: 60000 })
await page.waitForTimeout(3000)

const allItems = new Map()
for (const item of await collectAsins(page)) allItems.set(item.asin, item)

const seriesLinks = await page.evaluate(() =>
  [...document.querySelectorAll("a")]
    .map((a) => ({
      text: (a.textContent ?? "").replace(/\s+/g, " ").trim(),
      href: a.getAttribute("href") ?? "",
    }))
    .filter((l) =>
      /giants|swallows|dragons|tigers|lions|japan|fc tokyo|zelvia|collaboration|コラボ|サッカー|代表/i.test(
        l.text + l.href,
      ),
    ),
)

for (const link of seriesLinks) {
  if (!link.href || link.href.startsWith("#")) continue
  const url = link.href.startsWith("http") ? link.href : `https://www.amazon.co.jp${link.href}`
  console.log("Visiting:", link.text.slice(0, 60))
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.waitForTimeout(2500)
    for (const item of await collectAsins(page)) {
      if (!allItems.has(item.asin)) allItems.set(item.asin, { ...item, seriesHint: link.text })
    }
  } catch (e) {
    console.log("  Error:", e.message)
  }
}

const items = [...allItems.values()]
console.log("\nTotal unique ASINs:", items.length)
for (const i of items) console.log(i.asin, i.seriesHint ?? "", i.title.slice(0, 90))

writeFileSync(
  join(__dirname, "akracing-collab-store-raw.json"),
  JSON.stringify({ storeUrl: STORE_URL, fetchedAt: new Date().toISOString(), items, seriesLinks }, null, 2),
)
await browser.close()

/**
 * AKRacing ライフスタイルチェアストアページから ASIN 収集
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORE_URL =
  "https://www.amazon.co.jp/stores/page/6F6E035D-B03B-4244-92D9-148DD2F77C34"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })
await page.goto(STORE_URL, { waitUntil: "domcontentloaded", timeout: 60000 })
await page.waitForTimeout(3000)
for (let i = 0; i < 10; i++) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.2))
  await page.waitForTimeout(700)
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
    const title = (a.getAttribute("aria-label") ?? a.textContent ?? a.querySelector("img")?.alt ?? "")
      .replace(/\s+/g, " ")
      .trim()
    items.push({ asin, title, href })
  }
  return {
    pageTitle: document.title,
    body: document.body.innerText.slice(0, 12000),
    items,
  }
})

console.log("Page:", data.pageTitle)
console.log("Items:", data.items.length)
for (const i of data.items) console.log(i.asin, i.title.slice(0, 80))

writeFileSync(join(__dirname, "akracing-lifestyle-store-raw.json"), JSON.stringify({ ...data, fetchedAt: new Date().toISOString() }, null, 2))
await browser.close()

import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })
await page.goto("https://www.amazon.co.jp/dp/B0DQ72DWQ4", {
  waitUntil: "domcontentloaded",
  timeout: 45000,
})
await page.waitForTimeout(2000)
const text = await page.evaluate(() => document.body.innerText)
const matches = [...text.matchAll(/(\d{2,3})\s*[度°]/g)].map((m) => m[0])
console.log("Angle mentions:", [...new Set(matches)].slice(0, 20))
const idx = text.indexOf("リクライニング")
console.log("\nRecline context:", text.slice(Math.max(0, idx - 80), idx + 200))
await browser.close()

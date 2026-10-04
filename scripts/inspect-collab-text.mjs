import { chromium } from "playwright"

const ASINS = [
  "B094QHNK83",
  "B0D1QLTD5G",
  "B0CZ943PLQ",
  "B0D4LLT6FC",
  "B0GXDRY84Q",
  "B0B6NP6CNX",
  "B0H2LQ86PL",
  "B0G4VTM8WM",
  "B0FZ13KWGV",
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })

for (const asin of ASINS) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  })
  await page.waitForTimeout(1500)
  const text = await page.evaluate(() => document.body.innerText)
  const title = text.match(/AKRacing[\s\S]{0,120}/)?.[0]?.split("\n")[0] ?? asin
  const angles = [...new Set([...text.matchAll(/(\d{2,3})\s*[度°]/g)].map((m) => m[0]))]
  const warranty = text.match(/(\d)\s*年保証/)?.[0] ?? "?"
  const price = text.match(/￥([\d,]+)/)?.[1] ?? "?"
  console.log(`\n${asin} ¥${price} ${warranty}`)
  console.log(" ", title.slice(0, 100))
  console.log("  angles:", angles.slice(0, 8).join(", "))
}

await browser.close()

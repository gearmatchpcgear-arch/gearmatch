import { chromium } from "playwright"

const asin = process.argv[2] || "B0DBPFVTBM"
const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext({ locale: "ja-JP" })).newPage()
await page.goto(`https://www.amazon.co.jp/dp/${asin}`, { waitUntil: "domcontentloaded", timeout: 60000 })
await page.waitForTimeout(3000)
await page.locator("a").filter({ hasText: "すべての出品を見る" }).first().click()
await page.waitForTimeout(5000)

const result = await page.evaluate(() => {
  function parseYen(text) {
    const m = String(text ?? "").match(/[¥￥]\s*([\d,]+)/)
    return m ? Number(m[1].replace(/,/g, "")) : null
  }
  function isUsed(text) {
    return /Used|中古|リユース|再生品|整備済み/i.test(String(text ?? ""))
  }

  const pinned = document.querySelector("#aod-sticky-pinned-offer")
  const offers = [...document.querySelectorAll("#aod-offer, .aod-offer, #all-offers-display .a-section.a-spacing-none.a-padding-base")]
    .slice(0, 5)
    .map((el) => ({
      used: isUsed(el.textContent),
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 250),
      price: parseYen(el.textContent),
    }))

  return {
    pinned: pinned
      ? {
          text: pinned.textContent?.replace(/\s+/g, " ").trim().slice(0, 300),
          price: parseYen(pinned.textContent),
          used: isUsed(pinned.textContent),
        }
      : null,
    offers,
  }
})

console.log(JSON.stringify(result, null, 2))
await browser.close()

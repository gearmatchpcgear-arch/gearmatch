import { chromium } from "playwright"

const asins = process.argv.slice(2)
const browser = await chromium.launch({ headless: true })

for (const asin of asins) {
  const page = await (await browser.newContext({ locale: "ja-JP" })).newPage()
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  })
  await page.waitForTimeout(3000)
  const link = page.locator("a").filter({ hasText: "すべての出品を見る" }).first()
  if (await link.count()) await link.click()
  await page.waitForTimeout(5000)

  const result = await page.evaluate(() => {
    function parseYen(text) {
      const m = String(text ?? "").match(/[¥￥]\s*([\d,]+)/)
      return m ? Number(m[1].replace(/,/g, "")) : null
    }
    function isUsed(text) {
      return /Used|中古|リユース|再生品|整備済み/i.test(String(text ?? ""))
    }
    function pick(el) {
      if (!el) return null
      return {
        price: parseYen(el.textContent),
        used: isUsed(el.textContent),
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 200),
      }
    }

    const pinned = pick(document.querySelector("#aod-sticky-pinned-offer"))
    const offers = [...document.querySelectorAll("#aod-offer-list > div, #aod-offer-list .aod-offer")]
      .slice(0, 6)
      .map(pick)
      .filter(Boolean)

    const newOffers = offers.filter((o) => !o.used && o.price)
    return { pinned, newOffers, allOfferPrices: offers.map((o) => o.price).filter(Boolean) }
  })

  console.log(JSON.stringify({ asin, ...result }, null, 2))
  await page.close()
}

await browser.close()

/**
 * Amazon 商品ページから角度候補テキストを抽出（デバッグ / MANUAL 補完用）
 */
import { chromium } from "playwright"

const asins = process.argv.slice(2)
if (!asins.length) {
  console.error("Usage: node scripts/debug-chair-recline-amazon.mjs ASIN ...")
  process.exit(1)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })

for (const asin of asins) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, { waitUntil: "domcontentloaded", timeout: 45000 })
  await page.waitForTimeout(1500)
  const data = await page.evaluate(() => {
    const texts = []
    for (const sel of [
      "#productOverview_feature_div",
      "#feature-bullets",
      "#prodDetails",
      "#aplus",
      "#productDescription",
    ]) {
      const el = document.querySelector(sel)
      if (el?.innerText) texts.push(el.innerText.slice(0, 4000))
    }
    const body = document.body.innerText.slice(0, 120000)
    const hits = [...body.matchAll(/(\d{2,3})\s*(?:度|°)/g)].map((m) => m[0])
    return { hits: [...new Set(hits)].slice(0, 30), snippets: texts.join("\n---\n").slice(0, 6000) }
  })
  console.log("\n===", asin, "===")
  console.log("degree hits:", data.hits.join(", "))
  const reclineLines = data.snippets
    .split(/\n/)
    .filter((l) => /リクライ|recline|可倒|角度|度|°/i.test(l))
    .slice(0, 15)
  for (const l of reclineLines) console.log(l.trim())
}

await browser.close()

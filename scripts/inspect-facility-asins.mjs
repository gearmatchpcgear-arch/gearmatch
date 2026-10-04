import { chromium } from "playwright"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"

const ASINS = [
  "B0DQ72DWQ4",
  "B0F1FG7K3X",
  "B0DQ74NP5P",
  "B0F1FDQH3Y",
  "B0H4QK77YH",
  "B0H69Q5KQ1",
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })

for (const asin of ASINS) {
  await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  })
  await page.waitForTimeout(2000)
  const html = await page.content()
  const title =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    asin
  const price = html.match(/class="a-price-whole">([\d,]+)/)?.[1] ?? "?"
  const detailMap = parseDetailTable(html)
  const hay = `${title} ${JSON.stringify(detailMap)} ${html.slice(0, 120000)}`
  const recline = resolveGamingChairReclineAngle(asin, hay)
  console.log(`\n${asin} ¥${price} recline=${recline}`)
  console.log(" ", title.slice(0, 130))
  console.log(
    "  dims:",
    detailMap["商品の寸法"] ??
      detailMap["製品サイズ"] ??
      detailMap["サイズ"] ??
      "—",
    " weight:",
    detailMap["商品重量"] ?? detailMap["重量"] ?? "—",
  )
}

await browser.close()

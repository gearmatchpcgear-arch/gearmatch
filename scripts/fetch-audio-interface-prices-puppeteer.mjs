/**
 * Puppeteer で Amazon 価格を取得（fetch ブロック回避）
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import puppeteer from "puppeteer"
import { parseAmazonPrice } from "./amazon-price.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "audio-interface-price-cache.json")

const REMAINING = [
  "B0DBPFVTBM",
  "B07QR73T66",
  "B09VFF9L5P",
  "B09V7BFQV4",
  "B00GRSDKI8",
  "B0FTLVP8BN",
  "B09HT2CCP6",
  "B073RDBVHK",
  "B00UEA5FOM",
  "B0BW82KR3G",
  "B0CTLYHFM7",
  "B0CTLLCD1J",
  "B07RS5BRDR",
  "B0DSVRNBM5",
  "B01FJLYXOI",
  "B07N6RD68M",
  "B077YCJNFC",
  "B07C2K648X",
  "B0DVYYQRK5",
  "B00AQC7H1W",
]

async function extractPrice(page) {
  return page.evaluate(() => {
    const pick = (s) => {
      const n = Number(String(s).replace(/[^\d]/g, ""))
      return Number.isFinite(n) && n >= 100 && n <= 500_000 ? n : null
    }
    for (const el of document.querySelectorAll(".a-offscreen")) {
      const t = el.textContent?.trim() ?? ""
      if (/^[¥￥]/.test(t)) {
        const n = pick(t)
        if (n) return n
      }
    }
    const core = document.querySelector("#corePrice_feature_div, #corePriceDisplay_desktop_feature_div")
    if (core) {
      const m = core.textContent?.match(/[¥￥]([\d,]+)/)
      if (m) {
        const n = pick(m[0])
        if (n) return n
      }
    }
    const used = document.body.innerText.match(/(?:Used|中古).*?[¥￥]([\d,]+)/i)
    if (used) return pick(used[0])
    return null
  })
}

async function main() {
  const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
  const todo = REMAINING.filter((a) => !(cache[a]?.price > 0))
  console.log(`Fetching ${todo.length} ASINs via Puppeteer...`)

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ "Accept-Language": "ja-JP,ja;q=0.9" })
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  )

  for (const asin of todo) {
    try {
      await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      })
      await new Promise((r) => setTimeout(r, 1500))
      const html = await page.content()
      let price = parseAmazonPrice(html)
      if (!price) price = await extractPrice(page)
      if (price) {
        cache[asin] = { price, source: "puppeteer", at: new Date().toISOString() }
        console.log(`${asin}: ${price}`)
      } else {
        console.log(`${asin}: fail`)
      }
    } catch (e) {
      console.log(`${asin}: error ${e.message}`)
    }
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
    await new Promise((r) => setTimeout(r, 1200))
  }

  await browser.close()
  console.log("done")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

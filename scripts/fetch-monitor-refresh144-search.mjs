/**
 * Fetch Amazon 144–240Hz display search pages → monitor-refresh144-browser-items.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorBody } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-refresh144-browser-items.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4&rh=p_n_g-101013577303111%3A18161464051%257C18161468051%2Cp_n_g-101017397084111%3A214854498051%257C214854504051%257C214854509051%257C214854510051"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function parseSearchPage(html, searchPage) {
  const items = []
  const blockRe =
    /data-component-type="s-search-result"[^>]*data-asin="([A-Z0-9]{10})"[\s\S]*?(?=data-component-type="s-search-result"|$)/g
  let match
  while ((match = blockRe.exec(html)) !== null) {
    const asin = match[1]
    const block = match[0]
    const titleRaw =
      block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/h2>/)?.[1] ??
      block.match(/<img[^>]+alt="([^"]{15,})"/)?.[1]
    const title = titleRaw ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim()) : asin
    const imgRaw =
      block.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/)?.[1] ??
      block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]
    const priceMatch =
      block.match(/class="a-offscreen">\s*([¥￥][\d,]+)/) ??
      block.match(/a-price-whole[^>]*>([\d,]+)/)
    let price = null
    if (priceMatch) {
      const n = Number(String(priceMatch[1]).replace(/[¥￥,]/g, ""))
      if (Number.isFinite(n) && n >= 100) price = n
    }
    items.push({
      amazonRank: items.length + 1,
      asin,
      title,
      price,
      image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
      searchPage,
    })
  }
  return items
}

async function fetchSearchPage(page) {
  const url = page === 1 ? BASE_URL : `${BASE_URL}&page=${page}`
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) continue
    const html = await res.text()
    if (html.includes("s-search-result") && html.includes("data-asin")) return html
  }
  throw new Error(`Failed to fetch page ${page}`)
}

async function main() {
  const byAsin = new Map()
  for (const page of [1, 2]) {
    console.log(`Fetching search page ${page}...`)
    const html = await fetchSearchPage(page)
    const items = parseSearchPage(html, page)
    console.log(`  parsed ${items.length} listings`)
    for (const item of items) {
      const prev = byAsin.get(item.asin)
      if (!prev || item.searchPage < prev.searchPage) byAsin.set(item.asin, item)
    }
  }

  const merged = [...byAsin.values()].sort((a, b) => {
    if (a.searchPage !== b.searchPage) return a.searchPage - b.searchPage
    return a.amazonRank - b.amazonRank
  })
  merged.forEach((item, i) => {
    item.amazonRank = i + 1
  })

  writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2))
  console.log(`Wrote ${OUT_PATH}: ${merged.length} unique listings`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

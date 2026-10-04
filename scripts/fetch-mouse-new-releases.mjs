/**
 * Amazon.co.jp マウス新着ランキング（2151978051 pg=1）→ mouse-new-releases-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMouseAccessory } from "./mouse-accessory-filter.mjs"
import { parseListingRatingReviews } from "./amazon-listing-rating-parse.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mouse-new-releases-raw.json")

const URL =
  "https://www.amazon.co.jp/gp/new-releases/computers/2151978051/ref=zg_bsnr_pg_1_computers?ie=UTF8&pg=1"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    const html = await res.text()
    if (html.includes("data-asin=") && html.includes("zg-bdg-text")) return html
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
  }
  throw new Error(`Empty or blocked response for ${url}`)
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

function parseItemBlock(block, asin, rank) {
  const titleRaw =
    block.match(/p13n-sc-css-line-clamp-2[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
    block.match(/<img[^>]+alt="([^"]{15,})"/)?.[1]
  const title = titleRaw
    ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
    : asin

  const { rating, reviews } = parseListingRatingReviews(block)
  const price = Number(
    block
      .match(/_cDEzb_p13n-sc-price_3mJ9Z">￥([\d,]+)/)?.[1]
      ?.replace(/,/g, "") ?? "0",
  )
  const imgRaw = block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]

  return {
    amazonRank: rank,
    asin,
    title,
    rating,
    reviews,
    price: price || null,
    image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
  }
}

function parsePage(html) {
  const items = []
  const seen = new Set()
  const rankRe = /data-asin="([A-Z0-9]{10})"[\s\S]*?zg-bdg-text">#(\d+)</g
  let match
  while ((match = rankRe.exec(html)) !== null) {
    const asin = match[1].toUpperCase()
    const rank = Number(match[2])
    const key = `${rank}:${asin}`
    if (seen.has(key)) continue
    seen.add(key)
    const start = Math.max(0, match.index - 200)
    const end = Math.min(html.length, match.index + 8000)
    items.push(parseItemBlock(html.slice(start, end), asin, rank))
  }
  return items
}

function filterAndRerank(items) {
  const filtered = items.filter((item) => !isMouseAccessory(item.title))
  const seenAsin = new Set()
  const unique = []
  for (const item of filtered.sort((a, b) => a.amazonRank - b.amazonRank)) {
    if (seenAsin.has(item.asin)) continue
    seenAsin.add(item.asin)
    unique.push(item)
  }
  return unique.map((item, i) => ({ ...item, rank: i + 1 }))
}

async function main() {
  const html = await fetchText(URL)
  const raw = parsePage(html).sort((a, b) => a.amazonRank - b.amazonRank)
  const mice = filterAndRerank(raw)
  const excluded = raw.filter((item) => isMouseAccessory(item.title))

  console.log(`Raw: ${raw.length}, mice: ${mice.length}, excluded: ${excluded.length}`)
  for (const x of excluded) {
    console.log(`  exclude #${x.amazonRank} ${x.asin}: ${x.title.slice(0, 70)}`)
  }
  for (const x of mice) {
    console.log(`  #${x.rank} ${x.asin} ¥${x.price ?? "?"} ${x.title.slice(0, 60)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), url: URL, mice, excluded }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

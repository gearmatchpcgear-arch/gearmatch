/**
 * Amazon.co.jp PC用マイク人気ギフト（2152017051 pg=1）→ mic-most-gifted-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mic-most-gifted-raw.json")

const PAGE1_URL =
  "https://www.amazon.co.jp/gp/most-gifted/computers/2152017051"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
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

  const ratingMatch =
    block.match(/5つ星のうち([\d.]+)/) ||
    block.match(/([\d.]+)\s*out of 5 stars/i)
  const rating = ratingMatch ? Number(ratingMatch[1]) : 4.0
  const reviews = Number(
    block.match(/a-size-small">([\d,]+)</)?.[1]?.replace(/,/g, "") ?? "0",
  )
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

async function fetchText(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    const html = await res.text()
    if (html.includes("data-asin=") && html.includes("zg-bdg-text") && html.length > 10000) {
      return html
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  throw new Error(`Blocked or empty response for ${url}`)
}

async function main() {
  console.log("Fetching PC mic most-gifted page 1...")
  const html = await fetchText(PAGE1_URL)
  const raw = parsePage(html)
  console.log(`  parsed ${raw.length} items (#${raw[0]?.amazonRank}-#${raw.at(-1)?.amazonRank})`)

  const microphones = raw.filter((item) => !isMicRankingBodyTitle(item.title))
  const excluded = raw.filter((item) => isMicRankingBodyTitle(item.title))
  console.log(`  kept ${microphones.length}, excluded ${excluded.length}`)
  for (const e of excluded) console.log(`    EX ${e.amazonRank} ${e.asin} ${e.title.slice(0, 60)}`)

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), microphones }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

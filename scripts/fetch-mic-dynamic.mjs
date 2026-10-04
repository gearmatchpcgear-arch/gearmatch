/**
 * Amazon.co.jp ダイナミックマイク売れ筋（2130075051）→ mic-dynamic-bestsellers-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isDynamicMicBodyTitle } from "./mic-dynamic-exclusions.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mic-dynamic-bestsellers-raw.json")
const BASE_URL = "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130075051"

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

function parsePage(html, page) {
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
    const block = html.slice(start, end)
    const titleRaw =
      block.match(/p13n-sc-css-line-clamp-2[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
      block.match(/<img[^>]+alt="([^"]{15,})"/)?.[1]
    const title = titleRaw
      ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
      : asin
    const ratingMatch =
      block.match(/5つ星のうち([\d.]+)/) || block.match(/([\d.]+)\s*out of 5 stars/i)
    const rating = ratingMatch ? Number(ratingMatch[1]) : 4.0
    const reviews = Number(
      block.match(/a-size-small">([\d,]+)</)?.[1]?.replace(/,/g, "") ?? "0",
    )
    const price = Number(
      block
        .match(/_cDEzb_p13n-sc-price_3mJ9Z">￥([\d,]+)/)?.[1]
        ?.replace(/,/g, "") ??
        block.match(/a-price-whole">([\d,]+)/)?.[1]?.replace(/,/g, "") ??
        "0",
    )
    const imgRaw = block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]
    items.push({
      amazonRank: rank,
      asin,
      title,
      rating,
      reviews,
      price: price || null,
      image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
      page,
    })
  }
  return items
}

async function fetchAllPages() {
  const all = []
  for (let pg = 1; pg <= 4; pg++) {
    const url =
      pg === 1
        ? BASE_URL
        : `${BASE_URL}/ref=zg_bs_pg_${pg}_musical-instruments?ie=UTF8&pg=${pg}`
    const html = await fetch(url, { headers: HEADERS }).then((r) => r.text())
    const page = parsePage(html, pg)
    console.log(`Page ${pg}: ${page.length} items (html ${html.length})`)
    if (page.length === 0) break
    all.push(...page)
  }
  const byKey = new Map()
  for (const item of all) {
    byKey.set(`${item.amazonRank}:${item.asin}`, item)
  }
  return [...byKey.values()].sort((a, b) => a.amazonRank - b.amazonRank)
}

const raw = await fetchAllPages()
const excluded = raw.filter((item) => !isDynamicMicBodyTitle(item.title))
const microphones = raw.filter((item) => isDynamicMicBodyTitle(item.title))

console.log(`Total: raw=${raw.length}, kept=${microphones.length}, excluded=${excluded.length}`)
for (const x of microphones) {
  console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 90)}`)
}
for (const x of excluded) {
  console.log(`  EXCLUDED #${x.amazonRank} ${x.asin} ${x.title.slice(0, 75)}`)
}

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: BASE_URL,
      microphones,
      excluded,
      raw,
    },
    null,
    2,
  ),
)
console.log(`Wrote ${OUT_PATH}`)

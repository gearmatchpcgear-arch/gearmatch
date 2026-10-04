/**
 * Amazon.co.jp PC用マイク売れ筋ランキング（2152017051）
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMicAccessoryTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mic-bestsellers-raw.json")

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
    const block = html.slice(start, end)
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
    items.push({
      amazonRank: rank,
      asin,
      title,
      rating,
      reviews,
      price: price || null,
      image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
    })
  }
  return items
}

/** @deprecated use isMicAccessoryTitle */
export function isMicAccessory(title) {
  return isMicAccessoryTitle(title)
}

async function main() {
  const url = "https://www.amazon.co.jp/gp/bestsellers/computers/2152017051"
  const res = await fetch(url, { headers: HEADERS })
  const html = await res.text()
  const raw = parsePage(html).sort((a, b) => a.amazonRank - b.amazonRank)
  const excluded = raw.filter((item) => isMicAccessoryTitle(item.title))
  const microphones = raw.filter((item) => !isMicAccessoryTitle(item.title))

  console.log(`Raw: ${raw.length}, mics: ${microphones.length}, excluded: ${excluded.length}`)
  for (const x of raw.slice(0, 15)) {
    const flag = isMicAccessoryTitle(x.title) ? " [ACC]" : ""
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 70)}${flag}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), microphones, excluded, raw }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

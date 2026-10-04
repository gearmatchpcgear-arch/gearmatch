/**
 * Amazon.co.jp PC用マイク売れ筋 2ページ目
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mic-bestsellers-page2-raw.json")

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

function isMicAccessory(title) {
  const t = title.toLowerCase()
  if (/マイクケース|mic case|収納ケース|キャリングケース|ハードケース/i.test(t) && !/マイク.*本体|microphone/i.test(t)) return true
  if (/マイクアーム|mic arm|boom arm|アーム単|スタンド単/i.test(t) && !/マイク|microphone|mic mini|solocast|quadcast|snowball|k669|u30k|emeet|m0/i.test(t)) return true
  if (/ポップフィルター|pop filter|防音|ウレタン|スポンジ|ウィンドスクリーン単|風防/i.test(t) && !/内蔵|付属/i.test(t)) return true
  if (/ケーブル|cable|延長/i.test(t) && !/マイク|microphone/i.test(t)) return true
  return false
}

async function main() {
  const url =
    "https://www.amazon.co.jp/gp/bestsellers/computers/2152017051/ref=zg_bs_pg_2_computers?ie=UTF8&pg=2"
  const res = await fetch(url, { headers: HEADERS })
  const html = await res.text()
  console.log("HTML length:", html.length, "has pg-2:", html.includes("pg=2"), "ranks:", (html.match(/zg-bdg-text">#\d+</g) || []).length)
  const raw = parsePage(html).sort((a, b) => a.amazonRank - b.amazonRank)

  console.log(`Page 2: raw=${raw.length}`)
  for (const x of raw) {
    const flag = isMicAccessory(x.title) ? " [ACC]" : ""
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 90)}${flag}`)
  }

  writeFileSync(OUT_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), raw }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

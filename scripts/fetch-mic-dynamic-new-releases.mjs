/**
 * Amazon.co.jp ダイナミックマイク新着（2130075051）→ mic-dynamic-new-releases-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mic-dynamic-new-releases-raw.json")
const URL =
  "https://www.amazon.co.jp/gp/new-releases/musical-instruments/2130075051"

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
    })
  }
  return items
}

function isDynamicMicExcluded(title) {
  if (isMicRankingBodyTitle(title)) return true
  if (/ウタエット|UTAET/i.test(title)) return true
  if (/ヘッドセット|ヘッドウォーン|headset|headworn/i.test(title) && !/ピンマイク/i.test(title)) return true
  if (/拡張マイク|YVC-MIC|用拡張/i.test(title)) return true
  if (/マイクケース|mic case|収納ケース|キャリングケース/i.test(title) && !/マイク|microphone/i.test(title)) return true
  return false
}

async function fetchText(url, retries = 6) {
  for (let i = 0; i < retries; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2500 * (i + 1)))
    const res = await fetch(url, { headers: HEADERS })
    if (res.status === 503 || res.status === 429) continue
    const html = await res.text()
    if (html.includes("data-asin=") && html.includes("zg-bdg-text") && html.length > 10000) {
      return html
    }
  }
  throw new Error(`Blocked or empty response for ${url}`)
}

async function main() {
  const html = await fetchText(URL)
  const raw = parsePage(html).sort((a, b) => a.amazonRank - b.amazonRank)
  const excluded = raw.filter((item) => isDynamicMicExcluded(item.title))
  const microphones = raw.filter((item) => !isDynamicMicExcluded(item.title))

  console.log(`Dynamic new releases: raw=${raw.length}, kept=${microphones.length}, excluded=${excluded.length}`)
  for (const x of microphones) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 90)}`)
  }
  for (const x of excluded) {
    console.log(`  EXCLUDED #${x.amazonRank} ${x.asin} ${x.title.slice(0, 70)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        sourceUrl: URL,
        microphones,
        excluded,
        raw,
      },
      null,
      2,
    ),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

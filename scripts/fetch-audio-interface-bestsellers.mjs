/**
 * Amazon.co.jp オーディオIF売れ筋 (2130084051) pg1+
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isAudioInterfaceAccessoryTitle } from "./audio-interface-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "audio-interface-bestsellers-raw.json")
const BASE =
  "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130084051"

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
      block.match(/a-size-small">([\d,]+)</)?.[1]?.replace(/,/g, "") ??
        block.match(/([\d,]+)\s*ratings/i)?.[1]?.replace(/,/g, "") ??
        "0",
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

async function fetchPage(page) {
  const url =
    page === 1
      ? BASE
      : `${BASE}/ref=zg_bs_pg_${page}?_encoding=UTF8&pg=${page}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) return null
  return res.text()
}

async function main() {
  const all = []
  const seenAsin = new Set()
  for (let page = 1; page <= 5; page++) {
    const html = await fetchPage(page)
    if (!html) {
      console.log(`Page ${page}: skipped (${page > 2 ? "end" : "fetch failed"})`)
      break
    }
    const batch = parsePage(html)
    if (!batch.length) break
    for (const item of batch) {
      if (seenAsin.has(item.asin)) continue
      seenAsin.add(item.asin)
      all.push(item)
    }
    console.log(`Page ${page}: ${batch.length} items (total unique ${all.length})`)
    if (batch.length < 10) break
    await new Promise((r) => setTimeout(r, 600))
  }

  all.sort((a, b) => a.amazonRank - b.amazonRank)
  const excluded = all.filter((item) => isAudioInterfaceAccessoryTitle(item.title))
  const bodies = all.filter((item) => !isAudioInterfaceAccessoryTitle(item.title))

  console.log(`\nTotal: ${all.length}, bodies: ${bodies.length}, excluded: ${excluded.length}`)
  for (const x of excluded) {
    console.log(`  [EX] #${x.amazonRank} ${x.asin} ${x.title.slice(0, 80)}`)
  }
  for (const x of bodies.slice(0, 20)) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 70)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), bodies, excluded, raw: all },
      null,
      2,
    ),
  )
  console.log(`\nWrote ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

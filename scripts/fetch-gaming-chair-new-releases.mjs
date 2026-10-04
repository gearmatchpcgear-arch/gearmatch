/**
 * Amazon.co.jp PCゲーミングチェア新着（5341900051）→ gaming-chair-new-releases-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isGamingChairAccessory } from "./gaming-chair-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "gaming-chair-new-releases-raw.json")
const URLS = [
  "https://www.amazon.co.jp/gp/new-releases/kitchen/5341900051",
  "https://www.amazon.co.jp/gp/new-releases/kitchen/5341900051/ref=zg_bsnr_pg_2_kitchen?ie=UTF8&pg=2",
]

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
      ?.replace(/,/g, "") ??
      block.match(/a-price-whole">([\d,]+)/)?.[1]?.replace(/,/g, "") ??
      "0",
  )
  const imgRaw = block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]

  return {
    amazonRank: rank,
    rank,
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

async function fetchText(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) continue
    const html = await res.text()
    if (html.includes("data-asin=") && html.includes("zg-bdg-text") && html.length > 10000) {
      return html
    }
  }
  throw new Error(`Blocked or empty response for ${url}`)
}

async function main() {
  const all = []
  for (const url of URLS) {
    try {
      const html = await fetchText(url)
      const items = parsePage(html)
      console.log(`${url.includes("pg=2") ? "p2" : "p1"}: ${items.length} items`)
      all.push(...items)
    } catch (e) {
      console.warn(`${url.includes("pg=2") ? "p2" : "p1"} skipped: ${e.message}`)
    }
    if (url !== URLS[URLS.length - 1]) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  if (all.length === 0) {
    throw new Error("No new-release items fetched")
  }

  const byAmazonRank = new Map()
  for (const item of all) {
    if (!byAmazonRank.has(item.amazonRank)) byAmazonRank.set(item.amazonRank, item)
  }
  const raw = [...byAmazonRank.values()].sort((a, b) => a.amazonRank - b.amazonRank)
  const excluded = raw.filter((item) => isGamingChairAccessory(item.title))
  const seenAsin = new Set()
  const gamingChairs = []
  for (const item of raw.filter((item) => !isGamingChairAccessory(item.title))) {
    if (seenAsin.has(item.asin)) continue
    seenAsin.add(item.asin)
    gamingChairs.push({ ...item, rank: item.amazonRank })
  }

  console.log(
    `Gaming chair new releases: raw=${raw.length}, kept=${gamingChairs.length}, excluded=${excluded.length}`,
  )
  for (const x of gamingChairs) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 80)}`)
  }
  for (const x of excluded) {
    console.log(`  EXCLUDED #${x.amazonRank} ${x.asin} ${x.title.slice(0, 70)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        urls: URLS,
        gamingChairs,
        excluded,
        raw,
      },
      null,
      2,
    ),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isMain) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

/**
 * Amazon.co.jp ディスプレイ新着 2ページ目（2151982051 pg=2）→ monitor-new-releases-page2-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-new-releases-page2-raw.json")

const PAGE2_URL =
  "https://www.amazon.co.jp/gp/new-releases/computers/2151982051/ref=zg_bsnr_pg_2_computers?ie=UTF8&pg=2"
const PAGE3_URL =
  "https://www.amazon.co.jp/gp/new-releases/computers/2151982051/ref=zg_bsnr_pg_3_computers?ie=UTF8&pg=3"

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
    if (!res.ok) {
      console.warn(`HTTP ${res.status} for ${url}`)
      return null
    }
    const html = await res.text()
    if (html.includes("data-asin=") && html.includes("zg-bdg-text") && html.length > 10000) {
      return html
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  return null
}

async function main() {
  const all = []
  for (const [label, url] of [
    ["page2", PAGE2_URL],
    ["page3", PAGE3_URL],
  ]) {
    console.log(`Fetching ${label}...`)
    const html = await fetchText(url)
    if (!html) {
      console.log(`  skipped (${label} unavailable)`)
      continue
    }
    const items = parsePage(html)
    console.log(
      `  parsed ${items.length} items (#${items[0]?.amazonRank}-#${items.at(-1)?.amazonRank})`,
    )
    all.push(...items)
    await new Promise((r) => setTimeout(r, 1500))
  }

  const byRank = new Map()
  for (const item of all.sort((a, b) => a.amazonRank - b.amazonRank)) {
    byRank.set(item.amazonRank, item)
  }
  const raw = [...byRank.values()].filter((x) => x.amazonRank >= 51)

  const excluded = raw.filter((item) => isMonitorAccessory(item.title))
  const monitors = raw.filter((item) => !isMonitorAccessory(item.title))

  console.log(`Page2+: raw=${raw.length}, kept=${monitors.length}, excluded=${excluded.length}`)
  for (const x of monitors) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 90)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), monitors, excluded, raw }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

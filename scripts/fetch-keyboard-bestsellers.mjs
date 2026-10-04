/**
 * Amazon.co.jp パソコン用キーボード売れ筋ランキング（2151977051）→ keyboard-bestsellers-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "keyboard-bestsellers-raw.json")

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

import { isKeyboardAccessoryTitle, isKeyboardMouseComboTitle } from "./keyboard-accessory.mjs"

/** @deprecated isKeyboardAccessoryTitle を使用 */
export function isKeyboardAccessory(title) {
  return isKeyboardAccessoryTitle(title)
}

function shouldExclude(title) {
  return isKeyboardAccessory(title) || isKeyboardMouseComboTitle(title)
}

function filterAndRerank(items) {
  const filtered = items.filter((item) => !shouldExclude(item.title))
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
  const urls = [
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151977051",
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151977051/ref=zg_bs_pg_2?pg=2",
  ]
  const all = []
  for (const url of urls) {
    const html = await fetchText(url)
    const items = parsePage(html)
    console.log(`${url.includes("pg=2") ? "p2" : "p1"}: ${items.length} items`)
    all.push(...items)
    await new Promise((r) => setTimeout(r, 2000))
  }

  const byAmazonRank = new Map()
  for (const item of all) {
    if (!byAmazonRank.has(item.amazonRank)) byAmazonRank.set(item.amazonRank, item)
  }
  const raw = [...byAmazonRank.values()].sort((a, b) => a.amazonRank - b.amazonRank)
  const keyboards = filterAndRerank(raw)

  const excluded = raw.filter((item) => shouldExclude(item.title))

  console.log(`Raw ranks: ${raw.length}, keyboards: ${keyboards.length}, excluded: ${excluded.length}`)
  for (const x of excluded) {
    console.log(`  exclude #${x.amazonRank} ${x.asin}: ${x.title.slice(0, 60)}…`)
  }
  for (const x of keyboards.slice(0, 10)) {
    console.log(`  #${x.rank} ${x.asin} ¥${x.price} ${x.title.slice(0, 55)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), keyboards, excluded }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

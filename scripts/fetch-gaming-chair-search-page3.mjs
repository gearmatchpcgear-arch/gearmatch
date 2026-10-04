/**
 * Amazon.co.jp ゲーミングチェア検索 3ページ目 → gaming-chair-search-page3-raw.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isGamingChairAccessory } from "./gaming-chair-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "gaming-chair-search-page3-raw.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%82%B2%E3%83%BC%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%81%E3%82%A7%E3%82%A2+amazon"
const PAGE3_URL = `${BASE_URL}&page=3`

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

function parseResultBlock(block, page, fallbackRank) {
  const asin =
    block.match(/data-asin="([A-Z0-9]{10})"/)?.[1]?.toUpperCase() ??
    block.match(/amzn1\.asin\.1\.([A-Z0-9]{10})/)?.[1]?.toUpperCase()
  if (!asin || asin === "0000000000") return null

  const titleRaw =
    block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/h2>/)?.[1] ??
    block.match(/<img[^>]+alt="([^"]{12,})"/)?.[1]
  const title = titleRaw
    ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
    : asin

  const ratingMatch =
    block.match(/5つ星のうち([\d.]+)/) || block.match(/([\d.]+)\s*out of 5 stars/i)
  const rating = ratingMatch ? Number(ratingMatch[1]) : 4.0
  const reviews = Number(
    block.match(/a-size-base s-underline-text">([\d,]+)</)?.[1]?.replace(/,/g, "") ??
      block.match(/a-size-small">([\d,]+)</)?.[1]?.replace(/,/g, "") ??
      "0",
  )

  const priceMatch =
    block.match(/a-price-whole">([\d,]+)/)?.[1]?.replace(/,/g, "") ??
    block.match(/￥([\d,]+)/)?.[1]?.replace(/,/g, "")
  const price = priceMatch ? Number(priceMatch) : null

  const imgRaw =
    block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1] ??
    block.match(/data-src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]

  const pos = block.match(/data-csa-c-pos="(\d+)"/)?.[1]
  const amazonRank = pos ? Number(pos) : fallbackRank

  return {
    amazonRank,
    rank: amazonRank,
    asin,
    title,
    rating,
    reviews,
    price,
    image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
    searchPage: page,
  }
}

function parseOrganicResults(html, page) {
  const items = []
  const seen = new Set()
  const blockRe =
    /data-asin="([A-Z0-9]{10})"[^>]*data-component-type="s-search-result"([\s\S]*?)(?=data-asin="[A-Z0-9]{10}"[^>]*data-component-type="s-search-result"|$)/g
  let match
  let idx = 0
  while ((match = blockRe.exec(html)) !== null) {
    const asin = match[1].toUpperCase()
    if (asin === "0000000000" || seen.has(asin)) continue
    seen.add(asin)
    idx++
    const block = match[0]
    const item = parseResultBlock(block, page, (page - 1) * 48 + idx)
    if (item) items.push(item)
  }
  return items
}

function parseSponsoredCards(html, page, seenAsins) {
  const items = []
  const re = /data-asin="([A-Z0-9]{10})"/g
  let m
  let sponsoredIdx = 0
  while ((m = re.exec(html)) !== null) {
    const asin = m[1].toUpperCase()
    if (asin === "0000000000" || seenAsins.has(asin)) continue

    const block = html.slice(m.index, m.index + 15000)
    if (/data-component-type="s-search-result"/.test(block.slice(0, 500))) continue

    const titleRaw = block.match(/alt="([^"]{20,280})"/)?.[1]
    if (!titleRaw) continue
    const title = decodeHtml(titleRaw)
    if (!/ゲーミング|gaming chair|オフィスチェア|AutoFull|M6|G7|GTPLAYER|GXTRACE/i.test(title)) {
      continue
    }
    if (isGamingChairAccessory(title)) continue

    sponsoredIdx++
    seenAsins.add(asin)
    const item = parseResultBlock(block, page, 90 + sponsoredIdx)
    if (item) {
      item.title = title
      items.push(item)
    }
  }
  return items
}

async function fetchText(url, retries = 8) {
  for (let i = 0; i < retries; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2500 * (i + 1)))
    const res = await fetch(url, {
      headers: {
        ...HEADERS,
        Referer: "https://www.amazon.co.jp/",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
    })
    if (!res.ok) {
      console.warn(`  attempt ${i + 1}: HTTP ${res.status}`)
      if (i === retries - 1) throw new Error(`HTTP ${res.status} for ${url}`)
      continue
    }
    const html = await res.text()
    if (html.includes("s-search-result") && html.length > 30000) return html
    if (html.includes("captcha") || html.includes("Robot Check")) {
      console.warn(`  attempt ${i + 1}: captcha/block`)
      if (i === retries - 1) throw new Error(`Blocked for ${url}`)
      continue
    }
    if (i === retries - 1) throw new Error(`Blocked or empty response for ${url} (${html.length} bytes)`)
  }
  throw new Error(`Failed to fetch ${url}`)
}

async function main() {
  let html
  const localHtml = join(__dirname, "page3.html")
  if (process.argv.includes("--from-file") && existsSync(localHtml)) {
    console.log("Using cached scripts/page3.html")
    html = readFileSync(localHtml, "utf8")
  } else {
    console.log("Warming up with page 1...")
    await fetchText(BASE_URL)
    await new Promise((r) => setTimeout(r, 2000))
    console.log("Fetching page 3...")
    html = await fetchText(PAGE3_URL)
  }

  const organic = parseOrganicResults(html, 3)
  const seenAsins = new Set(organic.map((x) => x.asin))
  const sponsored = parseSponsoredCards(html, 3, seenAsins)
  const raw = [...sponsored, ...organic].sort((a, b) => a.amazonRank - b.amazonRank)

  const excluded = raw.filter((item) => isGamingChairAccessory(item.title))
  const seen = new Set()
  const gamingChairs = []
  for (const item of raw.filter((item) => !isGamingChairAccessory(item.title))) {
    if (seen.has(item.asin)) continue
    seen.add(item.asin)
    gamingChairs.push(item)
  }

  console.log(
    `Page3: organic=${organic.length}, sponsored=${sponsored.length}, kept=${gamingChairs.length}, excluded=${excluded.length}`,
  )
  for (const x of gamingChairs) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price ?? "?"} ${x.title.slice(0, 85)}`)
  }
  for (const x of excluded) {
    console.log(`  EXCLUDED ${x.asin} ${x.title.slice(0, 70)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        sourceUrl: PAGE3_URL,
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

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

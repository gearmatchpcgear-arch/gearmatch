/**
 * Amazon.co.jp ゲーミングチェア検索 → gaming-chair-search-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isGamingChairAccessory } from "./gaming-chair-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "gaming-chair-search-raw.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%82%B2%E3%83%BC%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%81%E3%82%A7%E3%82%A2+amazon"

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

function parseSearchPage(html, page) {
  const items = []
  const seen = new Set()

  const blockRe =
    /data-component-type="s-search-result"[\s\S]*?data-asin="([A-Z0-9]{10})"([\s\S]*?)(?=data-component-type="s-search-result"|$)/g
  let match
  while ((match = blockRe.exec(html)) !== null) {
    const asin = match[1].toUpperCase()
    if (asin === "0000000000" || seen.has(asin)) continue
    seen.add(asin)

    const block = match[0]
    const titleRaw =
      block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/h2>/)?.[1] ??
      block.match(/<img[^>]+alt="([^"]{12,})"/)?.[1]
    const title = titleRaw
      ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
      : asin

    const ratingMatch =
      block.match(/5つ星のうち([\d.]+)/) ||
      block.match(/([\d.]+)\s*out of 5 stars/i)
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

    items.push({
      amazonRank: (page - 1) * 48 + items.length + 1,
      rank: (page - 1) * 48 + items.length + 1,
      asin,
      title,
      rating,
      reviews,
      price,
      image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
      searchPage: page,
    })
  }

  return items
}

function getTotalPages(html) {
  const nums = [...html.matchAll(/aria-label="(\d+)ページ目へ"/g)].map((m) => Number(m[1]))
  if (nums.length) return Math.max(...nums)
  const alt = [...html.matchAll(/page=(\d+)/g)].map((m) => Number(m[1]))
  return alt.length ? Math.max(...alt) : 1
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
    if (i === retries - 1) throw new Error(`Blocked or empty response for ${url}`)
  }
  throw new Error(`Failed to fetch ${url}`)
}

async function main() {
  console.log("Fetching gaming chair search page 1...")
  const firstHtml = await fetchText(BASE_URL)
  const totalPages = getTotalPages(firstHtml)
  console.log(`  total pages: ${totalPages}`)

  const all = []
  all.push(...parseSearchPage(firstHtml, 1))
  console.log(`  parsed ${all.length} items on page 1`)

  for (let page = 2; page <= totalPages; page++) {
    const url = `${BASE_URL}&page=${page}`
    console.log(`Fetching page ${page}...`)
    await new Promise((r) => setTimeout(r, 2000))
    try {
      const html = await fetchText(url)
      const items = parseSearchPage(html, page)
      console.log(`  parsed ${items.length} items`)
      all.push(...items)
    } catch (err) {
      console.warn(`  page ${page} failed: ${err.message}`)
    }
  }

  const byAsin = new Map()
  for (const item of all) {
    if (!byAsin.has(item.asin)) byAsin.set(item.asin, item)
  }
  const raw = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)

  const excluded = raw.filter((item) => isGamingChairAccessory(item.title))
  const gamingChairs = raw.filter((item) => !isGamingChairAccessory(item.title))

  console.log(`Total: raw=${raw.length}, kept=${gamingChairs.length}, excluded=${excluded.length}`)
  for (const x of gamingChairs.slice(0, 15)) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price ?? "?"} ${x.title.slice(0, 85)}`)
  }
  if (gamingChairs.length > 15) console.log(`  ... and ${gamingChairs.length - 15} more`)
  console.log("\nExcluded samples:")
  for (const x of excluded.slice(0, 15)) {
    console.log(`  EX ${x.asin} ${x.title.slice(0, 70)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        sourceUrl: BASE_URL,
        totalPages,
        gamingChairs,
        excluded,
        raw,
      },
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

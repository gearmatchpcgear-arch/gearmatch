/**
 * Amazon.co.jp Lenovo ディスプレイ検索（22.0～25.9インチ）→ monitor-lenovo-search-raw.json
 * https://www.amazon.co.jp/s?k=ディスプレイ&rh=p_n_g-101013577303111:18161464051,p_123:391242
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-lenovo-search-raw.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4&rh=p_n_g-101013577303111%3A18161464051%2Cp_123%3A391242"

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

function getTotalPages(html) {
  const nums = [...html.matchAll(/aria-label="(\d+)ページ目へ"/g)].map((m) => Number(m[1]))
  if (nums.length) return Math.max(...nums)
  const alt = [...html.matchAll(/page=(\d+)/g)].map((m) => Number(m[1]))
  return alt.length ? Math.max(...alt) : 1
}

async function fetchText(url, retries = 6) {
  for (let i = 0; i < retries; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    const res = await fetch(url, {
      headers: {
        ...HEADERS,
        Referer: "https://www.amazon.co.jp/",
        Accept: "text/html,application/xhtml+xml",
      },
    })
    if (!res.ok) {
      if (i === retries - 1) throw new Error(`HTTP ${res.status} for ${url}`)
      continue
    }
    const html = await res.text()
    if (html.includes("s-search-result") && html.length > 30000) return html
    if (i === retries - 1) throw new Error(`Blocked or empty response for ${url}`)
  }
  throw new Error(`Failed to fetch ${url}`)
}

async function main() {
  let all = []
  const localHtml = join(__dirname, "lenovo-search.html")
  if (process.argv.includes("--from-file") && existsSync(localHtml)) {
    console.log("Using cached lenovo-search.html")
    const html = readFileSync(localHtml, "utf8")
    all = parseOrganicResults(html, 1)
  } else {
    console.log("Fetching page 1...")
    const firstHtml = await fetchText(BASE_URL)
    writeFileSync(localHtml, firstHtml)
    const totalPages = getTotalPages(firstHtml)
    console.log(`  total pages: ${totalPages}`)
    all.push(...parseOrganicResults(firstHtml, 1))

    for (let page = 2; page <= totalPages; page++) {
      const url = `${BASE_URL}&page=${page}`
      console.log(`Fetching page ${page}...`)
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const html = await fetchText(url)
        all.push(...parseOrganicResults(html, page))
      } catch (err) {
        console.warn(`  page ${page} failed: ${err.message}`)
      }
    }
  }

  const byAsin = new Map()
  for (const item of all.sort((a, b) => a.amazonRank - b.amazonRank)) {
    if (!byAsin.has(item.asin)) byAsin.set(item.asin, item)
  }
  const raw = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)

  const excluded = raw.filter((item) => isMonitorAccessory(item.title))
  const monitors = raw.filter((item) => !isMonitorAccessory(item.title))

  console.log(`Total: raw=${raw.length}, kept=${monitors.length}, excluded=${excluded.length}`)
  for (const x of monitors) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price ?? "?"} ${x.title.slice(0, 90)}`)
  }
  if (excluded.length) {
    console.log("Excluded:")
    for (const x of excluded) {
      console.log(`  ${x.asin} ${x.title.slice(0, 80)}`)
    }
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        sourceUrl: BASE_URL,
        monitors,
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

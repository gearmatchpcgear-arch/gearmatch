/**
 * Fetch Amazon JP search results (popular brands, price band) → scripts/popular-brand-search.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT = join(__dirname, "popular-brand-search.json")

const BASE =
  "https://www.amazon.co.jp/s?i=computers&rh=n%3A2151978051%2Cp_n_g-101014971069111%3A26276190051%2Cp_36%3A350000-5060000&s=price-desc-rank&dc&fs=true"

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

function toHighResImage(url) {
  const m = url.match(/\/images\/I\/([A-Za-z0-9+\-]+)\./)
  if (m) return `https://m.media-amazon.com/images/I/${m[1]}._AC_SL1500_.jpg`
  return url
}

function parseSearchPage(html) {
  const items = []
  const re = /data-asin="([A-Z0-9]{10})"[^>]*data-index="(\d+)"/g
  let m
  while ((m = re.exec(html)) !== null) {
    const asin = m[1]
    const index = Number(m[2])
    if (!asin || index < 0) continue
    const start = Math.max(0, m.index - 500)
    const block = html.slice(start, m.index + 8000)
    const titleRaw =
      block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/)?.[1] ??
      block.match(/<img[^>]+alt="([^"]{15,})"/)?.[1]
    const title = titleRaw
      ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
      : asin
    const ratingMatch =
      block.match(/5つ星のうち([\d.]+)/) ||
      block.match(/([\d.]+)\s*out of 5 stars/i)
    const rating = ratingMatch ? Number(ratingMatch[1]) : 0
    const reviews = Number(
      block.match(/a-size-base s-underline-text">([\d,]+)</)?.[1]?.replace(/,/g, "") ??
        block.match(/>([\d,]+)\s*(?:ratings|件)/i)?.[1]?.replace(/,/g, "") ??
        "0",
    )
    const price = Number(
      block.match(/a-price-whole">([\d,]+)/)?.[1]?.replace(/,/g, "") ?? "0",
    )
    const imgRaw = block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]
    items.push({
      asin,
      index,
      title,
      rating,
      reviews,
      price,
      image: imgRaw ? toHighResImage(imgRaw) : "",
    })
  }
  return items
}

function isLikelyMouse(title) {
  const hay = title.toLowerCase()
  if (
    /mouse sole|マウスソール|スケート|jiggler|ジグラー|webcam|ウェブカメラ|バンドーレン|mouthpiece|マウスピース|bundle|バンドル|keyboard|キーボード|calculator|電卓|adapter only|アダプタのみ|hyperpolling.*adapter/i.test(
      hay,
    )
  ) {
    return false
  }
  return /mouse|マウス|トラックボール|trackball/i.test(hay)
}

async function fetchPage(page) {
  const url = page === 1 ? BASE : `${BASE}&page=${page}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status} page ${page}`)
  return res.text()
}

const allItems = []
const seen = new Set()

for (let page = 1; page <= 10; page++) {
  console.log(`fetch page ${page}...`)
  await new Promise((r) => setTimeout(r, page === 1 ? 0 : 1800))
  const html = await fetchPage(page)
  const items = parseSearchPage(html)
  if (items.length === 0) {
    console.log(`  no items on page ${page}, stop`)
    break
  }
  let added = 0
  for (const item of items) {
    if (seen.has(item.asin)) continue
    seen.add(item.asin)
    allItems.push({ ...item, page })
    added++
  }
  console.log(`  parsed ${items.length}, new ${added}, total ${allItems.length}`)
  const hasNext = /aria-label="Go to next page"/i.test(html) || /page=${page + 1}/.test(html)
  if (!hasNext && page > 1) break
}

const mice = allItems.filter((i) => isLikelyMouse(i.title))
console.log(`\nTotal: ${allItems.length}, likely mice: ${mice.length}`)

// Compare with existing
const existing = new Set()
for (const file of ["lib/mouse-bestsellers.ts", "lib/gadgets.ts"]) {
  const src = readFileSync(join(ROOT, file), "utf8")
  const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = re.exec(src)) !== null) existing.add(m[1])
}

const newOnes = mice.filter((i) => !existing.has(i.asin))
const existingOnes = mice.filter((i) => existing.has(i.asin))
console.log(`Already in DB: ${existingOnes.length}, new: ${newOnes.length}`)
newOnes.slice(0, 15).forEach((i) => console.log(`  NEW ${i.asin} ¥${i.price} ${i.title.slice(0, 60)}`))

writeFileSync(
  OUT,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      url: BASE,
      total: allItems.length,
      mice: mice.length,
      items: mice,
      newAsins: newOnes.map((i) => i.asin),
      existingAsins: existingOnes.map((i) => i.asin),
    },
    null,
    2,
  ),
)
console.log(`\nWrote ${OUT}`)

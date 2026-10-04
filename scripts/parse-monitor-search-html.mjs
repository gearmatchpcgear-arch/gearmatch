/**
 * Parse Amazon search HTML saved from browser into page JSON.
 * Usage: node scripts/parse-monitor-search-html.mjs <pageNumber> < html-file
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const page = Number(process.argv[2] || "1")
const html = readFileSync(0, "utf8")

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

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
  const title = titleRaw ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim()) : asin
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
  items.push({
    asin,
    title,
    price,
    rating,
    reviews,
    image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
    page,
  })
}

const out = join(__dirname, `monitor-search-22-120-page${page}.json`)
writeFileSync(out, JSON.stringify(items, null, 2) + "\n")
console.log(`Wrote ${out} (${items.length} items)`)

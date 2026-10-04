/**
 * gaming-chair-search-raw.json + 商品ページ詳細 → lib/gaming-chair-search.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  normalizeAmazonImageUrl,
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
} from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { buildGamingChairGadget } from "./amazon-gaming-chair-specs.mjs"
import { isGamingChairAccessory } from "./gaming-chair-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const RAW_PATH = join(__dirname, "gaming-chair-search-raw.json")
const CACHE_PATH = join(__dirname, "gaming-chair-search-image-cache.json")
const OUT_PATH = join(ROOT, "lib", "gaming-chair-search.ts")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const imageCache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
    }
  }
  return null
}

function parseLivePrice(html) {
  const m =
    html.match(/class="a-price-whole">([\d,]+)/) ??
    html.match(/a-offscreen">￥([\d,]+)/) ??
    html.match(/￥([\d,]+)/)
  return m ? Number(m[1].replace(/,/g, "")) : null
}

function parseReviews(html) {
  const m =
    html.match(/acrCustomerReviewText[^>]*>\s*([\d,]+)/) ??
    html.match(/"reviewCount"\s*:\s*"([\d,]+)"/)
  return m ? Number(m[1].replace(/,/g, "")) : null
}

function parseRating(html) {
  const m =
    html.match(/5つ星のうち([\d.]+)/) ??
    html.match(/"ratingValue"\s*:\s*"([\d.]+)"/)
  return m ? Number(m[1]) : null
}

function toTs(catalog) {
  const sorted = [...catalog].sort((a, b) => (a.amazonRank ?? 999) - (b.amazonRank ?? 999))
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp ゲーミングチェア検索（k=ゲーミングチェア+amazon）。本体・座椅子のみ。 */",
    "export const gamingChairSearch: Gadget[] = [",
  ]

  for (const g of sorted) {
    const image = normalizeAmazonImageUrl(g.image) || g.image || ""
    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(g.id)},`)
    lines.push(`    category: "gaming-chair",`)
    lines.push(`    name: ${JSON.stringify(g.name)},`)
    lines.push(`    brand: ${JSON.stringify(g.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(g.tagline)},`)
    lines.push(`    price: ${g.price ?? "null"},`)
    lines.push(`    rating: ${g.rating ?? 4.0},`)
    lines.push(`    reviews: ${g.reviews ?? 0},`)
    lines.push(`    image: ${JSON.stringify(image)},`)
    lines.push(`    connection: "—",`)
    lines.push(`    purchaseUrl: ${JSON.stringify(g.purchaseUrl)},`)
    lines.push(`    highlights: [`)
    for (const h of g.highlights) {
      lines.push(
        `      { label: ${JSON.stringify(h.label)}, value: ${JSON.stringify(h.value)} },`,
      )
    }
    lines.push(`    ],`)
    lines.push(`    compat: [],`)
    lines.push(`    specGroups: [`)
    for (const sg of g.specGroups) {
      lines.push(`      { title: ${JSON.stringify(sg.title)}, rows: [`)
      for (const r of sg.rows) {
        lines.push(
          `          { label: ${JSON.stringify(r.label)}, value: ${JSON.stringify(r.value)} },`,
        )
      }
      lines.push(`        ]},`)
    }
    lines.push(`    ],`)
    lines.push(`  },`)
  }

  lines.push("]", "")
  return lines.join("\n")
}

async function main() {
  if (!existsSync(RAW_PATH)) {
    console.error("Run fetch-gaming-chair-search.mjs first")
    process.exit(1)
  }

  const { gamingChairs } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
  const catalog = []

  console.log(`Fetching details for ${gamingChairs.length} search chairs...`)

  for (let i = 0; i < gamingChairs.length; i++) {
    const item = gamingChairs[i]
    const asin = item.asin
    process.stdout.write(`[${i + 1}/${gamingChairs.length}] ${asin} ... `)

    let title = item.title
    if (isGamingChairAccessory(title)) {
      console.log(`skip (accessory): ${title.slice(0, 50)}`)
      continue
    }

    const html = await fetchPage(asin)
    await new Promise((r) => setTimeout(r, 850))

    let price = item.price
    let image = item.image
    let rating = item.rating
    let reviews = item.reviews

    if (html) {
      const pageTitle = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1]
      if (pageTitle) title = pageTitle.replace(/<[^>]+>/g, "").trim()
      if (isGamingChairAccessory(title)) {
        console.log(`skip (accessory page): ${title.slice(0, 50)}`)
        continue
      }
      const livePrice = parseLivePrice(html)
      if (livePrice) price = livePrice
      const liveReviews = parseReviews(html)
      if (liveReviews != null) reviews = liveReviews
      const liveRating = parseRating(html)
      if (liveRating != null) rating = liveRating
      cacheAmazonImageFromHtml(imageCache, asin, html)
      const fetchedImg = extractAmazonMainImage(html)
      if (fetchedImg) image = fetchedImg
    }

    image = normalizeAmazonImageUrl(image)
    price = normalizeImportedPrice(price)

    const rank = item.amazonRank ?? item.rank
    const gadget = buildGamingChairGadget(
      { ...item, title, price, image, rating, reviews, rank },
      { html: html ?? "", price, image, rating, reviews },
    )

    gadget.id = `chair-sr-${String(rank).padStart(3, "0")}-${asin.toLowerCase()}`
    gadget.amazonRank = rank
    const listingGroup = gadget.specGroups.find((g) => g.title === "Amazon売れ筋")
    if (listingGroup) {
      listingGroup.title = "Amazon検索"
      listingGroup.rows = [{ label: "検索順位", value: `#${rank}` }]
    }

    catalog.push(gadget)
    console.log(`${gadget.name} | ${gadget.highlights[0].value} | ¥${price ?? "?"}`)
  }

  const filtered = catalog.filter((g) => {
    const hay = [g.name, g.tagline, g.brand, g.purchaseUrl].filter(Boolean).join(" ")
    return !isGamingChairAccessory(hay)
  })
  if (filtered.length !== catalog.length) {
    console.log(`Post-filter removed ${catalog.length - filtered.length} accessories`)
  }

  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  writeFileSync(OUT_PATH, toTs(filtered))
  console.log(`\nWrote ${filtered.length} items → ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

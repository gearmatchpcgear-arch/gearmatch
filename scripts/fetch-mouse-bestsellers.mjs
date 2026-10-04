/**
 * Amazon.co.jp マウス売れ筋ランキング TOP100 → lib/mouse-bestsellers.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import {
  extractAmazonMainImage,
  normalizeAmazonImageUrl,
  resolveGadgetImage,
} from "./amazon-image.mjs"
import { parseListingRatingReviews, sanitizeAmazonListingRatingReviews } from "./amazon-listing-rating-parse.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const IMAGE_CACHE_PATH = join(__dirname, "mouse-image-cache.json")
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}
const DASH = "—"
const EXISTING_ASINS = new Set([
  "B0B1Q6VB16",
  "B0CGR5B9FS",
  "B0BL2KH18B",
  "B0956X785M",
])

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
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

function toHighResImage(url) {
  return normalizeAmazonImageUrl(url)
}

function parseItemBlock(block, asin, rank) {
  const titleRaw =
    block.match(/p13n-sc-css-line-clamp-2[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
    block.match(/<img[^>]+alt="([^"]{15,})"/)?.[1]
  const title = titleRaw
    ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
    : asin

  const { rating, reviews } = parseListingRatingReviews(block)
  const price = Number(
    block
      .match(/_cDEzb_p13n-sc-price_3mJ9Z">￥([\d,]+)/)?.[1]
      ?.replace(/,/g, "") ?? "0",
  )
  const imgRaw = block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]

  return {
    rank,
    asin,
    title,
    rating,
    reviews,
    price,
    image: imgRaw ? toHighResImage(imgRaw) : "",
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

function extractBrand(title) {
  const rules = [
    ["Logicool G", /logicool\s*g|logitech\s*g/i],
    ["Logicool", /logicool|logitech|ロジクール/i],
    ["ELECOM", /elecom|エレコム/i],
    ["Buffalo", /buffalo|バッファロー/i],
    ["Apple", /magic mouse|apple/i],
    ["HP", /\bhp\b/i],
    ["Sanwa Direct", /sanwa direct|サンワダイレクト/i],
    ["Sanwa Supply", /sanwa supply|サンワサプライ/i],
    ["Amazon Basics", /amazon basics|amazon basic/i],
    ["UGREEN", /ugreen/i],
    ["AIM1", /\baim1\b/i],
    ["ProtoArc", /protoarc/i],
    ["ESR", /\besr\b/i],
    ["Technet", /technet/i],
    ["GREENHOUSE", /greenhouse/i],
    ["VAYDEER", /vaydeer/i],
    ["WALLHACK", /wallhack/i],
    ["Aenllosi", /aenllosi/i],
    ["Ewin", /ewin/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return "—"
}

function inferConnection(title) {
  if (/magic mouse/i.test(title)) return "Bluetooth"
  const has24 =
    /2\.4\s*ghz|2\.4g\b|lightspeed|logi bolt|logibolt|レシーバー付|usbドングル|usbレシーバー/i.test(
      title,
    ) && !/レシーバーのみ|receiver only/i.test(title)
  const hasBt = /bluetooth|ブルートゥース/i.test(title)
  const wireless = /wireless|ワイヤレス|無線|cordless/i.test(title)
  const wired =
    (/有線|wired/i.test(title) && !wireless && !hasBt && !has24) ||
    (/usb接続/i.test(title) && !wireless && !hasBt && !has24)

  const parts = []
  if (has24) {
    if (/logi bolt|logibolt/i.test(title)) parts.push("2.4GHz (Logi Bolt)")
    else if (/lightspeed/i.test(title)) parts.push("2.4GHz (LIGHTSPEED)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (hasBt) parts.push("Bluetooth")
  if (parts.length > 0) return parts.join(" / ")
  if (wireless) return "2.4GHz (USBレシーバー)"
  if (/unifying receiver|ユニファイングレシーバー/i.test(title)) return DASH
  return "有線 USB"
}

function inferReadingMethod(title) {
  if (/trackball|トラックボール/i.test(title)) return "トラックボール"
  if (/blueled|blue led|bluel?ed/i.test(title)) return "BlueLED"
  return DASH
}

function inferMouseUsage(title) {
  if (
    /mouse sole|マウスソール|スケート|jiggler|ジグラー|unifying receiver|ユニファイング|protective storage|storage case|専用.*ケース|ケースのみ|ケース \(/i.test(
      title,
    )
  )
    return "productivity"
  if (
    /gaming|ゲーミング|polling rate|8,000\s*hz|8000\s*hz|26000\s*dpi|paw3395|superlight|viper|deathadder|\baim1\b/i.test(
      title,
    )
  )
    return "gaming"
  return "productivity"
}

async function searchAsin(query) {
  const html = await fetchText(
    `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}`,
  )
  const asins = [
    ...new Set(
      [...html.matchAll(/\/dp\/([A-Z0-9]{10})/gi)].map((m) => m[1].toUpperCase()),
    ),
  ]
  return asins[0] ?? null
}

async function enrichProduct(item) {
  try {
    const html = await fetchText(`https://www.amazon.co.jp/dp/${item.asin}`)
    const titleM = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)
    if (titleM) item.title = decodeHtml(titleM[1].replace(/\s+/g, " ").trim())
    const img = extractAmazonMainImage(html)
    if (img) item.image = img
    const ratingM =
      html.match(/"ratingValue":([\d.]+)/) ||
      html.match(/5つ星のうち([\d.]+)/)
    if (ratingM) item.rating = Number(ratingM[1])
    const reviewM = html.match(/"reviewCount":(\d+)/)
    if (reviewM) item.reviews = Number(reviewM[1])
    const priceM = html.match(/class="a-price-whole">([\d,]+)/)
    if (priceM && !item.price) item.price = Number(priceM[1].replace(/,/g, ""))
  } catch {
    /* keep seed values */
  }
}

function buildGadget(entry) {
  const { rank, asin, title, price, image } = entry
  const { rating, reviews } = sanitizeAmazonListingRatingReviews(entry.rating, entry.reviews)
  const reading = inferReadingMethod(title)
  const connection = inferConnection(title)
  const tagline = title.length > 140 ? title.slice(0, 137) + "…" : title
  const name = title.length > 72 ? title.slice(0, 69) + "…" : title

  return {
    id: `m-bs-${String(rank).padStart(3, "0")}`,
    category: "mouse",
    name,
    brand: extractBrand(title),
    tagline,
    price: price ? normalizeImportedPrice(price, asin, {}) : null,
    rating,
    reviews,
    image: resolveGadgetImage(asin, image, imageCache),
    connection,
    purchaseUrl: `https://www.amazon.co.jp/dp/${asin}`,
    mouseUsage: inferMouseUsage(title),
    highlights: [
      { label: "重量", value: DASH },
      { label: "最大DPI", value: DASH },
      { label: "読み取り方式", value: reading },
      { label: "ポーリングレート", value: DASH },
    ],
    compat: [],
    specGroups: [
      { title: "サイズ / 重量", rows: [{ label: "重量", value: DASH }] },
      {
        title: "センサー / 入力",
        rows: [
          { label: "最大 DPI", value: DASH },
          { label: "ポーリングレート", value: DASH },
          { label: "読み取り方式", value: reading },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [{ label: "接続方式", value: connection }],
      },
    ],
  }
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp マウス売れ筋 TOP100（2151978051）。公式未公表スペックは「—」。 */`,
    `export const mouseBestsellers: Gadget[] = [`,
  ]
  for (const g of gadgets) {
    lines.push("  {")
    for (const [k, v] of Object.entries({
      id: g.id,
      category: "mouse",
      name: g.name,
      brand: g.brand,
      tagline: g.tagline,
      price: g.price,
      rating: g.rating,
      reviews: g.reviews,
      image: g.image,
      connection: g.connection,
      purchaseUrl: g.purchaseUrl,
      mouseUsage: g.mouseUsage,
    })) {
      lines.push(
        typeof v === "string"
          ? `    ${k}: ${JSON.stringify(v)},`
          : `    ${k}: ${v},`,
      )
    }
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
  const urls = [
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051",
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_2?pg=2",
  ]
  const all = []
  for (const url of urls) {
    const html = await fetchText(url)
    const items = parsePage(html)
    console.log(`${url.includes("pg=2") ? "p2" : "p1"}: ${items.length}`)
    all.push(...items)
    await new Promise((r) => setTimeout(r, 2000))
  }

  const byRank = new Map()
  for (const item of all) byRank.set(item.rank, item)

  const gaps = JSON.parse(
    readFileSync(join(ROOT, "scripts", "bestseller-gaps.json"), "utf8"),
  )
  const gapAsins = JSON.parse(
    readFileSync(join(ROOT, "scripts", "bestseller-gap-asins.json"), "utf8"),
  )
  for (const gap of gaps) {
    if (byRank.has(gap.rank)) continue
    const staticAsin = gapAsins[String(gap.rank)]
    let asin = staticAsin ?? null
    if (!asin) {
      console.log(`gap rank ${gap.rank}: searching ${gap.search}`)
      asin = await searchAsin(gap.search)
      await new Promise((r) => setTimeout(r, 1200))
    } else {
      console.log(`gap rank ${gap.rank}: static ${asin}`)
    }
    if (!asin || EXISTING_ASINS.has(asin)) {
      console.warn(`  skip rank ${gap.rank} (no ASIN)`)
      continue
    }
    byRank.set(gap.rank, {
      rank: gap.rank,
      asin,
      title: gap.title,
      rating: gap.rating,
      reviews: gap.reviews,
      price: gap.price,
      image: "",
    })
  }

  let items = [...byRank.values()].sort((a, b) => a.rank - b.rank)

  for (const item of items) {
    if (!item.image || item.image.includes("placeholder")) {
      await enrichProduct(item)
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  const skipped = items.filter((i) => EXISTING_ASINS.has(i.asin))
  items = items.filter((i) => !EXISTING_ASINS.has(i.asin))

  console.log(
    `Total ranks: ${byRank.size}, export: ${items.length}, skip existing: ${skipped.length}`,
  )

  writeFileSync(
    join(ROOT, "lib", "mouse-bestsellers.ts"),
    toTs(items.map(buildGadget)),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

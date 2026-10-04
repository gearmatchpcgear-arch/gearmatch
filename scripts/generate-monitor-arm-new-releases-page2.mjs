/**
 * monitor-arm-new-releases-page2-raw.json + 商品ページ詳細 → lib/monitor-arm-new-releases-page2.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  normalizeAmazonImageUrl,
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
} from "./amazon-image.mjs"
import { normalizeImportedPrice, parseAmazonPrice } from "./amazon-price.mjs"
import { buildMonitorArmGadget } from "./amazon-monitor-arm-specs.mjs"
import { MONITOR_ARM_SPECS_KNOWN } from "./monitor-arm-specs-known.mjs"
import { isMonitorArmBody, isMonitorArmAccessory } from "./monitor-arm-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const RAW_PATH = join(__dirname, "monitor-arm-new-releases-page2-raw.json")
const OVERRIDES_PATH = join(__dirname, "monitor-arm-new-releases-page2-spec-overrides.json")
const PAGE1_OVERRIDES_PATH = join(__dirname, "monitor-arm-new-releases-spec-overrides.json")
const CACHE_PATH = join(__dirname, "monitor-arm-new-releases-page2-image-cache.json")
const OUT_PATH = join(ROOT, "lib", "monitor-arm-new-releases-page2.ts")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const imageCache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const OVERRIDES = {
  ...(existsSync(PAGE1_OVERRIDES_PATH)
    ? JSON.parse(readFileSync(PAGE1_OVERRIDES_PATH, "utf8"))
    : {}),
  ...(existsSync(OVERRIDES_PATH) ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8")) : {}),
}

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

function parseLiveTitle(html) {
  const m = html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/)
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null
}

function toTs(catalog) {
  const sorted = [...catalog].sort((a, b) => (a.amazonRank ?? 999) - (b.amazonRank ?? 999))
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp コンピュータモニターアーム 新着2ページ目（10351517051 pg=2）。本体のみ。 */",
    "export const monitorArmNewReleasesPage2: Gadget[] = [",
  ]

  for (const g of sorted) {
    const image = normalizeAmazonImageUrl(g.image) || g.image || ""
    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(g.id)},`)
    lines.push(`    category: "monitor-arm",`)
    lines.push(`    name: ${JSON.stringify(g.name)},`)
    lines.push(`    brand: ${JSON.stringify(g.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(g.tagline)},`)
    lines.push(`    price: ${g.price ?? "null"},`)
    lines.push(`    rating: ${g.rating ?? 4.0},`)
    lines.push(`    reviews: ${g.reviews ?? 0},`)
    lines.push(`    image: ${JSON.stringify(image)},`)
    lines.push(`    connection: ${JSON.stringify(g.connection ?? "—")},`)
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
    console.error("Run fetch-monitor-arm-new-releases-page2.mjs first")
    process.exit(1)
  }

  const { monitorArms } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
  const catalog = []

  for (let i = 0; i < monitorArms.length; i++) {
    const item = monitorArms[i]
    const asin = item.asin
    const override = OVERRIDES[asin] ?? {}
    const known = { ...MONITOR_ARM_SPECS_KNOWN[asin], ...override }
    process.stdout.write(`[${i + 1}/${monitorArms.length}] ${asin} ... `)

    let title = override.title ?? item.title
    let image = item.image ?? ""
    let price = item.price ?? null
    let html = null

    html = await fetchPage(asin)
    await new Promise((r) => setTimeout(r, 800))

    if (html) {
      title = parseLiveTitle(html) ?? title
      const livePrice = parseAmazonPrice(html)
      if (livePrice) price = livePrice
      const mainImage = extractAmazonMainImage(html)
      if (mainImage) image = mainImage
      cacheAmazonImageFromHtml(imageCache, asin, html)
    }

    if (isMonitorArmAccessory(title) || !isMonitorArmBody(title, asin)) {
      console.log(`skip: ${title.slice(0, 50)}`)
      continue
    }

    if (imageCache[asin]?.image) image = imageCache[asin].image

    const built = buildMonitorArmGadget(
      {
        ...item,
        title,
        price: normalizeImportedPrice(price, asin, {
          ...MONITOR_ARM_SPECS_KNOWN,
          ...OVERRIDES,
        }),
        image,
      },
      {
        html: html ?? "",
        id: `arm-nr2-${String(item.amazonRank).padStart(2, "0")}`,
        ...known,
      },
    )

    built.amazonRank = item.amazonRank
    built.specGroups[1].rows.push({
      label: "Amazon新着",
      value: `モニターアーム pg2 #${item.amazonRank}`,
    })

    catalog.push(built)
    console.log(built.name)
  }

  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  writeFileSync(OUT_PATH, toTs(catalog))
  console.log(`Wrote ${catalog.length} items → ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

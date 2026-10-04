/**
 * monitor-lg-display-raw.json + 商品ページ → monitor-lg-display-catalog.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
  normalizeAmazonImageUrl,
} from "./amazon-image.mjs"
import { normalizeImportedPrice, parseAmazonPrice } from "./amazon-price.mjs"
import { parseAmazonMonitorBodySpecs } from "./amazon-monitor-body-specs.mjs"
import {
  buildMonitorGadget,
  inferMonitorFilterTags,
  DASH,
} from "./amazon-monitor-specs.mjs"
import { MONITOR_LG_DISPLAY_SPECS_KNOWN } from "./monitor-lg-display-specs-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_PATH = join(__dirname, "monitor-lg-display-raw.json")
const CACHE_PATH = join(__dirname, "monitor-image-cache.json")
const OUT_PATH = join(__dirname, "monitor-lg-display-catalog.json")

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

function parseLiveTitle(html) {
  const m = html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/)
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null
}

function portRows(connection) {
  if (!connection || connection === DASH) {
    return [{ label: "接続端子", value: DASH }]
  }
  return connection.split(" / ").map((p) => ({
    label: p.trim(),
    value: "対応",
  }))
}

function shortRes(resolution) {
  if (/4K|3840/.test(resolution)) return "4K UHD"
  if (/UW-FHD|2560 x 1080/.test(resolution)) return "UW-FHD"
  if (/QHD|2560 x 1440/.test(resolution)) return "QHD"
  if (/FHD|1920/.test(resolution)) return "FHD"
  return resolution
}

function sizeDisplay(screenSize) {
  const m = String(screenSize).match(/([\d.]+)/)
  return m ? `${m[1]}"` : DASH
}

function enrichGadget(base, known, body, rank) {
  const responseTime = known.responseTime ?? DASH
  const vesa = known.vesa ?? DASH
  const panelShort =
    known.panel?.split(" ")[0] === "—" ? "—" : known.panel?.split("(")[0].trim() ?? base.specGroups[0]?.rows.find((r) => r.label === "パネル")?.value

  const gadget = {
    ...base,
    id: `mon-lg-${String(rank).padStart(3, "0")}`,
    rank,
    name: known.name ?? base.name,
    brand: known.brand ?? base.brand,
    tagline: known.tagline ?? base.tagline,
    price: known.price ?? base.price,
    connection: known.connection ?? base.connection,
    highlights: [
      { label: "画面サイズ", value: sizeDisplay(known.screenSize ?? DASH) },
      { label: "解像度", value: shortRes(known.resolution ?? DASH) },
      { label: "リフレッシュ", value: known.refreshRate ?? DASH },
      { label: "パネル", value: panelShort ?? DASH },
    ],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: known.screenSize ?? DASH },
          { label: "解像度", value: known.resolution ?? DASH },
          { label: "パネル", value: known.panel ?? DASH },
          { label: "リフレッシュレート", value: known.refreshRate ?? DASH },
          { label: "応答速度", value: responseTime },
          { label: "Amazon売れ筋", value: `ディスプレイ #${rank}` },
        ],
      },
      {
        title: "接続端子",
        rows: portRows(known.connection ?? base.connection),
      },
      {
        title: "本体",
        rows: [
          { label: "壁掛け対応（VESA規格）", value: vesa },
          { label: "寸法", value: body.dimensions ?? DASH },
          { label: "重量", value: body.weight ?? DASH },
        ],
      },
    ],
  }

  gadget.monitorFilterTags = inferMonitorFilterTags(gadget)
  return gadget
}

async function main() {
  const { monitors } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
  const catalog = []

  for (let i = 0; i < monitors.length; i++) {
    const item = monitors[i]
    const asin = item.asin
    const known = MONITOR_LG_DISPLAY_SPECS_KNOWN[asin] ?? {}
    process.stdout.write(`[${i + 1}/${monitors.length}] ${asin} ... `)

    let title = item.title
    let image = item.image ?? ""
    let price = item.price
    let html = null

    html = await fetchPage(asin)
    await new Promise((r) => setTimeout(r, 900))

    if (html) {
      title = parseLiveTitle(html) ?? title
      const livePrice = parseAmazonPrice(html)
      if (livePrice) price = livePrice
      const mainImage = extractAmazonMainImage(html)
      if (mainImage) image = mainImage
      cacheAmazonImageFromHtml(imageCache, asin, html)
    }

    if (imageCache[asin]?.image) image = imageCache[asin].image

    price = normalizeImportedPrice(price, asin, MONITOR_LG_DISPLAY_SPECS_KNOWN)

    const body = html
      ? parseAmazonMonitorBodySpecs(html)
      : { dimensions: DASH, weight: DASH }

    const base = buildMonitorGadget(
      { ...item, title, price, image: normalizeAmazonImageUrl(image) },
      item.rank - 1,
      {
        brand: known.brand,
        name: known.name,
        screenSize: known.screenSize,
        resolution: known.resolution,
        refreshRate: known.refreshRate,
        panel: known.panel,
        connection: known.connection,
        tagline: known.tagline,
        price,
      },
    )

    const built = enrichGadget(base, known, body, item.rank)
    built.asin = asin
    catalog.push(built)
    console.log(built.name)
  }

  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  writeFileSync(OUT_PATH, JSON.stringify({ catalog }, null, 2))
  console.log(`Wrote ${catalog.length} items → ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

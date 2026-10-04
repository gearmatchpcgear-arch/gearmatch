/**
 * AKRacing ゲーミングチェア / ライフスタイルチェア / Facility Chair ストア商品を Amazon から取得
 * ストア:
 * - https://www.amazon.co.jp/stores/page/6F6E035D-B03B-4244-92D9-148DD2F77C34
 * - https://www.amazon.co.jp/stores/page/1EC7261B-BE1A-4372-B57E-0E9D8F6C44C9
 * - https://www.amazon.co.jp/stores/page/AD8C00B9-8797-40C6-9F4F-47777D832F8B
 */
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import {
  normalizeAmazonImageUrl,
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
} from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import {
  buildGamingChairGadget,
  formatFrameMaterialForCard,
  formatMaxRecliningAngleForCard,
} from "./amazon-gaming-chair-specs.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGE_CACHE = join(__dirname, "akracing-store-image-cache.json")
const OUT = join(__dirname, "akracing-store-catalog.json")

/** ライフスタイル + ゲーミングチェアストアの主要 ASIN */
const SEED_ASINS = [
  // ライフスタイルチェアストア
  "B0BFWFP8XV", // Premium Denim
  "B0BFWDQMZ1", // Gyokuza Denim
  "B0BSP8RJ6J", // 本田翼監修
  "B0GFSNMZVN", "B0GFSRLV6P", "B0GFTGC45R", "B0GFT7GKQS", // Faura
  // Gyokuza V2 座椅子
  "B075RB9WJ3", "B075RC4JHR", "B075RC4JHS", "B0BL3CQX5J",
  // Pro-X V2
  "B086JTT1GM", "B086JS8F4L", "B086JTCGZR", "B086JT5BNJ", "B08YWBK2Y9",
  // Overture
  "B07CBPDBKP", "B07BZC81RV", "B07CF8N2VL", "B07CBPDVPG", "B0CVZXQ6B7",
  "B07CBPCZ8R", "B07CBPDMCC",
  // Nitro V2
  "B086JTJ394", "B086JTZJB4", "B086JTZJB3", "B086JSTPSK", "B086JSFTVN",
  // Wolf
  "B01G8E2ETQ", "B01G8E3J3G", "B01G8E6NZW", "B083J8QMMT",
  // Eclair
  "B0F62Y1Z2B", "B0F631GTBC", "B0F62WXZ5M", "B0F62V3ZXS",
  // Premium
  "B075R8GZR9", "B075R8DPJ5", "B075R8696C",
  // Facility Chair ストア — Pro-X JP
  "B0DQ72DWQ4", "B0F1FG7K3X", "B0DQ74NP5P", "B0F1FDQH3Y",
  // Facility Chair ストア — MJ Grey
  "B0H4QK77YH", "B0H69Q5KQ1",
  // Collaboration Chair ストア
  "B094QHNK83", // Pro-X V2 ジャイアンツ
  "B0D1QLTD5G", // 東京ヤクルトスワローズ
  "B0CZ943PLQ", // Pro-X V2 ドラゴンズ
  "B0D4LLT6FC", // 阪神タイガース
  "B0GXDRY84Q", // Pro-X V2 ライオンズ
  "B0B6NP6CNX", // サッカー日本代表
  "B0H2LQ86PL", "B0G4VTM8WM", // FC東京2024
  "B0FZ13KWGV", // FC町田ゼルビア
]

const SERIES_OVERRIDES = {
  "honda-yuki": {
    series: "本田翼 監修",
    material: "高耐久PUレザー",
    maxRecliningAngle: "150°",
    warranty: "5年保証",
    style: "office",
  },
  "premium-denim": {
    series: "Premium Denim",
    material: "岡山デニム",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "office",
  },
  "gyokuza-denim": {
    series: "Gyokuza Denim",
    material: "岡山デニム",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "floor",
  },
  gyokuza: {
    series: "Gyokuza V2",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "floor",
  },
  "pro-x-jp": {
    series: "Pro-X JP",
    material: "国産高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "office",
  },
  "pro-x": {
    series: "Pro-X V2",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "bucket",
  },
  "mj-grey": {
    series: "MJ Grey",
    material: "高耐久PUレザー",
    maxRecliningAngle: "135°",
    warranty: "5年保証",
    style: "bucket",
  },
  overture: {
    series: "Overture",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "bucket",
  },
  nitro: {
    series: "Nitro V2",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "bucket",
  },
  wolf: {
    series: "Wolf",
    material: "ファブリック",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "bucket",
  },
  eclair: {
    series: "Eclair",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "bucket",
  },
  premium: {
    series: "Premium",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "office",
  },
  faura: {
    series: "Faura",
    material: "スエード調ファブリック",
    maxRecliningAngle: "180°",
    warranty: "5年保証",
    style: "office",
  },
  "collab-giants": {
    series: "Pro-X V2 ジャイアンツ",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-swallows": {
    series: "東京ヤクルトスワローズ",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-dragons": {
    series: "Pro-X V2 ドラゴンズ",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-tigers": {
    series: "阪神タイガース",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-lions": {
    series: "Pro-X V2 ライオンズ",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-japan-nt": {
    series: "サッカー日本代表",
    material: "高耐久PUレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-fc-tokyo": {
    series: "FC東京",
    material: "PVCレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
  "collab-zelvia": {
    series: "FC町田ゼルビア",
    material: "PVCレザー",
    maxRecliningAngle: "180°",
    warranty: "1年保証",
    style: "bucket",
  },
}

function detectSeries(title) {
  const t = title.toLowerCase()
  if (/本田翼/.test(title)) return "honda-yuki"
  if (/gyokuza\s*denim|極坐.*デニム|玉座.*デニム|gyokuza denim/i.test(title)) return "gyokuza-denim"
  if (/gyokuza|極坐|玉座/i.test(title)) return "gyokuza"
  if (/premium\s*denim|プレミアム\s*デニム/i.test(title)) return "premium-denim"
  if (/faura|ファウラ/i.test(title)) return "faura"
  if (/ジャイアンツ|giants/i.test(title)) return "collab-giants"
  if (/スワローズ|swallows/i.test(title)) return "collab-swallows"
  if (/ドラゴンズ|dragons/i.test(title)) return "collab-dragons"
  if (/タイガース|tigers/i.test(title)) return "collab-tigers"
  if (/ライオンズ|lions/i.test(title)) return "collab-lions"
  if (/日本代表|national team|soccer japan/i.test(title)) return "collab-japan-nt"
  if (/fc東京|fc tokyo/i.test(title)) return "collab-fc-tokyo"
  if (/ゼルビア|zelvia/i.test(title)) return "collab-zelvia"
  if (/pro-?x\s*jp|pro-x jp/i.test(title)) return "pro-x-jp"
  if (/mj\s*grey|mj grey|ファシリティチェア\s*mj/i.test(title)) return "mj-grey"
  if (/pro-?x/i.test(t)) return "pro-x"
  if (/overture|オーバチュア/i.test(t)) return "overture"
  if (/nitro/i.test(t)) return "nitro"
  if (/wolf|ウルフ/i.test(t)) return "wolf"
  if (/eclair|エクレール/i.test(t)) return "eclair"
  if (/premium|プレミアム/i.test(t)) return "premium"
  return null
}

function parsePrice(html) {
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
  return m ? Number(m[1].replace(/,/g, "")) : 0
}

function parseRating(html) {
  const m = html.match(/5つ星のうち([\d.]+)/) ?? html.match(/"ratingValue"\s*:\s*"([\d.]+)"/)
  return m ? Number(m[1]) : 4.0
}

function inferArmrestWarranty(hay, seriesKey) {
  let armrest = "4Dアームレスト"
  if (/3d\s*アーム|3Dアーム/i.test(hay)) armrest = "3Dアームレスト"
  if (/2d\s*アーム|2Dアーム/i.test(hay)) armrest = "2Dアームレスト"
  if (/固定アーム|アームレストなし|座椅子/i.test(hay) && !/4d|4D/i.test(hay)) {
    armrest = /座椅子|gyokuza|極坐|玉座/i.test(hay) ? "可動式アームレスト" : "固定アームレスト"
  }

  let warranty = SERIES_OVERRIDES[seriesKey]?.warranty ?? "5年保証"
  if (/3年保証/i.test(hay)) warranty = "3年保証"
  if (/1年保証/i.test(hay)) warranty = "1年保証"
  if (/5年保証/i.test(hay)) warranty = "5年保証"
  return `${armrest} / ${warranty}`
}

function sanitizeDimensions(raw) {
  if (!raw) return raw
  return String(raw).replace(
    /(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*×\s*(\d{4,})\s*cm/i,
    (_, w, d, h) => `${w} × ${d} × ${h.slice(0, -1)} cm`,
  )
}

function formatDimensionWeight(gadget, detailMap) {
  const parts = []
  let dim = gadget.dimensions
  if (!dim) {
    dim =
      detailMap["商品の寸法"] ??
      detailMap["製品サイズ"] ??
      detailMap["サイズ"] ??
      detailMap["本体サイズ"]
    dim = dim ? String(dim).replace(/\s+/g, " ").trim() : null
  }
  if (dim) parts.push(sanitizeDimensions(dim))
  const weight = detailMap["商品重量"] ?? detailMap["重量"] ?? detailMap["梱包重量"]
  if (weight) parts.push(String(weight).replace(/\s+/g, " ").trim())
  if (gadget.seatWidth) parts.push(`座面幅 ${gadget.seatWidth}`)
  if (gadget.backrestWidth) parts.push(`背もたれ幅 ${gadget.backrestWidth}`)
  return parts.length ? parts.join(" / ") : "—"
}

const imageCache = existsSync(IMAGE_CACHE) ? JSON.parse(readFileSync(IMAGE_CACHE, "utf8")) : {}
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ locale: "ja-JP" })
const catalog = []
const processed = new Set()

async function processAsin(asin) {
  if (processed.has(asin)) return
  processed.add(asin)

  process.stdout.write(`${asin} `)
  try {
    await page.goto(`https://www.amazon.co.jp/dp/${asin}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    })
    await page.waitForTimeout(1400)
    const html = await page.content()

    if (/Page Not Found|お探しのページ|犬の画像/i.test(html)) {
      console.log("NOT_FOUND")
      return
    }

    const title =
      html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
      asin

    if (!/akracing|エーケーレーシング/i.test(title + html.slice(0, 5000))) {
      console.log("SKIP(non-AKRacing)")
      return
    }

    if (
      /\+フットレスト|フットレストセット|\+ Footrest|座面パーツ|ガスシリンダー|交換用|カップホルダー|クッションセット|ブランドBook|BEAMS/i.test(
        title,
      )
    ) {
      console.log("SKIP(non-chair)")
      return
    }

    const detailMap = parseDetailTable(html)
    const seriesKey = detectSeries(title)
    const seriesMeta = seriesKey ? SERIES_OVERRIDES[seriesKey] : null

    let recline =
      seriesKey === "honda-yuki"
        ? "150°"
        : (seriesMeta?.maxRecliningAngle ??
          resolveGamingChairReclineAngle(asin, `${title} ${JSON.stringify(detailMap)}`))

    if (seriesKey === "eclair" && recline === "—") recline = "180°"

    const material =
      seriesMeta?.material ??
      (/デニム|denim/i.test(title) ? "岡山デニム" : null) ??
      (/ファブリック|fabric|布/i.test(title) ? "ファブリック" : null) ??
      (/PU|レザー|leather/i.test(title) ? "高耐久PUレザー" : "—")

    const price = normalizeImportedPrice(parsePrice(html))
    const rating = parseRating(html)
    const reviews = parseReviews(html)
    cacheAmazonImageFromHtml(imageCache, asin, html)
    const image = normalizeAmazonImageUrl(extractAmazonMainImage(html) ?? "")

    const gadget = buildGamingChairGadget(
      { asin, title, price, rating, reviews, rank: null },
      {
        html,
        price,
        rating,
        reviews,
        image,
        brand: "AKRacing",
        maxRecliningAngle: recline !== "—" ? recline : undefined,
        material,
        dimensions: GAMING_CHAIR_DIMENSIONS_KNOWN[asin],
        style:
          seriesMeta?.style === "floor"
            ? "座椅子タイプ"
            : seriesMeta?.style === "office"
              ? "オフィスチェア型"
              : undefined,
      },
    )

    gadget.id = `chair-akr-${asin.slice(-6).toLowerCase()}`
    gadget.name = title.replace(/^AKRacing\s*/i, "").trim().slice(0, 120)
    if (seriesMeta) {
      gadget.tagline = `${seriesMeta.material}・${seriesMeta.maxRecliningAngle}・${seriesMeta.series}`
    }

    const dimWeight = formatDimensionWeight(gadget, detailMap)
    const frameMaterial = gadget.frameMaterial ?? "合金鋼"
    const frameDisplay = formatFrameMaterialForCard(frameMaterial)
    const maxRecliningAngleDisplay = formatMaxRecliningAngleForCard(
      recline !== "—" ? recline : seriesMeta?.maxRecliningAngle ?? "—",
    )
    const isFloorChair =
      seriesMeta?.style === "floor" || seriesKey === "gyokuza" || seriesKey === "gyokuza-denim"
    const floorShape = "座椅子タイプ（ローデスク用/360度回転台座）"

    gadget.highlights = [
      { label: "素材", value: material },
      {
        label: "最大リクライニング角度",
        value: isFloorChair ? "180°（フルフラット対応）" : maxRecliningAngleDisplay,
      },
      isFloorChair
        ? { label: "形状/構造", value: floorShape }
        : { label: "寸法（D x W x H）", value: dimWeight },
      { label: "フレームの種類", value: frameDisplay },
    ]
    if (isFloorChair) gadget.gamingChairFilterTags = ["style-floor"]

    const structGroup = gadget.specGroups.find((g) => g.title === "構造 / 素材")
    if (structGroup) {
      for (const row of [
        ...(isFloorChair
          ? [
              { label: "形状/構造", value: floorShape },
              { label: "形状", value: floorShape },
            ]
          : []),
        { label: "寸法（D x W x H）", value: dimWeight },
        { label: "フレームの種類", value: frameDisplay },
      ]) {
        if (!structGroup.rows.some((r) => r.label === row.label)) structGroup.rows.push(row)
      }
    }

    const rankGroup = gadget.specGroups.find((g) => g.title === "Amazon売れ筋")
    if (rankGroup) {
      rankGroup.title = "Amazon AKRacingストア"
      rankGroup.rows = [{ label: "シリーズ", value: seriesMeta?.series ?? seriesKey ?? "—" }]
    }

    if (gadget.dimensions) gadget.dimensions = sanitizeDimensions(gadget.dimensions)
    for (const group of gadget.specGroups) {
      if (!group.title.includes("サイズ")) continue
      for (const row of group.rows) {
        if (row.label === "本体寸法") row.value = sanitizeDimensions(row.value)
      }
    }

    catalog.push({ ...gadget, series: seriesMeta?.series ?? seriesKey ?? "Other", asin })
    console.log(`OK ${seriesMeta?.series ?? "?"} ¥${price ?? "?"}`)
  } catch (e) {
    console.log("FAIL", e.message)
  }
}

for (const asin of SEED_ASINS) await processAsin(asin)

await browser.close()
writeFileSync(IMAGE_CACHE, JSON.stringify(imageCache, null, 2))

const order = [
  "Premium Denim",
  "Gyokuza Denim",
  "Gyokuza V2",
  "Pro-X V2",
  "Pro-X JP",
  "MJ Grey",
  "Overture",
  "Nitro V2",
  "Wolf",
  "Eclair",
  "Premium",
  "Faura",
  "本田翼 監修",
  "Pro-X V2 ジャイアンツ",
  "東京ヤクルトスワローズ",
  "Pro-X V2 ドラゴンズ",
  "阪神タイガース",
  "Pro-X V2 ライオンズ",
  "サッカー日本代表",
  "FC東京",
  "FC町田ゼルビア",
  "Other",
]
const sorted = catalog.sort(
  (a, b) => order.indexOf(a.series) - order.indexOf(b.series) || a.name.localeCompare(b.name),
)

writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), catalog: sorted }, null, 2))
console.log(`\nCatalog: ${sorted.length} items → ${OUT}`)
for (const g of sorted) console.log(`  ${g.asin} [${g.series}] ¥${g.price ?? "?"}`)

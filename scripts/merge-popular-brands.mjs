/**
 * Parse browser-extracted search JSON and merge into mouse-popular-brands.ts
 * Run after: node scripts/collect-search-from-browser.mjs (or manual popular-brand-search.json)
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { applyAmazonSpecs, applyButtonCountFromText, applyWeightFromText } from "./amazon-mouse-specs.mjs"
import { resolveGadgetImage } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { passesMouseListFilter } from "./mouse-list-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"
/** 一覧対象外（40個セット等・単体マウスではない） */
const EXCLUDED_ASINS = new Set([
  "B07CGPMFCW", // Nakabayashi 45022 Digio2 3-Button Mouse Set of 40
  "B07ZZNJCGC", // FUNKO POP! フィギュア（マウス製品ではない）
])
const SEARCH_PATH = join(__dirname, "popular-brand-search.json")
const OUT_PATH = join(ROOT, "lib", "mouse-popular-brands.ts")
const specCachePath = join(__dirname, "mouse-specs-cache.json")
const imageCachePath = join(__dirname, "mouse-image-cache.json")
const readingOverrides = JSON.parse(
  readFileSync(join(__dirname, "reading-overrides.json"), "utf8"),
)
const powerOverrides = JSON.parse(
  readFileSync(join(__dirname, "power-overrides.json"), "utf8"),
)
const mouseOverrides = JSON.parse(
  readFileSync(join(__dirname, "mouse-overrides.json"), "utf8"),
)
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const imageCache = existsSync(imageCachePath)
  ? JSON.parse(readFileSync(imageCachePath, "utf8"))
  : {}

function resolveImage(asin, image) {
  return resolveGadgetImage(asin, image, imageCache, mouseOverrides)
}

function extractBrand(title) {
  const rules = [
    ["Razer", /razer|レイザー/i],
    ["Logicool G", /logicool\s*g|logitech\s*g/i],
    ["Logicool", /logicool|logitech|ロジクール/i],
    ["ELECOM", /elecom|エレコム/i],
    ["Buffalo", /buffalo|バッファロー/i],
    ["Apple", /magic mouse|apple/i],
    ["HP", /\bhp\b/i],
    ["Microsoft", /microsoft|マイクロソフト|sculpt/i],
    ["BenQ", /benq|zowie/i],
    ["ASUS", /asus|rog/i],
    ["Canon", /canon/i],
    ["Sanwa Direct", /sanwa direct|サンワダイレクト/i],
    ["Sanwa Supply", /sanwa supply|サンワサプライ/i],
    ["Amazon Basics", /amazon basics|amazon basic/i],
    ["UGREEN", /ugreen/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return "—"
}

function isLikelyMouse(title) {
  const hay = title.toLowerCase()
  if (
    !/mouse|マウス|トラックボール|trackball|marble|\bmaus\b/i.test(hay) ||
    /mouse sole|マウスソール|スケート|jiggler|ジグラー|webcam|ウェブカメラ|バンドーレン|mouthpiece|マウスピース|keycap|キーキャップ|keyboard|キーボード|chromebook|bundle|バンドル|calculator|電卓|hyperpolling.*adapter|アダプタ/i.test(
      hay,
    )
  ) {
    return false
  }
  return true
}

function inferConnection(title) {
  if (/magic mouse/i.test(title)) return "Bluetooth"
  const has24 =
    /2\.4\s*ghz|2\.4g\b|lightspeed|logi bolt|logibolt|hyperspeed|レシーバー|radio frequency/i.test(
      title,
    )
  const hasBt = /bluetooth|ブルートゥース/i.test(title)
  const wireless =
    /wireless|ワイヤレス|無線|cordless|kabellose|\bwrls\b|anywhere mouse|mx master|mx anywhere|pebble|viper|deathadder|basilisk|gladius|zowie|inzone|aerox|superlight/i.test(
      title,
    )
  const parts = []
  if (has24) {
    if (/hyperspeed/i.test(title)) parts.push("2.4GHz (HyperSpeed)")
    else if (/lightspeed/i.test(title)) parts.push("2.4GHz (LIGHTSPEED)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (hasBt) parts.push("Bluetooth")
  if (parts.length > 0) return parts.join(" / ")
  if (wireless) return "2.4GHz (USBレシーバー)"
  return "有線 USB"
}

function inferReadingMethod(title) {
  if (/trackball|トラックボール|marble/i.test(title)) return "トラックボール"
  if (/darkfield/i.test(title)) return "Darkfield"
  if (/blueled|blue led|bluel?ed/i.test(title)) return "BlueLED"
  if (/レーザー|laser/i.test(title)) return "レーザー"
  if (/光学|オプティカル|optical|optischer/i.test(title)) return "光学式"
  return DASH
}

function inferMouseUsage(title) {
  if (/gaming|ゲーミング|esports|e-sports|razer|rog|zowie|deathadder|basilisk|gladius/i.test(title))
    return "gaming"
  return "productivity"
}

function inferMouseFilterTags(gadget) {
  const hay = [
    gadget.name,
    gadget.tagline,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()
  const reading = gadget.highlights.find((h) => h.label === "読み取り方式")?.value ?? ""
  const readingHay = `${reading} ${hay}`
  const tags = []
  if (/トラックボール|trackball/i.test(readingHay)) tags.push("reading-trackball")
  else if (/darkfield|レーザー|laser/i.test(readingHay)) tags.push("reading-laser")
  else if (/光学|オプティカル|optical|blueled/i.test(readingHay)) tags.push("reading-optical")
  if (
    /[5-9]\s*ボタン|[5-9]ボタン|[5-9]\s*buttons?|サイドボタン|11\s*ボタン|11\s*buttons?/i.test(
      hay,
    )
  ) {
    tags.push("side-buttons")
  }
  return tags
}

function applyReadingOverride(gadget, asin) {
  const override = readingOverrides[asin]
  if (!override?.reading) return gadget
  const reading = override.reading
  const highlights = gadget.highlights.map((h) =>
    h.label === "読み取り方式" ? { ...h, value: reading } : h,
  )
  const specGroups = gadget.specGroups.map((group) => {
    if (!/センサー|入力/i.test(group.title)) return group
    const hasReading = group.rows.some((r) => r.label === "読み取り方式")
    const rows = hasReading
      ? group.rows.map((r) =>
          r.label === "読み取り方式" ? { ...r, value: reading } : r,
        )
      : [{ label: "読み取り方式", value: reading }, ...group.rows]
    return { ...group, rows }
  })
  return { ...gadget, highlights, specGroups }
}

function applyPowerOverride(gadget, asin) {
  const override = powerOverrides[asin]
  if (!override?.power) return gadget
  const power = override.power
  const specGroups = gadget.specGroups.map((group) => {
    if (!/接続|電源/i.test(group.title)) return group
    const hasPower = group.rows.some((r) => r.label === "電源")
    const rows = hasPower
      ? group.rows.map((r) => (r.label === "電源" ? { ...r, value: power } : r))
      : [{ label: "電源", value: power }, ...group.rows]
    return { ...group, rows }
  })
  return { ...gadget, specGroups }
}

function applyMouseOverride(gadget, asin) {
  const override = mouseOverrides[asin]
  if (!override) return gadget
  let next = { ...gadget }
  if (override.price != null) next = { ...next, price: override.price }
  if (override.connection) next = { ...next, connection: override.connection }
  if (override.power || override.communicationInterface) {
    next = {
      ...next,
      specGroups: next.specGroups.map((group) => {
        if (!/接続|電源/i.test(group.title)) return group
        let rows = group.rows.map((r) => {
          if (r.label === "電源" && override.power) return { ...r, value: override.power }
          if (
            r.label === "通信インターフェース（Amazon記載）" &&
            override.communicationInterface
          ) {
            return { ...r, value: override.communicationInterface }
          }
          return r
        })
        if (override.power && !rows.some((r) => r.label === "電源")) {
          rows = [{ label: "電源", value: override.power }, ...rows]
        }
        return { ...group, rows }
      }),
    }
  }
  return next
}

function buildGadget(entry, index) {
  const { asin, title, rating, reviews, price, image } = entry
  const reading = inferReadingMethod(title)
  const conn = inferConnection(title)
  const tagline = title.length > 140 ? title.slice(0, 137) + "…" : title
  const name = title.length > 72 ? title.slice(0, 69) + "…" : title
  const base = {
    id: `m-pb-${String(index + 1).padStart(3, "0")}`,
    category: "mouse",
    name,
    brand: extractBrand(title),
    tagline,
    price: normalizeImportedPrice(price ?? specCache[asin]?.price, asin, mouseOverrides),
    rating: rating || 4.0,
    reviews: reviews || 0,
    image: resolveImage(asin, image),
    connection: conn,
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
      {
        title: "センサー / 入力",
        rows: [
          { label: "最大 DPI", value: DASH },
          { label: "ポーリングレート", value: DASH },
          { label: "読み取り方式", value: reading !== DASH ? reading : DASH },
        ],
      },
      { title: "接続 / 電源", rows: [{ label: "接続方式", value: conn }] },
    ],
  }
  const built = { ...base, mouseFilterTags: inferMouseFilterTags(base) }
  const cached = specCache[asin]?.specs
  const cachedTitle = specCache[asin]?.title ?? title
  let result = built
  if (cached) result = applyAmazonSpecs(built, cached, conn, cachedTitle)
  result = applyReadingOverride(result, asin)
  result = applyPowerOverride(result, asin)
  result = applyMouseOverride(result, asin)
  result = applyButtonCountFromText(result, title)
  return applyWeightFromText(result, title)
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp 人気ブランド検索（￥3,500〜￥50,600・価格降順）。公式未公表スペックは「—」。 */`,
    `export const mousePopularBrands: Gadget[] = [`,
  ]
  for (const g of gadgets) {
    lines.push("  {")
    for (const [k, v] of Object.entries({
      id: g.id,
      category: g.category,
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
      highlights: g.highlights,
      compat: g.compat,
      specGroups: g.specGroups,
      mouseFilterTags: g.mouseFilterTags,
    })) {
      if (typeof v === "string") lines.push(`    ${k}: ${JSON.stringify(v)},`)
      else lines.push(`    ${k}: ${JSON.stringify(v)},`)
    }
    lines.push("  },")
  }
  lines.push("]", "")
  return lines.join("\n")
}

if (!existsSync(SEARCH_PATH)) {
  console.error(`Missing ${SEARCH_PATH}`)
  process.exit(1)
}

const data = JSON.parse(readFileSync(SEARCH_PATH, "utf8"))
const items = (data.items ?? data).filter((i) => i.title && isLikelyMouse(i.title))
const seen = new Set()
const deduped = items.filter((i) => {
  if (seen.has(i.asin) || EXCLUDED_ASINS.has(i.asin)) return false
  seen.add(i.asin)
  return true
})

const gadgets = deduped.map((item, i) => buildGadget(item, i))
const visible = gadgets.filter(passesMouseListFilter)
const missingPrice = gadgets.filter((g) => g.price == null).length
if (missingPrice) {
  console.warn(`Warning: ${missingPrice} gadgets have no price (¥1000 placeholder disabled)`)
}
writeFileSync(OUT_PATH, toTs(gadgets))
console.log(`Wrote ${gadgets.length} gadgets (${visible.length} visible) → ${OUT_PATH}`)

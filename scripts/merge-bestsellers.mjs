/**
 * Merge existing mouse-bestsellers + gap data into full TOP100 (rank 2–100, skip M185 duplicate).
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
const EXISTING_ASINS = new Set([
  "B0B1Q6VB16",
  "B0CGR5B9FS",
  "B0BL2KH18B",
  "B0956X785M",
])
const EXCLUDED_ASINS = new Set([
  "B0F448WRQ9", // WALLHACK PTFE mouse sole (accessory)
  "B08PQLXSGQ", // Aenllosi 収納ケース（マウス本体ではない）
])

const gapAsins = JSON.parse(
  readFileSync(join(ROOT, "scripts", "bestseller-gap-asins.json"), "utf8"),
)
const gaps = JSON.parse(
  readFileSync(join(ROOT, "scripts", "bestseller-gaps.json"), "utf8"),
)
const gapByRank = Object.fromEntries(gaps.map((g) => [g.rank, g]))
const specCachePath = join(__dirname, "mouse-specs-cache.json")
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const readingOverrides = JSON.parse(
  readFileSync(join(__dirname, "reading-overrides.json"), "utf8"),
)
const powerOverrides = JSON.parse(
  readFileSync(join(__dirname, "power-overrides.json"), "utf8"),
)
const mouseOverrides = JSON.parse(
  readFileSync(join(__dirname, "mouse-overrides.json"), "utf8"),
)
const imageCachePath = join(__dirname, "mouse-image-cache.json")
const imageCache = existsSync(imageCachePath)
  ? JSON.parse(readFileSync(imageCachePath, "utf8"))
  : {}

function resolveImage(asin, image) {
  return resolveGadgetImage(asin, image, imageCache, mouseOverrides)
}

// rank → ASIN from scraped file + static gap ASINs
const rankAsin = {}
const src = readFileSync(join(ROOT, "lib", "mouse-bestsellers.ts"), "utf8")
const re =
  /id: "m-bs-(\d{3})"[\s\S]*?name: ([\s\S]*?),\s*brand:[\s\S]*?tagline: ([\s\S]*?),\s*price: (\d+|null),\s*rating: ([\d.]+),\s*reviews: (\d+),[\s\S]*?image: "([^"]*)",[\s\S]*?connection: "([^"]+)",[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
const existingGadgets = {}
let m
while ((m = re.exec(src)) !== null) {
  const rank = Number(m[1])
  existingGadgets[rank] = {
    rank,
    asin: m[9],
    name: JSON.parse(`"${m[2].replace(/^"|"$/g, "")}"`) || m[2].replace(/^"|"$/g, ""),
    tagline: m[3].replace(/^"|"$/g, "").replace(/\\"/g, '"'),
    price: m[4] === "null" ? null : Number(m[4]),
    rating: Number(m[5]),
    reviews: Number(m[6]),
    image: m[7],
    connection: m[8].replace(/\\"/g, '"'),
  }
  rankAsin[rank] = m[9]
}
for (const [rank, asin] of Object.entries(gapAsins)) {
  rankAsin[Number(rank)] = asin
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
    ["Technet", /technet|tecknet|テックネット/i],
    ["GREENHOUSE", /greenhouse|グリーンハウス/i],
    ["VAYDEER", /vaydeer/i],
    ["WALLHACK", /wallhack/i],
    ["Aenllosi", /aenllosi/i],
    ["Ewin", /ewin/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return "—"
}

function inferConnection(title) {
  if (
    /mouse sole|マウスソール|スケート|protective storage|storage case|専用.*ケース|ケースのみ|ケース \(/i.test(
      title,
    )
  )
    return DASH
  if (/magic mouse/i.test(title)) return "Bluetooth"
  const has24 =
    /2\.4\s*ghz|2\.4g\b|lightspeed|logi bolt|logibolt|レシーバー付|usbドングル|usbレシーバー/i.test(
      title,
    ) && !/レシーバーのみ|receiver only/i.test(title)
  const hasBt = /bluetooth|ブルートゥース/i.test(title)
  const wireless = /wireless|ワイヤレス|無線|cordless/i.test(title)
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
  if (/darkfield/i.test(title)) return "Darkfield"
  if (/blueled|blue led|bluel?ed/i.test(title)) return "BlueLED"
  if (/レーザー|laser/i.test(title)) return "レーザー"
  if (/光学|オプティカル|optical/i.test(title)) return "光学式"
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

function normalizeRating(rating) {
  if (rating > 0 && rating < 2) return Math.round(rating * 100) / 10
  return rating
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

  const reading =
    gadget.highlights.find((h) => h.label === "読み取り方式")?.value ?? ""
  const readingHay = `${reading} ${hay}`
  const tags = []

  if (/トラックボール|trackball/i.test(readingHay)) tags.push("reading-trackball")
  else if (/darkfield|レーザー|laser/i.test(readingHay)) tags.push("reading-laser")
  else if (/光学|オプティカル|optical|blueled|blue led|bluel?ed/i.test(readingHay)) {
    tags.push("reading-optical")
  }

  if (
    /[5-9]\s*ボタン|[5-9]ボタン|[5-9]\s*buttons?|サイドボタン|back\/forward|back.*forward|戻る.*進む|進む.*戻る|thumb\s*buttons?|サイド.*ボタン/i.test(
      hay,
    ) &&
    !/3\s*ボタン|3\s*buttons?|3-button/i.test(hay)
  ) {
    tags.push("side-buttons")
  }

  if (
    /サイドホイール|thumb\s*wheel|横スクロール|horizontal\s*scroll|チルト.*ホイール|tilt\s*wheel|サムホイール/i.test(
      hay,
    )
  ) {
    tags.push("side-wheel")
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

  const tags = new Set(gadget.mouseFilterTags ?? [])
  if (/darkfield|レーザー|laser/i.test(reading)) tags.add("reading-laser")
  else if (/トラックボール|trackball/i.test(reading)) tags.add("reading-trackball")
  else if (/光学|オプティカル|optical|blueled|ir\s*led|ultimate\s*ir/i.test(reading)) tags.add("reading-optical")

  return { ...gadget, highlights, specGroups, mouseFilterTags: [...tags] }
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
  if (override.mouseFilterTags) {
    next = { ...next, mouseFilterTags: override.mouseFilterTags }
  }

  if (override.power || override.communicationInterface) {
    next = {
      ...next,
      specGroups: next.specGroups.map((group) => {
        if (!/接続|電源/i.test(group.title)) return group
        const rows = group.rows.map((r) => {
          if (r.label === "電源" && override.power) return { ...r, value: override.power }
          if (
            r.label === "通信インターフェース（Amazon記載）" &&
            override.communicationInterface
          ) {
            return { ...r, value: override.communicationInterface }
          }
          return r
        })
        return { ...group, rows }
      }),
    }
  }

  return next
}

function buildGadget(entry) {
  const { rank, asin, rating, reviews, price, image, connection } = entry
  const title = entry.title ?? entry.name ?? entry.tagline ?? ""
  const reading = inferReadingMethod(title)
  const conn = connection ?? inferConnection(title)
  const tagline = title.length > 140 ? title.slice(0, 137) + "…" : title
  const name = title.length > 72 ? title.slice(0, 69) + "…" : title
  const base = {
    id: `m-bs-${String(rank).padStart(3, "0")}`,
    category: "mouse",
    name,
    brand: extractBrand(title),
    tagline,
    price: normalizeImportedPrice(price ?? specCache[asin]?.price, asin, mouseOverrides),
    rating: normalizeRating(rating),
    reviews,
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
  const built = {
    ...base,
    mouseFilterTags: inferMouseFilterTags(base),
  }
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
    if (g.mouseFilterTags?.length) {
      lines.push(`    mouseFilterTags: ${JSON.stringify(g.mouseFilterTags)},`)
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

const entries = []
const missing = []
for (let rank = 2; rank <= 100; rank++) {
  const asin = rankAsin[rank]
  if (!asin) {
    missing.push(rank)
    continue
  }
  if (EXISTING_ASINS.has(asin) || EXCLUDED_ASINS.has(asin)) continue

  if (existingGadgets[rank]) {
    const e = existingGadgets[rank]
    entries.push({
      ...e,
      title: e.name ?? e.tagline,
      price: normalizeImportedPrice(e.price, asin, mouseOverrides),
      rating: normalizeRating(
        e.rating < 1 ? gapByRank[rank]?.rating ?? e.rating : e.rating,
      ),
    })
  } else if (gapByRank[rank]) {
    const g = gapByRank[rank]
    entries.push({
      rank,
      asin,
      title: g.title,
      rating: g.rating,
      reviews: g.reviews,
      price: normalizeImportedPrice(g.price, asin, mouseOverrides),
      image: "",
    })
  } else if (specCache[asin]?.title) {
    const cached = specCache[asin]
    entries.push({
      rank,
      asin,
      title: cached.title,
      rating: 4,
      reviews: 0,
      price: normalizeImportedPrice(cached.price, asin, mouseOverrides),
      image: "",
    })
  } else {
    missing.push(rank)
  }
}

if (missing.length) {
  console.error("Missing ranks:", [...new Set(missing)].join(", "))
  process.exit(1)
}

entries.sort((a, b) => a.rank - b.rank)
const allBuilt = entries.map(buildGadget)
const built = allBuilt.filter(passesMouseListFilter)
const missingPrice = allBuilt.filter((g) => g.price == null).length
if (missingPrice) {
  console.warn(`Warning: ${missingPrice} gadgets have no price (¥1000 placeholder disabled)`)
}
writeFileSync(
  join(ROOT, "lib", "mouse-bestsellers.ts"),
  toTs(built),
)
console.log(
  `Wrote ${built.length} items (filtered ${entries.length - built.length} with <=1 card specs)`,
)

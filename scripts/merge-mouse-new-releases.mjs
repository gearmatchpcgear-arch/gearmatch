/**
 * mouse-new-releases-raw.json + spec cache → lib/mouse-new-releases.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { applyAmazonSpecs, applyButtonCountFromText, applyWeightFromText } from "./amazon-mouse-specs.mjs"
import { resolveGadgetImage } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { passesMouseListFilter } from "./mouse-list-filter.mjs"
import { isMouseAccessory } from "./mouse-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DASH = "—"

const specCachePath = join(__dirname, "mouse-specs-cache.json")
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const readingOverrides = existsSync(join(__dirname, "reading-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "reading-overrides.json"), "utf8"))
  : {}
const powerOverrides = existsSync(join(__dirname, "power-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "power-overrides.json"), "utf8"))
  : {}
const mouseOverrides = existsSync(join(__dirname, "mouse-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "mouse-overrides.json"), "utf8"))
  : {}
const newReleaseOverrides = existsSync(join(__dirname, "mouse-new-releases-spec-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "mouse-new-releases-spec-overrides.json"), "utf8"))
  : {}
const imageCachePath = join(__dirname, "mouse-image-cache.json")
const imageCache = existsSync(imageCachePath)
  ? JSON.parse(readFileSync(imageCachePath, "utf8"))
  : {}

function resolveImage(asin, image) {
  return resolveGadgetImage(asin, image, imageCache, mouseOverrides)
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
    ["ProtoArc", /protoarc/i],
    ["ESR", /\besr\b/i],
    ["Technet", /technet|tecknet|テックネット/i],
    ["GREENHOUSE", /greenhouse|グリーンハウス/i],
    ["VAYDEER", /vaydeer/i],
    ["AIM1", /\baim1\b/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return "—"
}

function inferConnection(title) {
  if (/magic mouse/i.test(title)) return "Bluetooth"
  const has24 =
    /2\.4\s*ghz|2\.4g\b|lightspeed|logi bolt|logibolt|レシーバー付|usbドングル|usbレシーバー|無線2\.4/i.test(
      title,
    ) && !/レシーバーのみ|receiver only/i.test(title)
  const hasBt = /bluetooth|ブルートゥース/i.test(title)
  const wireless = /wireless|ワイヤレス|無線|cordless/i.test(title)
  const wired =
    (/有線|wired/i.test(title) && !wireless && !hasBt && !has24) ||
    (/usb接続/i.test(title) && !wireless && !hasBt && !has24)

  const parts = []
  if (has24) {
    if (/logi bolt|logibolt|signature comfort/i.test(title)) parts.push("2.4GHz (Logi Bolt)")
    else if (/lightspeed/i.test(title)) parts.push("2.4GHz (LIGHTSPEED)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (hasBt) {
    const ver = title.match(/bluetooth\s*([\d.]+)/i)?.[1]
    parts.push(ver ? `Bluetooth ${ver}` : "Bluetooth")
  }
  if (parts.length > 0) return parts.join(" / ")
  if (wireless) return "2.4GHz (USBレシーバー)"
  if (wired) return "有線 USB"
  return DASH
}

function inferReadingMethod(title) {
  if (/trackball|トラックボール/i.test(title)) return "トラックボール"
  if (/darkfield/i.test(title)) return "Darkfield"
  if (/blueled|blue led|bluel?ed/i.test(title)) return "BlueLED"
  if (/ir\s*led|irled/i.test(title)) return "IR LED"
  if (/レーザー|laser/i.test(title)) return "レーザー式"
  if (/光学|オプティカル|optical/i.test(title)) return "光学式"
  return DASH
}

function inferMouseUsage(title) {
  if (
    /gaming|ゲーミング|polling rate|8,000\s*hz|8000\s*hz|26000\s*dpi|paw3395|superlight|viper|deathadder|\baim1\b/i.test(
      title,
    )
  )
    return "gaming"
  return "productivity"
}

function inferMouseFilterTags(gadget) {
  const hay = [
    gadget.name,
    gadget.tagline,
    gadget.connection,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()

  const reading =
    gadget.highlights.find((h) => h.label === "読み取り方式")?.value ?? ""
  const tags = []
  if (/光学|オプティカル|optical|blueled|hero|ir led/i.test(`${reading} ${hay}`)) {
    tags.push("reading-optical")
  }
  if (/レーザー|laser/i.test(`${reading} ${hay}`)) tags.push("reading-laser")
  if (/トラックボール|trackball/i.test(`${reading} ${hay}`)) tags.push("reading-trackball")
  if (/darkfield/i.test(`${reading} ${hay}`)) tags.push("reading-laser")
  if (
    /[5-9]\s*ボタン|[5-9]ボタン|[5-9]\s*buttons?|サイドボタン|side button|thumb button/i.test(hay)
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

function applyNewReleaseOverride(gadget, asin) {
  const o = newReleaseOverrides[asin]
  if (!o) return gadget
  let next = { ...gadget }
  if (o.name) next.name = o.name
  if (o.brand) next.brand = o.brand
  if (o.connection) next.connection = o.connection
  if (o.price != null) next.price = o.price
  if (o.reading) {
    next = applyReadingOverride(
      {
        ...next,
        highlights: next.highlights.map((h) =>
          h.label === "読み取り方式" ? { ...h, value: o.reading } : h,
        ),
      },
      asin,
    )
  }
  if (o.power) {
    next = {
      ...next,
      specGroups: next.specGroups.map((group) => {
        if (!/接続|電源/i.test(group.title)) return group
        const hasPower = group.rows.some((r) => r.label === "電源")
        const rows = hasPower
          ? group.rows.map((r) => (r.label === "電源" ? { ...r, value: o.power } : r))
          : [...group.rows, { label: "電源", value: o.power }]
        return { ...group, rows }
      }),
    }
  }
  if (o.buttonCount) {
    next = {
      ...next,
      specGroups: next.specGroups.map((group) => {
        if (!/センサー|入力/i.test(group.title)) return group
        const hasBtn = group.rows.some((r) => r.label === "ボタン数")
        const rows = hasBtn
          ? group.rows.map((r) =>
              r.label === "ボタン数" ? { ...r, value: o.buttonCount } : r,
            )
          : [...group.rows, { label: "ボタン数", value: o.buttonCount }]
        return { ...group, rows }
      }),
    }
  }
  if (o.weight) {
    next = {
      ...next,
      highlights: next.highlights.map((h) =>
        h.label === "重量" ? { ...h, value: o.weight } : h,
      ),
      specGroups: next.specGroups.map((group) => {
        if (!/サイズ|重量/i.test(group.title)) return group
        const hasW = group.rows.some((r) => r.label === "重量")
        const rows = hasW
          ? group.rows.map((r) => (r.label === "重量" ? { ...r, value: o.weight } : r))
          : [{ label: "重量", value: o.weight }, ...group.rows]
        return { ...group, rows }
      }),
    }
  }
  return next
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

function inferPowerFromTitle(title, connection) {
  if (/type-c充電|usb-c充電|type-c 充電|usb type-c.*充電/i.test(title)) return "充電式 (USB-C)"
  if (/単3形|単4形|aa battery|乾電池/i.test(title)) return "単3形 乾電池（付属）"
  if (/充電式|rechargeable|内蔵バッテリー/i.test(title)) return "充電式（内蔵バッテリー）"
  if (
    (/有線|wired|usb接続/i.test(title) && !/wireless|ワイヤレス|無線/i.test(title)) ||
    connection === "有線 USB"
  ) {
    return "有線給電"
  }
  if (/wireless|ワイヤレス|bluetooth|2\.4/i.test(title)) {
    return "充電式（内蔵バッテリー）"
  }
  return null
}

function applyPowerFromTitle(gadget, title) {
  const powerGroup = gadget.specGroups.find((g) => /接続|電源/i.test(g.title))
  const hasPower = powerGroup?.rows.some((r) => r.label === "電源" && r.value !== DASH)
  if (hasPower) return gadget
  const power = inferPowerFromTitle(title, gadget.connection)
  if (!power) return gadget
  const specGroups = gadget.specGroups.map((group) => {
    if (!/接続|電源/i.test(group.title)) return group
    const rows = group.rows.some((r) => r.label === "電源")
      ? group.rows.map((r) => (r.label === "電源" ? { ...r, value: power } : r))
      : [...group.rows, { label: "電源", value: power }]
    return { ...group, rows }
  })
  return { ...gadget, specGroups }
}

function inferName(title, brand) {
  const models = [
    /M650L|M650\b|M750MGR|M750\b|Slint\b|OSMOD8\b|Signature Comfort Plus/i,
    /\b[A-Z]{2,}\d{2,}[A-Z]{0,4}\b/,
  ]
  for (const re of models) {
    const m = title.match(re)
    if (m) return m[0].replace(/Signature Comfort Plus/i, "M650L").trim()
  }
  const stripped = title.replace(new RegExp(`^${brand}\\s*`, "i"), "").split(/[|｜]/)[0].trim()
  return stripped.length > 72 ? stripped.slice(0, 69) + "…" : stripped || title.slice(0, 72)
}

function buildGadget(entry) {
  const { rank, asin, rating, reviews, price, image } = entry
  const title = entry.title ?? entry.name ?? ""
  const brand = extractBrand(title)
  const reading = inferReadingMethod(title)
  const conn = inferConnection(title)
  const tagline = title.length > 140 ? title.slice(0, 137) + "…" : title
  const name = inferName(title, brand)
  const usage = inferMouseUsage(title)

  const base = {
    id: `m-nr-${String(rank).padStart(3, "0")}`,
    category: "mouse",
    name,
    brand,
    tagline,
    price: normalizeImportedPrice(price ?? specCache[asin]?.price, asin, mouseOverrides),
    rating,
    reviews,
    image: resolveImage(asin, image),
    connection: conn,
    purchaseUrl: `https://www.amazon.co.jp/dp/${asin}`,
    mouseUsage: usage,
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
          { label: "読み取り方式", value: reading !== DASH ? reading : DASH },
        ],
      },
      { title: "接続 / 電源", rows: [{ label: "接続方式", value: conn }] },
    ],
  }

  let result = { ...base, mouseFilterTags: inferMouseFilterTags(base) }
  const cached = specCache[asin]?.specs
  const cachedTitle = specCache[asin]?.title ?? title
  if (cached) result = applyAmazonSpecs(result, cached, conn, cachedTitle)
  result = applyReadingOverride(result, asin)
  result = applyPowerOverride(result, asin)
  result = applyMouseOverride(result, asin)
  result = applyNewReleaseOverride(result, asin)
  result = applyPowerFromTitle(result, title)
  result = applyButtonCountFromText(result, title)
  result = applyWeightFromText(result, title)
  result = { ...result, mouseFilterTags: inferMouseFilterTags(result) }
  return result
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp マウス新着ランキング pg1（2151978051）。マウス本体のみ。 */`,
    `export const mouseNewReleases: Gadget[] = [`,
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

const rawPath = join(__dirname, "mouse-new-releases-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-mouse-new-releases.mjs first")
  process.exit(1)
}

const { mice } = JSON.parse(readFileSync(rawPath, "utf8"))
const entries = mice.filter(
  (item) => !isMouseAccessory(item.title ?? "") && (item.price == null || item.price >= 100),
)
const allBuilt = entries.map(buildGadget)
const built = allBuilt.filter(passesMouseListFilter)
const skippedFilter = entries.length - built.length

writeFileSync(join(ROOT, "lib", "mouse-new-releases.ts"), toTs(built))
console.log(`Wrote ${built.length} new-release mice (filter skip: ${skippedFilter})`)

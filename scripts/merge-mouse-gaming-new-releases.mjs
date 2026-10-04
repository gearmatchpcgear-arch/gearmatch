/**
 * mouse-gaming-new-releases-raw.json + spec cache → lib/mouse-gaming-new-releases.ts
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

/** gadgets.ts 手動登録済み ASIN（未使用・後方互換） */
function collectCuratedAsins() {
  return new Set()
}

const CURATED_ASINS = collectCuratedAsins()

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
const gamingSpecOverrides = {
  ...(existsSync(join(__dirname, "gaming-spec-overrides.json"))
    ? JSON.parse(readFileSync(join(__dirname, "gaming-spec-overrides.json"), "utf8"))
    : {}),
  ...(existsSync(join(__dirname, "mouse-gaming-new-releases-spec-overrides.json"))
    ? JSON.parse(
        readFileSync(join(__dirname, "mouse-gaming-new-releases-spec-overrides.json"), "utf8"),
      )
    : {}),
}
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
    ["Razer", /razer|レイザー/i],
    ["CORSAIR", /corsair/i],
    ["SteelSeries", /steelseries/i],
    ["Redragon", /redragon/i],
    ["Philips", /philips|フィリップス|evnia/i],
    ["SCYROX", /scyrox/i],
    ["Pulsar", /pulsar/i],
    ["ATK", /\batk\b/i],
    ["ATTACK SHARK", /attack shark/i],
    ["MSI", /\bmsi\b/i],
    ["ELECOM", /elecom|エレコム/i],
    ["Keychron", /keychron/i],
    ["MCHOSE", /mchose/i],
    ["GravaStar", /gravastar|mercury x/i],
    ["Ajazz", /ajazz|a\.jazz/i],
    ["LAMZU", /lamzu/i],
    ["DAREU", /dareu/i],
    ["Finalmouse", /finalmouse/i],
    ["PWNAGE", /pwnage/i],
    ["CRDRAKO", /crdrako/i],
    ["VARO", /\bvaro\b/i],
    ["TMKB", /\btmkb\b/i],
    ["iClever", /iclever/i],
    ["Century", /century|racen/i],
    ["BenQ", /benq|zowie/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return "—"
}

function inferConnection(title) {
  if (/magic mouse/i.test(title)) return "Bluetooth"
  const has24 =
    /2\.4\s*ghz|2\.4g\b|lightspeed|hyper\s*speed|hyperspeed|usbドングル|usbレシーバー|8000hz\s*dongle/i.test(
      title,
    ) && !/レシーバーのみ|receiver only/i.test(title)
  const hasBt = /bluetooth|ブルートゥース/i.test(title)
  const wireless = /wireless|ワイヤレス|無線|cordless/i.test(title)
  const wired =
    (/有線|wired/i.test(title) && !wireless && !hasBt && !has24) ||
    (/usb接続|usb connection/i.test(title) && !wireless && !hasBt && !has24)

  const parts = []
  if (has24) {
    if (/lightspeed/i.test(title)) parts.push("2.4GHz (LIGHTSPEED)")
    else if (/hyperspeed|hyper\s*speed/i.test(title)) parts.push("2.4GHz (HyperSpeed)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (hasBt) parts.push("Bluetooth")
  if (/usb-c|type-c|usb type-c/i.test(title) && (wireless || wired)) {
    if (!parts.some((p) => /usb/i.test(p))) parts.push("USB-C")
  }
  if (parts.length > 0) return parts.join(" / ")
  if (wireless) return "2.4GHz (USBレシーバー)"
  return "有線 USB"
}

function inferReadingMethod(title) {
  if (/hero\s*25k|hero25k/i.test(title)) return "光学式（HERO 25K）"
  if (/hero\s*2\b|hero2/i.test(title)) return "光学式（HERO 2）"
  if (/hero\s*12k|hero12k/i.test(title)) return "光学式（HERO 12K）"
  if (/hero\s*44k|hero44k|44k dpi/i.test(title)) return "光学式（HERO 2）"
  if (/focus pro|paw3395|paw3950|paw3955|paw3311|pixart/i.test(title)) return "光学式"
  if (/光学|オプティカル|optical/i.test(title)) return "光学式"
  return DASH
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

  if (/光学|オプティカル|optical|hero/i.test(readingHay)) tags.push("reading-optical")
  if (
    /[5-9]\s*ボタン|[5-9]ボタン|[5-9]\s*buttons?|program.*button|サイドボタン|side button|thumb button/i.test(
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
  const tags = new Set(gadget.mouseFilterTags ?? [])
  if (/光学/i.test(reading)) tags.add("reading-optical")
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

function applyGamingSpecOverride(gadget, asin) {
  const override = gamingSpecOverrides[asin]
  if (!override) return gadget

  let next = { ...gadget }
  if (override.reading) {
    next = applyReadingOverride(
      { ...next, highlights: next.highlights.map((h) =>
        h.label === "読み取り方式" ? { ...h, value: override.reading } : h,
      ) },
      asin,
    )
    next = {
      ...next,
      highlights: next.highlights.map((h) =>
        h.label === "読み取り方式" ? { ...h, value: override.reading } : h,
      ),
      specGroups: next.specGroups.map((group) => {
        if (!/センサー|入力/i.test(group.title)) return group
        const hasReading = group.rows.some((r) => r.label === "読み取り方式")
        const rows = hasReading
          ? group.rows.map((r) =>
              r.label === "読み取り方式" ? { ...r, value: override.reading } : r,
            )
          : [{ label: "読み取り方式", value: override.reading }, ...group.rows]
        return { ...group, rows }
      }),
    }
  }
  if (override.power) {
    next = applyPowerOverride({ ...next, specGroups: next.specGroups.map((group) => {
      if (!/接続|電源/i.test(group.title)) return group
      const hasPower = group.rows.some((r) => r.label === "電源")
      const rows = hasPower
        ? group.rows.map((r) => (r.label === "電源" ? { ...r, value: override.power } : r))
        : [...group.rows, { label: "電源", value: override.power }]
      return { ...group, rows }
    }) }, asin)
  }
  if (override.buttonCount) {
    next = {
      ...next,
      specGroups: next.specGroups.map((group) => {
        if (!/センサー|入力/i.test(group.title)) return group
        const hasBtn = group.rows.some((r) => r.label === "ボタン数")
        const rows = hasBtn
          ? group.rows.map((r) =>
              r.label === "ボタン数" ? { ...r, value: override.buttonCount } : r,
            )
          : [...group.rows, { label: "ボタン数", value: override.buttonCount }]
        return { ...group, rows }
      }),
    }
  }
  if (override.connection) next = { ...next, connection: override.connection }
  if (override.name) next = { ...next, name: override.name }
  if (override.brand) next = { ...next, brand: override.brand }
  if (override.weight) {
    next = {
      ...next,
      highlights: next.highlights.map((h) =>
        h.label === "重量" ? { ...h, value: override.weight } : h,
      ),
      specGroups: next.specGroups.map((group) => {
        if (!/サイズ|重量/i.test(group.title)) return group
        const hasW = group.rows.some((r) => r.label === "重量")
        const rows = hasW
          ? group.rows.map((r) => (r.label === "重量" ? { ...r, value: override.weight } : r))
          : [{ label: "重量", value: override.weight }, ...group.rows]
        return { ...group, rows }
      }),
    }
  }
  return next
}

function inferPowerFromTitle(title, connection) {
  if (/単3形|単4形|aa battery|乾電池/i.test(title)) return "単3形乾電池x1"
  if (/充電式|rechargeable|内蔵バッテリー|powerplay/i.test(title)) {
    return "充電式（内蔵バッテリー）"
  }
  if (
    (/有線|wired|usb接続/i.test(title) && !/wireless|ワイヤレス|無線/i.test(title)) ||
    connection === "有線 USB"
  ) {
    return "有線給電"
  }
  if (/wireless|ワイヤレス|lightspeed|hyperspeed/i.test(title)) {
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

function inferName(title, brand) {
  const patterns = [
    /G-PPD-[A-Z0-9]+(?:WL|CR)?(?:-[A-Z]+)?/i,
    /G502X?WL?[-A-Z]*/i,
    /G502RGBh?r?/i,
    /G502X[-A-Z]*/i,
    /G203[-A-Z]*/i,
    /Viper V[34] (?:Pro )?(?:SE |White )?(?:Edition )?/i,
    /Naga V2 HyperSpeed/i,
    /CrazyLight/i,
    /BTM\d+[A-Z]*/i,
    /X2 CrazyLight/i,
    /SUPERLIGHT 2(?: SE)?/i,
    /PRO X2 SUPERSTRIKE/i,
    /PRO 2 LIGHTSPEED/i,
    /G502 X PLUS/i,
    /G502 X LIGHTSPEED/i,
    /G502WL/i,
    /\b[A-Z]{2,}\d{2,}[A-Z0-9-]{0,8}\b/,
  ]
  for (const re of patterns) {
    const m = title.match(re)
    if (m) return m[0].trim()
  }
  const stripped = title
    .replace(new RegExp(`^${brand}\\s*`, "i"), "")
    .replace(/^【[^】]+】\s*/, "")
    .split(/[|｜]/)[0]
    .trim()
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
  const base = {
    id: `m-gnr-${String(rank).padStart(3, "0")}`,
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
    mouseUsage: "gaming",
    highlights: [
      { label: "重量", value: DASH },
      { label: "最大DPI", value: DASH },
      { label: "読み取り方式", value: reading },
      { label: "ポーリングレート", value: DASH },
    ],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: DASH }],
      },
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
  result = applyGamingSpecOverride(result, asin)
  result = applyPowerFromTitle(result, title)
  result = applyButtonCountFromText(result, title)
  result = applyWeightFromText(result, title)
  return { ...result, mouseFilterTags: inferMouseFilterTags(result) }
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp ゲーミングマウス新着ランキング（2151973051）。マウス本体のみ。 */`,
    `export const mouseGamingNewReleases: Gadget[] = [`,
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

const rawPath = join(__dirname, "mouse-gaming-new-releases-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-mouse-gaming-new-releases.mjs first")
  process.exit(1)
}

const { mice } = JSON.parse(readFileSync(rawPath, "utf8"))
const entries = mice.filter(
  (item) => !isMouseAccessory(item.title ?? "") && (item.price == null || item.price >= 100),
)

const allBuilt = entries.map(buildGadget)
const built = allBuilt.filter(passesMouseListFilter)
const skippedFilter = entries.length - built.length

writeFileSync(
  join(ROOT, "lib", "mouse-gaming-new-releases.ts"),
  toTs(built),
)
console.log(`Wrote ${built.length} gaming new-release mice (filter skip: ${skippedFilter})`)

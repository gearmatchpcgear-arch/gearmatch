/**
 * keyboard-bestsellers-raw.json + spec cache → lib/keyboard-bestsellers.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { resolveGadgetImage } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { isKeyboardAccessoryTitle, isKeyboardMouseComboTitle } from "./keyboard-accessory.mjs"
import {
  applyAmazonKeyboardSpecs,
  inferLayoutFromText,
  inferStructureFromText,
  inferKeycapsFromText,
  inferPowerFromText,
  inferKeyboardFilterTags,
  inferConnectionFromTitle,
  inferKeyboardUsage,
  inferRapidTrigger,
  shortProductName,
  extractBrand,
  extractModelKey,
  DASH,
} from "./amazon-keyboard-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

/** gadgets.ts 手動登録済み ASIN（重複防止） */
function collectCuratedAsins() {
  const asins = new Set()
  const gadgetsSrc = readFileSync(join(ROOT, "lib", "gadgets.ts"), "utf8")
  const keyboardIdx = gadgetsSrc.indexOf('category: "keyboard"')
  if (keyboardIdx >= 0) {
    const slice = gadgetsSrc.slice(keyboardIdx)
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(slice)) !== null) asins.add(m[1])
  }
  return asins
}

const CURATED_ASINS = collectCuratedAsins()

const specCachePath = join(__dirname, "keyboard-specs-cache.json")
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const keyboardOverrides = JSON.parse(
  readFileSync(join(__dirname, "keyboard-spec-overrides.json"), "utf8"),
)
const imageCachePath = join(__dirname, "keyboard-image-cache.json")
const imageCache = existsSync(imageCachePath)
  ? JSON.parse(readFileSync(imageCachePath, "utf8"))
  : {}

function resolveImage(asin, image) {
  return resolveGadgetImage(asin, image, imageCache, keyboardOverrides)
}

function applyOverride(gadget, asin, title) {
  const override = keyboardOverrides[asin]
  if (!override) return gadget

  let next = { ...gadget }
  if (override.name) next = { ...next, name: override.name }
  if (override.tagline) next = { ...next, tagline: override.tagline }
  if (override.connection) next = { ...next, connection: override.connection }
  if (override.price != null) next = { ...next, price: override.price }
  if (override.keyboardFilterTags) {
    next = { ...next, keyboardFilterTags: override.keyboardFilterTags }
  }
  if (override.keyboardUsage) {
    next = { ...next, keyboardUsage: override.keyboardUsage }
  }

  const patchFields = [
    ["レイアウト", override.layout, "キー / スイッチ", "レイアウト"],
    ["内部構造", override.internalStructure, "キー / スイッチ", "内部構造"],
    ["キーキャップ", override.keycaps, "キー / スイッチ", "キーキャップ"],
    ["電源", override.power, "接続 / 電源", "電源"],
  ]
  for (const [hLabel, value, gTitle, rLabel] of patchFields) {
    if (!value || value === DASH) continue
    next = {
      ...next,
      highlights: next.highlights.some((h) => h.label === hLabel)
        ? next.highlights.map((h) => (h.label === hLabel ? { ...h, value } : h))
        : [...next.highlights, { label: hLabel, value }],
      specGroups: next.specGroups.map((g) => {
        if (g.title !== gTitle) return g
        const has = g.rows.some((r) => r.label === rLabel)
        return {
          ...g,
          rows: has
            ? g.rows.map((r) => (r.label === rLabel ? { ...r, value } : r))
            : [...g.rows, { label: rLabel, value }],
        }
      }),
    }
  }
  if (override.connection) {
    next = {
      ...next,
      specGroups: next.specGroups.map((g) => {
        if (g.title !== "接続 / 電源") return g
        const has = g.rows.some((r) => r.label === "接続方式")
        return {
          ...g,
          rows: has
            ? g.rows.map((r) =>
                r.label === "接続方式" ? { ...r, value: override.connection } : r,
              )
            : [{ label: "接続方式", value: override.connection }, ...g.rows],
        }
      }),
    }
  }
  return next
}

function buildTagline(title, cached) {
  const bullets = cached?.specs?.bullets ?? ""
  if (bullets.length > 40) {
    const first = bullets.split(/[。．!！]/)[0].trim()
    if (isValidTagline(first)) return first
  }
  const cleaned = title
    .replace(/^【[^】]+】\s*/g, "")
    .replace(/\s*\|\s*.+$/, "")
    .replace(/\s*国内正規品.*$/i, "")
    .trim()
  return isValidTagline(cleaned)
    ? cleaned.length > 140
      ? cleaned.slice(0, 137) + "…"
      : cleaned
    : cleaned.slice(0, 140)
}

function isValidTagline(text) {
  if (!text || text.length < 12) return false
  if (/›|画像はありません|選択したカラー|パソコン・周辺機器/i.test(text)) return false
  return true
}

function buildGadget(entry) {
  const { rank, asin, rating, reviews, price, image } = entry
  const title = entry.title ?? entry.name ?? ""
  const cached = specCache[asin]
  const conn = inferConnectionFromTitle(title)
  const hay = `${title} ${cached?.specs?.bullets ?? ""}`

  const layout = inferLayoutFromText(hay) ?? DASH
  const structure = inferStructureFromText(hay, cached?.specs?.switchType, title) ?? DASH
  const keycaps = inferKeycapsFromText(hay) ?? DASH
  const power = inferPowerFromText(hay, conn) ?? DASH

  const base = {
    id: `k-bs-${String(rank).padStart(3, "0")}`,
    category: "keyboard",
    name: shortProductName(title),
    brand: extractBrand(title),
    tagline: buildTagline(title, cached),
    price: normalizeImportedPrice(price ?? cached?.price, asin, keyboardOverrides),
    rating,
    reviews,
    image: resolveImage(asin, image),
    connection: conn,
    purchaseUrl: `https://www.amazon.co.jp/dp/${asin}`,
    highlights: [
      { label: "レイアウト", value: layout },
      { label: "内部構造", value: structure },
      { label: "キーキャップ", value: keycaps },
      { label: "電源", value: power },
    ],
    compat: [],
    specGroups: [
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: layout },
          { label: "内部構造", value: structure },
          { label: "キーキャップ", value: keycaps },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: conn },
          { label: "電源", value: power },
        ],
      },
    ],
  }

  let result = base
  if (cached?.specs) {
    result = applyAmazonKeyboardSpecs(base, cached.specs, cached.title ?? title)
  }
  result = applyOverride(result, asin, title)
  result = applySizeWeightFromCache(result, cached)
  result = {
    ...result,
    keyboardFilterTags: inferKeyboardFilterTags(result),
    keyboardUsage: inferKeyboardUsage(result),
    ...(inferRapidTrigger(result) ? { hasRapidTrigger: true } : {}),
  }
  return result
}

function patchSpecRow(gadget, groupTitle, rowLabel, value) {
  if (!value || value === DASH) return gadget
  const groups = gadget.specGroups.map((g) => {
    if (g.title !== groupTitle) return g
    const has = g.rows.some((r) => r.label === rowLabel)
    return {
      ...g,
      rows: has
        ? g.rows.map((r) => (r.label === rowLabel ? { ...r, value } : r))
        : [...g.rows, { label: rowLabel, value }],
    }
  })
  const hasGroup = groups.some((g) => g.title === groupTitle)
  return {
    ...gadget,
    specGroups: hasGroup
      ? groups
      : [...groups, { title: groupTitle, rows: [{ label: rowLabel, value }] }],
  }
}

function applySizeWeightFromCache(gadget, cached) {
  let next = gadget
  const specs = cached?.specs
  if (!specs) return next
  if (specs.dimensions) next = patchSpecRow(next, "サイズ / 重量", "寸法", specs.dimensions)
  if (specs.weight) next = patchSpecRow(next, "サイズ / 重量", "重量", specs.weight)
  return next
}

function dedupeByModel(entries) {
  const seen = new Set()
  const out = []
  for (const entry of entries) {
    const model = extractModelKey(entry.title ?? "")
    const key = model ?? entry.asin
    if (seen.has(key)) continue
    seen.add(key)
    out.push(entry)
  }
  return out.map((item, i) => ({ ...item, rank: i + 1 }))
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp パソコン用キーボード売れ筋（2151977051）。 */`,
    `export const keyboardBestsellers: Gadget[] = [`,
  ]
  for (const g of gadgets) {
    lines.push("  {")
    for (const [k, v] of Object.entries({
      id: g.id,
      category: "keyboard",
      name: g.name,
      brand: g.brand,
      tagline: g.tagline,
      price: g.price,
      rating: g.rating,
      reviews: g.reviews,
      image: g.image,
      connection: g.connection,
      purchaseUrl: g.purchaseUrl,
    })) {
      lines.push(
        typeof v === "string"
          ? `    ${k}: ${JSON.stringify(v)},`
          : `    ${k}: ${v},`,
      )
    }
    if (g.keyboardFilterTags?.length) {
      lines.push(`    keyboardFilterTags: ${JSON.stringify(g.keyboardFilterTags)},`)
    }
    if (g.keyboardUsage) {
      lines.push(`    keyboardUsage: ${JSON.stringify(g.keyboardUsage)},`)
    }
    if (g.hasRapidTrigger) {
      lines.push(`    hasRapidTrigger: true,`)
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

const rawPath = join(__dirname, "keyboard-bestsellers-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-keyboard-bestsellers.mjs first")
  process.exit(1)
}

const { keyboards } = JSON.parse(readFileSync(rawPath, "utf8"))
const filtered = keyboards.filter(
  (item) =>
    !CURATED_ASINS.has(item.asin) &&
    !isKeyboardAccessoryTitle(item.title ?? "") &&
    !isKeyboardMouseComboTitle(item.title ?? ""),
)
const deduped = dedupeByModel(filtered)
const built = deduped.map(buildGadget)

writeFileSync(join(ROOT, "lib", "keyboard-bestsellers.ts"), toTs(built))
console.log(
  `Wrote ${built.length} keyboards (skip curated: ${keyboards.length - filtered.length}, deduped: ${filtered.length - deduped.length})`,
)

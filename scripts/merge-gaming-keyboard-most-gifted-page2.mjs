/**
 * gaming-keyboard-most-gifted-page2-raw.json + spec cache → lib/keyboard-gaming-most-gifted-page2.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { resolveGadgetImage } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { isGamingKeyboardBestsellersPage2Excluded } from "./gaming-keyboard-bestsellers-page2-accessory.mjs"
import {
  applyAmazonKeyboardSpecs,
  sanitizeKeyboardWeight,
  inferLayoutFromText,
  inferStructureFromText,
  inferKeycapsFromText,
  inferPowerFromText,
  inferKeyboardFilterTags,
  inferConnectionFromTitle,
  inferRapidTrigger,
  shortProductName,
  extractBrand,
  DASH,
} from "./amazon-keyboard-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const specCachePath = join(__dirname, "keyboard-specs-cache.json")
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const gamingOverrides = existsSync(join(__dirname, "gaming-keyboard-spec-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "gaming-keyboard-spec-overrides.json"), "utf8"))
  : {}
const bsPage2Overrides = existsSync(
  join(__dirname, "gaming-keyboard-bestsellers-page2-spec-overrides.json"),
)
  ? JSON.parse(
      readFileSync(join(__dirname, "gaming-keyboard-bestsellers-page2-spec-overrides.json"), "utf8"),
    )
  : {}
const giftedOverrides = existsSync(join(__dirname, "gaming-keyboard-most-gifted-spec-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "gaming-keyboard-most-gifted-spec-overrides.json"), "utf8"))
  : {}
const page2Overrides = JSON.parse(
  readFileSync(join(__dirname, "gaming-keyboard-most-gifted-page2-spec-overrides.json"), "utf8"),
)
const allOverrides = { ...gamingOverrides, ...bsPage2Overrides, ...giftedOverrides, ...page2Overrides }
const imageCachePath = join(__dirname, "keyboard-image-cache.json")
const imageCache = existsSync(imageCachePath)
  ? JSON.parse(readFileSync(imageCachePath, "utf8"))
  : {}

function resolveImage(asin, image) {
  return resolveGadgetImage(asin, image, imageCache, allOverrides)
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

function applyOverride(gadget, asin) {
  const override = allOverrides[asin]
  if (!override) return gadget

  let next = { ...gadget }
  if (override.name) next = { ...next, name: override.name }
  if (override.brand) next = { ...next, brand: override.brand }
  if (override.tagline) next = { ...next, tagline: override.tagline }
  if (override.connection) next = { ...next, connection: override.connection }
  if (override.price != null) next = { ...next, price: override.price }
  if (override.keyboardFilterTags) {
    next = { ...next, keyboardFilterTags: override.keyboardFilterTags }
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
    next = patchSpecRow(next, "接続 / 電源", "接続方式", override.connection)
  }
  if (override.dimensions) {
    next = patchSpecRow(next, "サイズ / 重量", "寸法", override.dimensions)
  }
  if (override.weight) {
    next = patchSpecRow(next, "サイズ / 重量", "重量", override.weight)
  }
  return next
}

function buildTagline(title, cached) {
  const bullets = cached?.specs?.bullets ?? ""
  if (bullets.length > 40) {
    const first = bullets.split(/[。．!！]/)[0].trim()
    if (first.length >= 20 && first.length <= 140 && !/›|画像はありません/i.test(first)) {
      return first
    }
  }
  const cleaned = title
    .replace(/^【[^】]+】\s*/g, "")
    .replace(/\s*\|\s*.+$/, "")
    .replace(/\s*国内正規品.*$/i, "")
    .trim()
  return cleaned.length > 140 ? cleaned.slice(0, 137) + "…" : cleaned
}

function applySizeWeightFromCache(gadget, cached) {
  let next = gadget
  const specs = cached?.specs
  if (!specs) return next
  if (specs.dimensions) next = patchSpecRow(next, "サイズ / 重量", "寸法", specs.dimensions)
  const weight = sanitizeKeyboardWeight(specs.weight)
  if (weight) next = patchSpecRow(next, "サイズ / 重量", "重量", weight)
  return next
}

function applyPollingRateSpec(gadget, title) {
  const m = title.match(/(8000|1000)\s*hz|8k polling|8khz|8K\s|ポーリングレート\s*8000/i)
  if (!m) return gadget
  const rate = /8k|8000/i.test(m[0]) ? "8,000 Hz" : "1,000 Hz"
  return patchSpecRow(gadget, "接続 / 電源", "ポーリングレート", rate)
}

function buildGadget(entry) {
  const { asin, rating, reviews, price, image } = entry
  const amazonRank = entry.amazonRank ?? entry.rank
  const rankingTitle = entry.title ?? entry.name ?? ""
  const cached = specCache[asin]
  const cachedTitle = rankingTitle || cached?.title || rankingTitle
  const conn =
    allOverrides[asin]?.connection ?? inferConnectionFromTitle(cachedTitle)
  const hay = `${cachedTitle} ${cached?.specs?.bullets ?? ""}`

  const layout = inferLayoutFromText(hay) ?? DASH
  const structure = inferStructureFromText(hay, cached?.specs?.switchType, cachedTitle) ?? DASH
  const keycaps = inferKeycapsFromText(hay) ?? DASH
  const power = inferPowerFromText(hay, conn) ?? "有線給電"

  const base = {
    id: `k-gmg-p2-${String(amazonRank).padStart(3, "0")}`,
    category: "keyboard",
    name: shortProductName(cachedTitle),
    brand: extractBrand(cachedTitle),
    tagline: buildTagline(cachedTitle, cached),
    price: normalizeImportedPrice(price ?? cached?.price, asin, allOverrides),
    rating,
    reviews,
    image: resolveImage(asin, image),
    connection: conn,
    purchaseUrl: `https://www.amazon.co.jp/dp/${asin}`,
    keyboardUsage: "gaming",
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
    result = applyAmazonKeyboardSpecs(base, cached.specs, cachedTitle)
  }
  result = applyOverride(result, asin)
  result = applySizeWeightFromCache(result, cached)
  result = applyPollingRateSpec(result, cachedTitle)
  const rapid = allOverrides[asin]?.hasRapidTrigger ?? inferRapidTrigger(result)
  result = {
    ...result,
    keyboardUsage: "gaming",
    ...(rapid ? { hasRapidTrigger: true } : {}),
    keyboardFilterTags:
      allOverrides[asin]?.keyboardFilterTags ?? inferKeyboardFilterTags(result),
  }
  return result
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp ゲーミングキーボード人気ギフト 2ページ目（2151972051 most-gifted pg=2 #51–#100）。 */`,
    `export const keyboardGamingMostGiftedPage2: Gadget[] = [`,
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
      keyboardUsage: "gaming",
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

const rawPath = join(__dirname, "gaming-keyboard-most-gifted-page2-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-gaming-keyboard-most-gifted-page2.mjs first")
  process.exit(1)
}

const { keyboards } = JSON.parse(readFileSync(rawPath, "utf8"))
const filtered = keyboards.filter(
  (item) => !isGamingKeyboardBestsellersPage2Excluded(item.title ?? ""),
)
const built = filtered
  .map(buildGadget)
  .sort((a, b) => a.id.localeCompare(b.id))

writeFileSync(join(ROOT, "lib", "keyboard-gaming-most-gifted-page2.ts"), toTs(built))
console.log(
  `Wrote ${built.length} gaming keyboards to lib/keyboard-gaming-most-gifted-page2.ts (excluded ${keyboards.length - filtered.length})`,
)

/**
 * gaming-keyboard-new-releases-page1-raw.json + spec cache → lib/keyboard-gaming-new-releases-page1.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { resolveGadgetImage } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { isGproKeyboardSearchExcluded } from "./gpro-general-keyboard-search-filter.mjs"
import {
  applyAmazonKeyboardSpecs,
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
const page1Overrides = JSON.parse(
  readFileSync(join(__dirname, "keyboard-gpro-page3-spec-overrides.json"), "utf8"),
)
const gamingOverrides = existsSync(join(__dirname, "gaming-keyboard-spec-overrides.json"))
  ? JSON.parse(readFileSync(join(__dirname, "gaming-keyboard-spec-overrides.json"), "utf8"))
  : {}
const allOverrides = { ...gamingOverrides, ...page1Overrides }
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
  const override = page1Overrides[asin]
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
  if (override.hasRapidTrigger != null) {
    next = { ...next, hasRapidTrigger: override.hasRapidTrigger }
  }
  if (override.isKeyboardAccessory != null) {
    next = { ...next, isKeyboardAccessory: override.isKeyboardAccessory }
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
  if (override.power) {
    next = {
      ...next,
      highlights: next.highlights.map((h) =>
        h.label === "電源" ? { ...h, value: override.power } : h,
      ),
      specGroups: next.specGroups.map((group) => {
        if (!/接続|電源/i.test(group.title)) return group
        const rows = group.rows.some((r) => r.label === "電源")
          ? group.rows.map((r) => (r.label === "電源" ? { ...r, value: override.power } : r))
          : [...group.rows, { label: "電源", value: override.power }]
        return { ...group, rows }
      }),
    }
  }
  if (override.connection) {
    next = patchSpecRow(next, "接続 / 電源", "接続方式", override.connection)
  }
  if (override.pollingRate && override.pollingRate !== DASH) {
    next = patchSpecRow(next, "接続 / 電源", "ポーリングレート", override.pollingRate)
  }
  if (override.dimensions && override.dimensions !== DASH) {
    next = patchSpecRow(next, "サイズ / 重量", "寸法", override.dimensions)
  }
  if (override.weight && override.weight !== DASH) {
    next = patchSpecRow(next, "サイズ / 重量", "重量", override.weight)
  }
  if (override.backlight && override.backlight !== DASH) {
    next = patchSpecRow(next, "キー / スイッチ", "バックライト", override.backlight)
  }
  if (override.formFactor && override.formFactor !== DASH) {
    next = patchSpecRow(next, "キー / スイッチ", "フォームファクター", override.formFactor)
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

function applyPollingRateSpec(gadget, title, override) {
  if (override?.pollingRate && override.pollingRate !== DASH) {
    return patchSpecRow(gadget, "接続 / 電源", "ポーリングレート", override.pollingRate)
  }
  const m = title.match(/(8000|1000)\s*hz|8k polling/i)
  if (!m) return gadget
  const rate = /8k|8000/i.test(m[0]) ? "8,000 Hz" : "1,000 Hz"
  return patchSpecRow(gadget, "接続 / 電源", "ポーリングレート", rate)
}

function applySizeWeightFromCache(gadget, cached) {
  let next = gadget
  const specs = cached?.specs
  if (!specs) return next
  if (specs.dimensions) next = patchSpecRow(next, "サイズ / 重量", "寸法", specs.dimensions)
  if (specs.weight) next = patchSpecRow(next, "サイズ / 重量", "重量", specs.weight)
  return next
}

function buildGadget(entry) {
  const { amazonRank, asin, rating, reviews, price, image, rank } = entry
  const title = entry.title ?? entry.name ?? ""
  const cached = specCache[asin]
  const override = page1Overrides[asin]
  const conn = override?.connection ?? inferConnectionFromTitle(title)
  const hay = `${title} ${cached?.specs?.bullets ?? ""}`

  const layout = override?.layout ?? inferLayoutFromText(hay) ?? DASH
  const structure =
    override?.internalStructure ??
    inferStructureFromText(hay, cached?.specs?.switchType, title) ??
    DASH
  const keycaps = override?.keycaps ?? inferKeycapsFromText(hay) ?? DASH
  const power = override?.power ?? inferPowerFromText(hay, conn) ?? "有線給電"

  const base = {
    id: `k-gp3-${String(entry.rank ?? amazonRank).padStart(3, "0")}`,
    category: "keyboard",
    name: override?.name ?? shortProductName(title),
    brand: override?.brand ?? extractBrand(title),
    tagline: override?.tagline ?? buildTagline(title, cached),
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
    result = applyAmazonKeyboardSpecs(base, cached.specs, cached.title ?? title)
  }
  result = applyOverride(result, asin)
  result = applyPollingRateSpec(result, title, override)
  result = applySizeWeightFromCache(result, cached)
  result = {
    ...result,
    keyboardUsage: "gaming",
    hasRapidTrigger: override?.hasRapidTrigger ?? inferRapidTrigger(result),
    keyboardFilterTags: override?.keyboardFilterTags ?? inferKeyboardFilterTags(result),
  }
  if (override?.isKeyboardAccessory != null) {
    result = { ...result, isKeyboardAccessory: override.isKeyboardAccessory }
  }
  return result
}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp gpro 検索 page=3。キーボード本体のみ。 */`,
    `export const keyboardGproPage3: Gadget[] = [`,
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
    if (g.isKeyboardAccessory === false) {
      lines.push(`    isKeyboardAccessory: false,`)
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

const rawPath = join(__dirname, "keyboard-gpro-page3-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run import-keyboard-gpro-page3-browser-data.mjs first")
  process.exit(1)
}

const { keyboards } = JSON.parse(readFileSync(rawPath, "utf8"))
const filtered = keyboards.filter((item) => !isGproKeyboardSearchExcluded(item.title ?? ""))
const built = filtered.map(buildGadget).sort((a, b) => a.id.localeCompare(b.id))

writeFileSync(
  join(ROOT, "lib", "keyboard-gpro-page3.ts"),
  toTs(built),
)
console.log(`Wrote ${built.length} gpro page3 keyboards to lib/keyboard-gpro-page3.ts`)

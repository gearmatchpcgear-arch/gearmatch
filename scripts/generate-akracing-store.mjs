/**
 * akracing-store-catalog.json → lib/gaming-chair-akracing-store.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

function esc(v) {
  return JSON.stringify(v)
}

function sanitizeDimensions(raw) {
  if (!raw) return raw
  return String(raw).replace(
    /(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*×\s*(\d{4,})\s*cm/i,
    (_, w, d, h) => `${w} × ${d} × ${h.slice(0, -1)} cm`,
  )
}

const DIMENSION_CARD_LABEL = "寸法（D x W x H）"

function normalizeCatalogItem(g) {
  if (g.dimensions) g.dimensions = sanitizeDimensions(g.dimensions)
  for (const h of g.highlights) {
    if (h.label === "寸法/重量" || h.label === DIMENSION_CARD_LABEL) {
      h.label = DIMENSION_CARD_LABEL
      h.value = sanitizeDimensions(h.value)
    }
  }
  for (const sg of g.specGroups) {
    for (const row of sg.rows) {
      if (row.label === "本体寸法" || row.label === "寸法/重量") {
        row.value = sanitizeDimensions(row.value)
      }
    }
  }
  return g
}

function toTs(catalog) {
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon AKRacing 公式ストア（ゲーミングチェア / ライフスタイル / Facility / コラボ）全シリーズ */",
    "export const gamingChairAkracingStore: Gadget[] = [",
  ]

  for (const g of catalog) {
    lines.push("  {")
    lines.push(`    id: ${esc(g.id)},`)
    lines.push(`    category: "gaming-chair",`)
    if (g.frameMaterial) lines.push(`    frameMaterial: ${esc(g.frameMaterial)},`)
    if (g.maxRecliningAngle) lines.push(`    maxRecliningAngle: ${esc(g.maxRecliningAngle)},`)
    if (g.dimensions) lines.push(`    dimensions: ${esc(g.dimensions)},`)
    if (g.seatDepth) lines.push(`    seatDepth: ${esc(g.seatDepth)},`)
    if (g.seatWidth) lines.push(`    seatWidth: ${esc(g.seatWidth)},`)
    if (g.backrestWidth) lines.push(`    backrestWidth: ${esc(g.backrestWidth)},`)
    if (g.hasOttoman != null) lines.push(`    hasOttoman: ${g.hasOttoman},`)
    if (g.gamingChairFilterTags?.length) {
      lines.push(`    gamingChairFilterTags: ${JSON.stringify(g.gamingChairFilterTags)},`)
    }
    lines.push(`    name: ${esc(g.name)},`)
    lines.push(`    brand: ${esc(g.brand)},`)
    lines.push(`    tagline: ${esc(g.tagline)},`)
    lines.push(`    price: ${g.price ?? "null"},`)
    lines.push(`    rating: ${g.rating ?? 4.0},`)
    lines.push(`    reviews: ${g.reviews ?? 0},`)
    lines.push(`    image: ${esc(normalizeAmazonImageUrl(g.image) || g.image || "")},`)
    lines.push(`    purchaseUrl: ${esc(g.purchaseUrl)},`)
    lines.push(`    highlights: [`)
    for (const h of g.highlights) {
      lines.push(`      { label: ${esc(h.label)}, value: ${esc(h.value)} },`)
    }
    lines.push(`    ],`)
    lines.push(`    compat: [],`)
    lines.push(`    specGroups: [`)
    for (const sg of g.specGroups) {
      lines.push(`      { title: ${esc(sg.title)}, rows: [`)
      for (const r of sg.rows) {
        lines.push(`          { label: ${esc(r.label)}, value: ${esc(r.value)} },`)
      }
      lines.push(`        ]},`)
    }
    lines.push(`    ],`)
    lines.push(`  },`)
  }

  lines.push("]", "")
  return lines.join("\n")
}

const { catalog: rawCatalog } = JSON.parse(readFileSync(join(__dirname, "akracing-store-catalog.json"), "utf8"))

const KEEP_SERIES = new Set([
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
])

const catalog = rawCatalog.filter((g) => {
  if (!KEEP_SERIES.has(g.series)) return false
  if (/組立済モデル/.test(g.name)) return false
  if (/Premium Monarca/i.test(g.name)) return false
  return true
})

console.log(`Filtered ${rawCatalog.length} → ${catalog.length} chairs`)
const normalized = catalog.map(normalizeCatalogItem)
const out = toTs(normalized)
writeFileSync(join(ROOT, "lib", "gaming-chair-akracing-store.ts"), out)
console.log(`Wrote ${catalog.length} items → lib/gaming-chair-akracing-store.ts`)

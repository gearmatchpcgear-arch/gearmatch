/**
 * monitor-bestsellers-raw.json + spec overrides → lib/monitor-bestsellers.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"
import { buildMonitorGadget } from "./amazon-monitor-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

function collectCuratedAsins() {
  const asins = new Set()
  const gadgetsSrc = readFileSync(join(ROOT, "lib", "gadgets.ts"), "utf8")
  const monitorIdx = gadgetsSrc.indexOf('category: "monitor"')
  if (monitorIdx >= 0) {
    const slice = gadgetsSrc.slice(monitorIdx)
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(slice)) !== null) asins.add(m[1])
  }
  return asins
}

const CURATED_ASINS = collectCuratedAsins()
const monitorOverrides = JSON.parse(
  readFileSync(join(__dirname, "monitor-spec-overrides.json"), "utf8"),
)

function applyOverride(gadget, asin, override) {
  if (!override) return gadget
  let next = { ...gadget }
  if (override.name) next.name = override.name
  if (override.brand) next.brand = override.brand
  if (override.tagline) next.tagline = override.tagline
  if (override.connection) next.connection = override.connection
  if (override.price != null) next.price = override.price
  if (override.monitorFilterTags) {
    next.monitorFilterTags = override.monitorFilterTags
  }

  const patchFields = [
    ["画面サイズ", override.screenSize, "ディスプレイ", "画面サイズ"],
    ["解像度", override.resolution, "ディスプレイ", "解像度"],
    ["リフレッシュ", override.refreshRate, "ディスプレイ", "リフレッシュレート"],
    ["パネル", override.panel, "ディスプレイ", "パネル"],
    ["重量", override.weight, "その他", "重量"],
  ]

  for (const [hLabel, value, gTitle, rLabel] of patchFields) {
    if (!value) continue
    const shortRes =
      hLabel === "解像度"
        ? value.includes("4K")
          ? "4K UHD"
          : value.includes("UWQHD")
            ? "UWQHD"
            : value.includes("QHD")
              ? "QHD"
              : value.includes("FHD")
                ? "FHD"
                : value
        : value

    if (next.highlights.some((h) => h.label === hLabel)) {
      next.highlights = next.highlights.map((h) =>
        h.label === hLabel ? { ...h, value: hLabel === "画面サイズ" ? value.replace(/ インチ$/, '"').replace(" インチ", '"') : shortRes } : h,
      )
    }

    next.specGroups = next.specGroups.map((g) => {
      if (g.title !== gTitle) return g
      const has = g.rows.some((r) => r.label === rLabel)
      return {
        ...g,
        rows: has
          ? g.rows.map((r) => (r.label === rLabel ? { ...r, value } : r))
          : [...g.rows, { label: rLabel, value }],
      }
    })
  }

  if (override.connection) {
    next.specGroups = next.specGroups.map((g) =>
      g.title === "接続端子"
        ? {
            title: "接続端子",
            rows: override.connection.split(" / ").map((p) => ({
              label: p.trim(),
              value: /pd|給電/i.test(p) ? "映像/給電対応" : "対応",
            })),
          }
        : g,
    )
  }

  return next
}

function toTs(gadgets) {
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp ディスプレイ売れ筋（2151982051）。 */",
    "export const monitorBestsellers: Gadget[] = [",
  ]
  for (const g of gadgets) {
    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(g.id)},`)
    lines.push(`    category: "monitor",`)
    lines.push(`    name: ${JSON.stringify(g.name)},`)
    lines.push(`    brand: ${JSON.stringify(g.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(g.tagline)},`)
    lines.push(`    price: ${g.price},`)
    lines.push(`    rating: ${g.rating},`)
    lines.push(`    reviews: ${g.reviews},`)
    lines.push(`    image: ${JSON.stringify(g.image)},`)
    lines.push(`    connection: ${JSON.stringify(g.connection)},`)
    lines.push(`    purchaseUrl: ${JSON.stringify(g.purchaseUrl)},`)
    if (g.monitorFilterTags?.length) {
      lines.push(`    monitorFilterTags: ${JSON.stringify(g.monitorFilterTags)},`)
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

const rawPath = join(__dirname, "monitor-bestsellers-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-monitor-bestsellers.mjs or create monitor-bestsellers-raw.json first")
  process.exit(1)
}

const { monitors } = JSON.parse(readFileSync(rawPath, "utf8"))
const filtered = monitors.filter(
  (item) =>
    !CURATED_ASINS.has(item.asin) &&
    !isMonitorAccessory(item.title ?? ""),
)

const built = filtered.map((item, i) => {
  const image = normalizeAmazonImageUrl(item.image)
  const price = normalizeImportedPrice(item.price)
  const override = monitorOverrides[item.asin] ?? {}
  let gadget = buildMonitorGadget({ ...item, image, price }, i, override)
  gadget = applyOverride(gadget, item.asin, override)
  return gadget
})

writeFileSync(join(ROOT, "lib", "monitor-bestsellers.ts"), toTs(built))
console.log(
  `Wrote ${built.length} monitors (skip curated: ${monitors.length - filtered.length})`,
)

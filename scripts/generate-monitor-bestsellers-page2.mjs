/**
 * monitor-bestsellers-page2-catalog.json → lib/monitor-bestsellers-page2.ts
 * Enriches image/rating/reviews from monitor-bestsellers-page2-raw.json when ASIN matches.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

function sizeDisplay(screenSize) {
  const m = String(screenSize).match(/([\d.]+)/)
  return m ? `${m[1]}"` : "—"
}

function shortRes(resolution) {
  if (/4K|3840/.test(resolution)) return "4K UHD"
  if (/UWQHD|3440/.test(resolution)) return "UWQHD"
  if (/QHD|2560 x 1440|WQHD/.test(resolution)) return "QHD"
  if (/WQXGA|2\.5K|2560 x 1600/.test(resolution)) return "WQXGA"
  if (/FHD|1920/.test(resolution)) return "FHD"
  return resolution
}

function portRows(connection) {
  return connection.split(" / ").map((p) => ({
    label: p.trim(),
    value: /pd|給電|65w|90w|60w|70w/i.test(p) ? "映像/給電対応" : "対応",
  }))
}

function loadRawByAsin() {
  const rawPath = join(__dirname, "monitor-bestsellers-page2-raw.json")
  if (!existsSync(rawPath)) return new Map()

  const raw = JSON.parse(readFileSync(rawPath, "utf8"))
  const all = [...(raw.monitors ?? []), ...(raw.raw ?? []), ...(raw.excluded ?? [])]
  const map = new Map()
  for (const item of all) {
    if (item.asin) map.set(item.asin, item)
  }
  return map
}

function toTs(catalog, rawByAsin) {
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp ディスプレイ売れ筋 2ページ目（2151982051 pg=2）#51–#100。 */",
    "export const monitorBestsellersPage2: Gadget[] = [",
  ]

  for (const item of catalog.sort((a, b) => a.rank - b.rank)) {
    if (!item.asin) {
      console.warn(`Skip rank ${item.rank}: no ASIN`)
      continue
    }

    const raw = rawByAsin.get(item.asin)
    const image =
      normalizeAmazonImageUrl(raw?.image) ||
      normalizeAmazonImageUrl(item.image) ||
      "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"
    const id = `mon-bs2-${String(item.rank - 50).padStart(3, "0")}`

    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(id)},`)
    lines.push(`    category: "monitor",`)
    lines.push(`    name: ${JSON.stringify(item.name)},`)
    lines.push(`    brand: ${JSON.stringify(item.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(item.tagline)},`)
    lines.push(`    price: ${item.price ?? "null"},`)
    lines.push(`    rating: ${raw?.rating ?? item.rating ?? 4.0},`)
    lines.push(`    reviews: ${raw?.reviews ?? item.reviews ?? 0},`)
    lines.push(`    image: ${JSON.stringify(image)},`)
    lines.push(`    connection: ${JSON.stringify(item.connection)},`)
    lines.push(`    purchaseUrl: "https://www.amazon.co.jp/dp/${item.asin}",`)
    if (item.monitorFilterTags?.length) {
      lines.push(`    monitorFilterTags: ${JSON.stringify(item.monitorFilterTags)},`)
    }
    lines.push(`    highlights: [`)
    lines.push(
      `      { label: "画面サイズ", value: ${JSON.stringify(sizeDisplay(item.screenSize))} },`,
    )
    lines.push(
      `      { label: "解像度", value: ${JSON.stringify(shortRes(item.resolution))} },`,
    )
    lines.push(
      `      { label: "リフレッシュ", value: ${JSON.stringify(item.refreshRate)} },`,
    )
    lines.push(
      `      { label: "パネル", value: ${JSON.stringify(item.panel.split(" ")[0] === "—" ? "—" : item.panel.split("/")[0].trim())} },`,
    )
    lines.push(`    ],`)
    lines.push(`    compat: [],`)
    lines.push(`    specGroups: [`)
    lines.push(`      { title: "ディスプレイ", rows: [`)
    lines.push(
      `          { label: "画面サイズ", value: ${JSON.stringify(item.screenSize)} },`,
    )
    lines.push(
      `          { label: "解像度", value: ${JSON.stringify(item.resolution)} },`,
    )
    lines.push(`          { label: "パネル", value: ${JSON.stringify(item.panel)} },`)
    lines.push(
      `          { label: "リフレッシュレート", value: ${JSON.stringify(item.refreshRate)} },`,
    )
    lines.push(`          { label: "Amazon売れ筋", value: "PCモニター #${item.rank}" },`)
    lines.push(`        ]},`)
    lines.push(`      { title: "接続端子", rows: [`)
    for (const row of portRows(item.connection)) {
      lines.push(
        `          { label: ${JSON.stringify(row.label)}, value: ${JSON.stringify(row.value)} },`,
      )
    }
    lines.push(`        ]},`)
    lines.push(`    ],`)
    lines.push(`  },`)
  }

  lines.push("]", "")
  return lines.join("\n")
}

const catalog = JSON.parse(
  readFileSync(join(__dirname, "monitor-bestsellers-page2-catalog.json"), "utf8"),
)
const rawByAsin = loadRawByAsin()
const enriched = catalog.filter((x) => x.asin).length
const withImages = catalog.filter((x) => x.asin && rawByAsin.has(x.asin)).length

const out = toTs(catalog, rawByAsin)
writeFileSync(join(ROOT, "lib", "monitor-bestsellers-page2.ts"), out)
console.log(
  `Wrote ${enriched} monitors to lib/monitor-bestsellers-page2.ts (${withImages} enriched from raw)`,
)

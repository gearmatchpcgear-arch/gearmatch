/**
 * monitor-bestsellers-page1-catalog.json → lib/monitor-bestsellers.ts
 */
import { readFileSync, writeFileSync } from "fs"
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
  if (/FHD|1920/.test(resolution)) return "FHD"
  return resolution
}

function portRows(connection) {
  return connection.split(" / ").map((p) => ({
    label: p.trim(),
    value: /pd|給電|65w|90w/i.test(p) ? "映像/給電対応" : "対応",
  }))
}

function toTs(catalog) {
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp ディスプレイ売れ筋 1ページ目（2151982051）#1–#50。 */",
    "export const monitorBestsellers: Gadget[] = [",
  ]

  for (const item of catalog.sort((a, b) => a.rank - b.rank)) {
    if (!item.asin) {
      console.warn(`Skip rank ${item.rank}: no ASIN`)
      continue
    }
    const image =
      normalizeAmazonImageUrl(item.image) ||
      "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"
    const id = `mon-bs-${String(item.rank).padStart(3, "0")}`

    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(id)},`)
    lines.push(`    category: "monitor",`)
    lines.push(`    name: ${JSON.stringify(item.name)},`)
    lines.push(`    brand: ${JSON.stringify(item.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(item.tagline)},`)
    lines.push(`    price: ${item.price ?? "null"},`)
    lines.push(`    rating: ${item.rating ?? 4.0},`)
    lines.push(`    reviews: ${item.reviews ?? 0},`)
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
    lines.push(`      { label: "パネル", value: ${JSON.stringify(item.panel.split(" ")[0] === "—" ? "—" : item.panel.split("/")[0].trim())} },`)
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
  readFileSync(join(__dirname, "monitor-bestsellers-page1-catalog.json"), "utf8"),
)
const out = toTs(catalog)
writeFileSync(join(ROOT, "lib", "monitor-bestsellers.ts"), out)
console.log(`Wrote ${catalog.filter((x) => x.asin).length} monitors to lib/monitor-bestsellers.ts`)

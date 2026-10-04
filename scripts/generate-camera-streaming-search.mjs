/**
 * camera-streaming-search-catalog.json → lib/camera-streaming-search.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CATALOG_PATH = join(__dirname, "camera-streaming-search-catalog.json")

function toTs(catalog) {
  const sorted = [...catalog].sort((a, b) => {
    const ra = a.rank || 999
    const rb = b.rank || 999
    if (ra !== rb) return ra - rb
    return a.name.localeCompare(b.name)
  })

  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp「配信用カメラ」検索結果（カメラ本体のみ。アクセサリー除外）。 */",
    "export const cameraStreamingSearch: Gadget[] = [",
  ]

  for (const g of sorted) {
    const id = `cam-str-${String(g.rank || 0).padStart(3, "0")}-${g.asin.slice(-4).toLowerCase()}`
    const image = normalizeAmazonImageUrl(g.image) || g.image || ""

    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(id)},`)
    lines.push(`    category: "camera",`)
    lines.push(`    name: ${JSON.stringify(g.name)},`)
    lines.push(`    brand: ${JSON.stringify(g.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(g.tagline)},`)
    lines.push(`    price: ${g.price ?? "null"},`)
    lines.push(`    rating: ${g.rating ?? 4.0},`)
    lines.push(`    reviews: ${g.reviews ?? 0},`)
    lines.push(`    image: ${JSON.stringify(image)},`)
    lines.push(`    connection: ${JSON.stringify(g.connection ?? g.connector ?? "—")},`)
    lines.push(`    purchaseUrl: ${JSON.stringify(g.purchaseUrl)},`)
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

if (!existsSync(CATALOG_PATH)) {
  console.error(`Missing ${CATALOG_PATH} — run fetch-camera-streaming-details.mjs first`)
  process.exit(1)
}

const { catalog: rawCatalog } = JSON.parse(readFileSync(CATALOG_PATH, "utf8"))
const catalog = rawCatalog.filter((g) => {
  const hay = `${g.name} ${g.tagline} ${g.brand} ${g.connection ?? ""} ${(g.highlights ?? []).map((h) => h.value).join(" ")}`
  if (/FIFINE.*マイク|ダイナミックマイク|バックカメラモニター|自撮りモニター/i.test(hay)) return false
  if (/リングライト.*スタンド|スマホ撮影スタンド|クランプマウント|キャプチャーボード/i.test(hay)) return false
  return true
})
console.log(`Filtered catalog: ${rawCatalog.length} → ${catalog.length}`)
const out = toTs(catalog)
writeFileSync(join(ROOT, "lib", "camera-streaming-search.ts"), out)
console.log(`Wrote ${catalog.length} cameras to lib/camera-streaming-search.ts`)

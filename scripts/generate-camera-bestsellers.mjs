/**
 * camera-bestsellers-catalog.json → lib/camera-bestsellers.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isStreamingCameraAccessory } from "./camera-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

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
    "/** Amazon.co.jp ウェブカメラ売れ筋（10500630051）1–2ページ目 + 既存定番モデル。 */",
    "export const cameraBestsellers: Gadget[] = [",
  ]

  let idx = 0
  for (const g of sorted) {
    idx++
    const id = g.rank ? `cam-bs-${String(g.rank).padStart(3, "0")}` : `cam-cur-${String(idx).padStart(3, "0")}`
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

const { catalog: rawCatalog } = JSON.parse(
  readFileSync(join(__dirname, "camera-bestsellers-catalog.json"), "utf8"),
)
const catalog = rawCatalog.filter((g) => {
  const title = [g.name, g.tagline, g.brand].filter(Boolean).join(" ")
  return !isStreamingCameraAccessory(title)
})
const out = toTs(catalog)
writeFileSync(join(ROOT, "lib", "camera-bestsellers.ts"), out)
console.log(`Wrote ${catalog.length} cameras to lib/camera-bestsellers.ts`)

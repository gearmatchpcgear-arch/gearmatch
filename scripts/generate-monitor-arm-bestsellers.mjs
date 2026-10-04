/**
 * monitor-arm-bestsellers-catalog.json → lib/monitor-arm-bestsellers.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

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
    "/** Amazon.co.jp コンピュータモニターアーム（売れ筋 + カテゴリ検索 + featured検索2ページ目）。 */",
    "export const monitorArmBestsellers: Gadget[] = [",
  ]

  for (const g of sorted) {
    const id = g.id || `arm-bs-${String(g.rank ?? 0).padStart(3, "0")}`
    const image = normalizeAmazonImageUrl(g.image) || g.image || ""

    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(id)},`)
    lines.push(`    category: "monitor-arm",`)
    lines.push(`    name: ${JSON.stringify(g.name)},`)
    lines.push(`    brand: ${JSON.stringify(g.brand)},`)
    lines.push(`    tagline: ${JSON.stringify(g.tagline)},`)
    lines.push(`    price: ${g.price ?? "null"},`)
    lines.push(`    rating: ${g.rating ?? 4.0},`)
    lines.push(`    reviews: ${g.reviews ?? 0},`)
    lines.push(`    image: ${JSON.stringify(image)},`)
    lines.push(`    connection: ${JSON.stringify(g.connection ?? "—")},`)
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

const { catalog } = JSON.parse(
  readFileSync(join(__dirname, "monitor-arm-bestsellers-catalog.json"), "utf8"),
)
const out = toTs(catalog)
writeFileSync(join(ROOT, "lib", "monitor-arm-bestsellers.ts"), out)
console.log(`Wrote ${catalog.length} monitor arms to lib/monitor-arm-bestsellers.ts`)

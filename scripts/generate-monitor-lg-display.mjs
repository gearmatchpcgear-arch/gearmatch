/**
 * monitor-lg-display-catalog.json → lib/monitor-lg-display-bestsellers.ts
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

function toTs(catalog) {
  const lines = [
    'import type { Gadget } from "./gadgets"',
    "",
    "/** Amazon.co.jp ディスプレイ売れ筋（5595709051）LGモニター全件。 */",
    "export const monitorLgDisplayBestsellers: Gadget[] = [",
  ]

  for (const item of [...catalog].sort((a, b) => a.rank - b.rank)) {
    const image =
      normalizeAmazonImageUrl(item.image) ||
      "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"

    lines.push("  {")
    lines.push(`    id: ${JSON.stringify(item.id)},`)
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
    for (const h of item.highlights) {
      lines.push(`      { label: ${JSON.stringify(h.label)}, value: ${JSON.stringify(h.value)} },`)
    }
    lines.push(`    ],`)
    lines.push(`    compat: [],`)
    lines.push(`    specGroups: [`)
    for (const group of item.specGroups) {
      lines.push(`      { title: ${JSON.stringify(group.title)}, rows: [`)
      for (const row of group.rows) {
        lines.push(
          `          { label: ${JSON.stringify(row.label)}, value: ${JSON.stringify(row.value)} },`,
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
  readFileSync(join(__dirname, "monitor-lg-display-catalog.json"), "utf8"),
)
writeFileSync(join(ROOT, "lib", "monitor-lg-display-bestsellers.ts"), toTs(catalog))
console.log(`Wrote ${catalog.length} monitors to lib/monitor-lg-display-bestsellers.ts`)

/**
 * Audit duplicate ASINs across gadgets with different names/brands.
 * Usage: npx tsx scripts/audit-amazon-urls.mjs
 */
import { allSourceGadgets } from "../lib/gadgets.ts"

const byAsin = new Map()

for (const g of allSourceGadgets) {
  const m = g.purchaseUrl?.match(/\/dp\/([A-Z0-9]{10})/)
  if (!m) continue
  const asin = m[1]
  if (!byAsin.has(asin)) byAsin.set(asin, [])
  byAsin.get(asin).push({
    id: g.id,
    name: g.name,
    brand: g.brand ?? "—",
    category: g.category,
    tagline: (g.tagline ?? "").slice(0, 100),
  })
}

const dupes = [...byAsin.entries()]
  .filter(([, items]) => {
    const sigs = new Set(items.map((i) => `${i.category}|${i.brand}|${i.name}`))
    return items.length > 1 && sigs.size > 1
  })
  .sort((a, b) => b[1].length - a[1].length)

console.log(`Total gadgets with ASIN URL: ${[...byAsin.values()].flat().length}`)
console.log(`Duplicate ASIN across different name/brand: ${dupes.length}\n`)

for (const [asin, items] of dupes) {
  console.log(`ASIN ${asin} (${items.length} records)`)
  for (const i of items) {
    console.log(`  ${i.id} [${i.category}] ${i.brand} | ${i.name}`)
    console.log(`    ${i.tagline}`)
  }
  console.log("")
}

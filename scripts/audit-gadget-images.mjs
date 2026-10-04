/**
 * Audit listable gadget images for missing/invalid URLs.
 * Usage: npx tsx scripts/audit-gadget-images.mjs
 */
import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { isValidProductImage } from "../lib/gadget-images.ts"

const listable = getListableGadgets(gadgets, false)
const missing = listable.filter((g) => !isValidProductImage(g.image))
const byCategory = {}

for (const g of missing) {
  byCategory[g.category] ??= []
  byCategory[g.category].push({
    id: g.id,
    name: g.name,
    brand: g.brand,
    image: g.image,
    purchaseUrl: g.purchaseUrl,
  })
}

console.log(`Listable gadgets: ${listable.length}`)
console.log(`Missing/invalid images: ${missing.length}`)
for (const [cat, items] of Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${cat}: ${items.length}`)
  for (const item of items.slice(0, 5)) {
    console.log(`  ${item.id} | ${item.name.slice(0, 50)} | ${item.purchaseUrl ?? "no url"}`)
  }
  if (items.length > 5) console.log(`  ... and ${items.length - 5} more`)
}

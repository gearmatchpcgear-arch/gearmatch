/**
 * Verify lib gadget blocks align with default listing IDs.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import { parseGadgetBlocks } from "./used-refurbished-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const listable = getListableGadgets(gadgets, false)
const keepIds = new Set(listable.map((g) => g.id))

let orphanBlocks = 0
for (const file of fs.readdirSync(libDir).filter((f) => f.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(libDir, file), "utf8")
  if (!src.includes("category:")) continue
  for (const block of parseGadgetBlocks(src)) {
    if (!/category: "/.test(block.text)) continue
    const id = block.text.match(/id: "([^"]+)"/)?.[1]
    if (id && !keepIds.has(id)) orphanBlocks++
  }
}

const categories = [
  "mouse",
  "keyboard",
  "mic",
  "camera",
  "monitor",
  "monitor-arm",
  "gaming-chair",
  "audio-interface",
]

console.log("Listing alignment")
console.log(`  source: ${allSourceGadgets.length}`)
console.log(`  export: ${gadgets.length}`)
console.log(`  listable: ${listable.length}`)
console.log(`  orphan blocks: ${orphanBlocks}`)

for (const category of categories) {
  const pool = listable.filter((g) => g.category === category)
  const groups = getFilterGroupsForCategory(category, listable)
  const zeroFilters = groups
    .flatMap((g) => g.filters)
    .filter((filter) => pool.filter((item) => filter.match(item)).length === 0).length
  console.log(`  ${category}: ${pool.length} items, ${groups.length} filter groups, ${zeroFilters} zero-match filters`)
}

if (
  orphanBlocks > 0 ||
  allSourceGadgets.length !== listable.length ||
  gadgets.length !== listable.length
) {
  process.exit(1)
}

console.log("OK")

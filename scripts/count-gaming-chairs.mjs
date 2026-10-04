import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, gadgets, getListableGadgets, filterGadgetsByCategory } from "../lib/gadgets.ts"
import { GAMING_CHAIRS_CSV_BY_ID } from "../lib/gaming-chairs-csv-data.generated.ts"
import { inferGamingChairFilterTagsMerged } from "../lib/gaming-chair-filter-tags.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const files = fs
  .readdirSync(libDir)
  .filter(
    (name) =>
      name.endsWith(".ts") &&
      !name.includes("csv-data") &&
      !name.includes("csv-shape") &&
      (name.startsWith("gaming-chair") || name === "gaming-chairs.ts"),
  )
const idRe = /\bid:\s*"(chair-[^"]+)"/g
const allScanned = new Set()
for (const file of files) {
  const text = fs.readFileSync(path.join(libDir, file), "utf8")
  for (const match of text.matchAll(idRe)) allScanned.add(match[1])
}

const csvIds = new Set(Object.keys(GAMING_CHAIRS_CSV_BY_ID))
const list = filterGadgetsByCategory(getListableGadgets(gadgets, false), "gaming-chair")
const sourceChairs = allSourceGadgets.filter((g) => g.category === "gaming-chair")

console.log("listable UI", list.length)
console.log("gadgets export", gadgets.filter((g) => g.category === "gaming-chair").length)
console.log("allSource", sourceChairs.length)
console.log("csv", csvIds.size)
console.log("scanned in lib ts", allScanned.size)
console.log("scanned not csv", [...allScanned].filter((id) => !csvIds.has(id)).length)
console.log("csv not scanned", [...csvIds].filter((id) => !allScanned.has(id)).length)

const floor = sourceChairs.filter((g) =>
  inferGamingChairFilterTagsMerged(g).includes("style-floor"),
)
console.log("style-floor", floor.length)

const rows = Object.values(GAMING_CHAIRS_CSV_BY_ID)
console.log(
  "csv with rating",
  rows.filter((r) => r.rating != null).length,
  "with reviews",
  rows.filter((r) => r.reviewCount != null).length,
  "with dimensions",
  rows.filter((r) => r.dimensions?.trim()).length,
)

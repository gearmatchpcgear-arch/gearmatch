/**
 * Verify mouse_products.csv exclusions are applied to lib/gadgets listing.
 * Usage: npx tsx scripts/verify-mouse-catalog-exclusions.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, gadgets } from "../lib/gadgets.ts"
import {
  MOUSE_CATALOG_EXCLUDED_ID_SET,
  MOUSE_PRODUCTS_CSV_BY_ID,
} from "../lib/mouse-products-catalog.generated.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const csvPath = path.join(root, "data", "mouse_products.csv")

const listedMouseIds = new Set(gadgets.filter((g) => g.category === "mouse").map((g) => g.id))
const violations = [...MOUSE_CATALOG_EXCLUDED_ID_SET].filter((id) => listedMouseIds.has(id))

if (violations.length > 0) {
  console.error("Excluded mouse IDs still in listing:", violations.slice(0, 10))
  process.exit(1)
}

const sourceCount = allSourceGadgets.filter((g) => g.category === "mouse").length
console.log(
  `OK: ${MOUSE_CATALOG_EXCLUDED_ID_SET.size} excluded, ${listedMouseIds.size} listed (source mouse: ${sourceCount})`,
)
console.log(`Catalog rows: ${Object.keys(MOUSE_PRODUCTS_CSV_BY_ID).length}, CSV: ${csvPath}`)

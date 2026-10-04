/** Scan gadget data files for legacy ¥1,000 placeholder prices. */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { LEGACY_PLACEHOLDER_PRICE } from "./amazon-price.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const files = ["lib/mouse-bestsellers.ts", "lib/mouse-popular-brands.ts", "lib/gadgets.ts"]

for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), "utf8")
  const hits = []
  for (const m of src.matchAll(
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]+)"[\s\S]*?price: (\d+|null)/g,
  )) {
    const asin = m[1]
    const price = m[2] === "null" ? null : Number(m[2])
    if (price === LEGACY_PLACEHOLDER_PRICE) {
      const name = m[0].match(/name: "([^"]{0,60})/)?.[1] ?? asin
      hits.push({ asin, name })
    }
  }
  console.log(`${rel}: placeholder ¥${LEGACY_PLACEHOLDER_PRICE} → ${hits.length}`)
  for (const h of hits.slice(0, 5)) console.log(`  ${h.asin} ${h.name}`)
  if (hits.length > 5) console.log(`  ... +${hits.length - 5} more`)
}

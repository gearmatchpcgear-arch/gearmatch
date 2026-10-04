/**
 * Audit all gadget data files for missing/invalid product images.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isValidAmazonProductImage } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")

const SKIP = new Set([
  "gadgets.ts",
  "gadget-filters.ts",
  "gadget-images.ts",
  "price-filter.ts",
  "spec-display-sanitize.ts",
  "mic-connection-display.ts",
  "monitor-detail-specs.ts",
  "monitor-vesa-standard.ts",
  "gaming-chair-dimensions.ts",
])

const files = readdirSync(LIB).filter(
  (f) =>
    f.endsWith(".ts") &&
    !SKIP.has(f) &&
    !f.includes("-filter-tags") &&
    !f.includes("-tags.ts") &&
    !f.includes("-use-tags") &&
    !f.includes("-feature-tags"),
)

const missing = []

for (const file of files) {
  const src = readFileSync(join(LIB, file), "utf8")
  if (!src.includes("purchaseUrl:")) continue

  const blockRe = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g
  let block
  while ((block = blockRe.exec(src)) !== null) {
    const chunk = block[0]
    if (!chunk.includes("purchaseUrl:") || !chunk.includes("image:")) continue

    const asin = chunk.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    const image = chunk.match(/image: "([^"]*)"/)?.[1]
    const name = chunk.match(/name: "([^"]*)"/)?.[1]
    const id = chunk.match(/id: "([^"]*)"/)?.[1]
    if (!asin) continue

    if (!isValidAmazonProductImage(image)) {
      missing.push({ file, asin, id: id ?? "?", name: name ?? "?", image: image ?? "" })
    }
  }
}

console.log(`Missing/invalid images: ${missing.length}`)
const byFile = {}
for (const x of missing) {
  byFile[x.file] = (byFile[x.file] ?? 0) + 1
}
console.log("By file:", JSON.stringify(byFile, null, 2))
for (const x of missing.slice(0, 40)) {
  console.log(`  ${x.file} | ${x.asin} | ${x.name} | ${x.image.slice(0, 50)}`)
}
if (missing.length > 40) console.log(`  ... +${missing.length - 40} more`)

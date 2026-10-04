/**
 * Audit duplicate purchaseUrl / image across gadget entries.
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function extractGadgets(src, file) {
  const gadgets = []
  const blockRe =
    /id: "([^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?image: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    gadgets.push({
      id: m[1],
      name: m[2],
      brand: m[3],
      image: m[4],
      asin: m[5],
      file,
    })
  }
  return gadgets
}

const all = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  all.push(...extractGadgets(src, file))
}

const byUrl = new Map()
const byImage = new Map()
for (const g of all) {
  const urlKey = g.asin
  if (!byUrl.has(urlKey)) byUrl.set(urlKey, [])
  byUrl.get(urlKey).push(g)
  if (!byImage.has(g.image)) byImage.set(g.image, [])
  byImage.get(g.image).push(g)
}

console.log("=== Duplicate ASINs (different id/brand) ===")
for (const [asin, items] of [...byUrl.entries()].sort()) {
  const brands = new Set(items.map((i) => `${i.brand}|${i.name}`))
  if (items.length > 1 && brands.size > 1) {
    console.log(`\nASIN ${asin} (${items.length} entries):`)
    for (const i of items) console.log(`  ${i.id} [${i.brand}] ${i.name} (${i.file})`)
  }
}

console.log("\n=== Duplicate images (different ASIN) ===")
let imgDupes = 0
for (const [img, items] of byImage.entries()) {
  const asins = new Set(items.map((i) => i.asin))
  if (items.length > 1 && asins.size > 1) {
    imgDupes++
    if (imgDupes <= 30) {
      console.log(`\nImage: ${img.slice(0, 70)}...`)
      for (const i of items) console.log(`  ${i.asin} ${i.id} [${i.brand}] ${i.name}`)
    }
  }
}
console.log(`\nTotal image dupes with different ASIN: ${imgDupes}`)

console.log(`\nTotal gadgets with Amazon URL: ${all.length}`)

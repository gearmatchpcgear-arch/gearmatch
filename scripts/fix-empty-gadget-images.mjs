/**
 * Fill empty gadget images from global-image-cache.json and monitor search raw JSON.
 * Usage: node scripts/fix-empty-gadget-images.mjs [--apply]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isValidAmazonProductImage, normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const APPLY = process.argv.includes("--apply")

function loadImageMap() {
  const map = new Map()
  const sources = [
    join(__dirname, "global-image-cache.json"),
    join(__dirname, "monitor-lenovo-search-raw.json"),
    join(__dirname, "monitor-lenovo-search-1822-browser-items.json"),
    join(__dirname, "monitor-lenovo-search-26plus-browser-items.json"),
    join(__dirname, "monitor-lenovo-search-26plus-page2-browser-items.json"),
  ]

  for (const path of sources) {
    if (!existsSync(path)) continue
    const data = JSON.parse(readFileSync(path, "utf8"))
    const items = Array.isArray(data) ? data : data.monitors ?? data.raw ?? []
    for (const item of items) {
      const asin = item.asin?.toUpperCase?.()
      const image = item.image ? normalizeAmazonImageUrl(item.image) : ""
      if (asin && isValidAmazonProductImage(image)) {
        map.set(asin, image)
      }
    }
  }

  const cachePath = join(__dirname, "global-image-cache.json")
  if (existsSync(cachePath)) {
    const cache = JSON.parse(readFileSync(cachePath, "utf8"))
    for (const [asin, meta] of Object.entries(cache)) {
      const image = meta?.image ? normalizeAmazonImageUrl(meta.image) : ""
      if (isValidAmazonProductImage(image)) map.set(asin, image)
    }
  }

  return map
}

const imageByAsin = loadImageMap()
const fixes = []
const stillMissing = []
const fileChanges = new Map()

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const filePath = join(LIB, file)
  let src = readFileSync(filePath, "utf8")
  let changed = false

  src = src.replace(/(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g, (block) => {
    const id = block.match(/\bid: "([^"]+)"/)?.[1]
    const image = block.match(/\bimage: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!id || !asin || isValidAmazonProductImage(image)) return block

    const nextImage = imageByAsin.get(asin)
    if (!nextImage) {
      stillMissing.push({ id, asin, file })
      return block
    }

    fixes.push({ id, asin, file, nextImage })
    changed = true
    return block.replace(/image: "[^"]*"/, `image: "${nextImage}"`)
  })

  if (changed) fileChanges.set(filePath, src)
}

console.log(`Fixes found: ${fixes.length}`)
for (const f of fixes) console.log(`  ${f.id} (${f.asin}) <- ${f.nextImage.match(/\/I\/([^._]+)/)?.[1]}`)
console.log(`Still missing: ${stillMissing.length}`)
for (const s of stillMissing) console.log(`  ${s.id} ${s.asin} (${s.file})`)

if (APPLY) {
  for (const [filePath, content] of fileChanges) {
    writeFileSync(filePath, content)
  }
  console.log(`Applied ${fixes.length} fixes to ${fileChanges.size} files`)
}

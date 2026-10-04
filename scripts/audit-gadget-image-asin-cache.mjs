/**
 * Compare gadget card images to ASIN-keyed image caches (no live fetch).
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {}
}

const cameraCache = loadJson(join(__dirname, "camera-image-cache.json"))
const asinCache = loadJson(join(__dirname, "asin-title-cache.json"))
const index = buildAsinMetaIndex()

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

function resolveAsinImage(asin) {
  const fromCamera = cameraCache[asin]?.image
  if (fromCamera) return normalizeAmazonImageUrl(fromCamera)
  const fromAsin = asinCache[asin]?.image
  if (fromAsin) return normalizeAmazonImageUrl(fromAsin)
  const fromIndex = index.get(asin)?.image
  if (fromIndex) return normalizeAmazonImageUrl(fromIndex)
  return null
}

function parseBlocks(src, file) {
  const blocks = []
  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[1]
    const id = block.match(/\bid: "([^"]+)"/)?.[1]
    const category = block.match(/category: "([^"]+)"/)?.[1]
    const name = block.match(/\bname: "([^"]*)"/)?.[1] ?? ""
    const brand = block.match(/\bbrand: "([^"]*)"/)?.[1] ?? ""
    const image = block.match(/\bimage: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!id || !asin) continue
    blocks.push({ block, id, category, name, brand, image, asin, file })
  }
  return blocks
}

const all = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  all.push(...parseBlocks(readFileSync(join(LIB, file), "utf8"), file))
}

let targets = all
if (CATEGORY) targets = targets.filter((g) => g.category === CATEGORY)

const mismatches = []
const missingCache = []

for (const g of targets) {
  const expected = resolveAsinImage(g.asin)
  if (!expected) {
    missingCache.push(g)
    continue
  }
  if (imageId(g.image) !== imageId(expected)) {
    mismatches.push({
      ...g,
      expectedImage: expected,
      cardImageId: imageId(g.image),
      expectedImageId: imageId(expected),
    })
  }
}

writeFileSync(
  join(__dirname, "gadget-image-asin-cache-audit.json"),
  JSON.stringify(
    {
      scanned: targets.length,
      mismatches: mismatches.length,
      missingCache: missingCache.length,
      mismatchList: mismatches.map(({ block, ...rest }) => rest),
      missingList: missingCache.map(({ block, ...rest }) => rest).slice(0, 200),
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(`Scanned ${targets.length} gadgets`)
console.log(`Image mismatches vs ASIN cache: ${mismatches.length}`)
console.log(`Missing cache image: ${missingCache.length}`)
for (const m of mismatches.slice(0, 15)) {
  console.log(`${m.file} ${m.id} [${m.brand}] ${m.name.slice(0, 40)} ASIN ${m.asin}`)
  console.log(`  card ${m.cardImageId} -> expected ${m.expectedImageId}`)
}

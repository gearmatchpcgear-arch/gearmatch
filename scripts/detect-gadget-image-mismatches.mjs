/**
 * Detect cross-category image sharing and title/image mismatches vs ASIN index.
 * Usage: node scripts/detect-gadget-image-mismatches.mjs [--category=monitor]
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const REPORT = join(__dirname, "gadget-image-mismatch-report.json")
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]

const CHAIR_KW = /チェア|chair|オットマン|gaming chair|ゲーミングチェア|座椅子|seat/i
const MONITOR_KW = /モニター|monitor|display|ディスプレイ|インチ|フルhd|ips|hz|液晶/i
const MOUSE_KW = /マウス|mouse|dpi|gaming mouse/i
const KEYBOARD_KW = /キーボード|keyboard|メカニカル|keycap/i
const MIC_KW = /マイク|microphone|mic\b|xlr/i

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

function parseGadgetBlocks(src, file) {
  const blocks = []
  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[1]
    const id = block.match(/\bid: "([^"]+)"/)?.[1]
    const category = block.match(/category: "([^"]+)"/)?.[1]
    const name = block.match(/\bname: "([^"]*)"/)?.[1] ?? ""
    const brand = block.match(/\bbrand: "([^"]*)"/)?.[1] ?? ""
    const tagline = block.match(/\btagline: "([^"]*)"/)?.[1] ?? ""
    const image = block.match(/\bimage: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!id || !asin || !category) continue
    blocks.push({ block, id, category, name, brand, tagline, image, asin, file })
  }
  return blocks
}

function inferCategoryFromText(text) {
  const hay = (text || "").toLowerCase()
  if (CHAIR_KW.test(hay)) return "gaming-chair"
  if (MONITOR_KW.test(hay)) return "monitor"
  if (MOUSE_KW.test(hay)) return "mouse"
  if (KEYBOARD_KW.test(hay)) return "keyboard"
  if (MIC_KW.test(hay)) return "mic"
  return null
}

function likelyMatch(gadget, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle.toLowerCase()
  if (gadget.brand && gadget.brand !== "—") {
    const brand = gadget.brand.toLowerCase().replace(/[()（）]/g, " ")
    if (hay.includes("lenovo") && brand.includes("lenovo")) return true
    if (hay.includes(brand.split(/\s+/)[0])) return true
  }
  const nameWords = gadget.name
    .toLowerCase()
    .split(/[\s/]+/)
    .filter((w) => w.length >= 4)
  const hits = nameWords.filter((w) => hay.includes(w))
  return hits.length >= Math.min(2, nameWords.length) || (nameWords.length === 1 && hits.length === 1)
}

const index = buildAsinMetaIndex()
const all = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  all.push(...parseGadgetBlocks(readFileSync(join(LIB, file), "utf8"), file))
}

const filtered = CATEGORY ? all.filter((g) => g.category === CATEGORY) : all

const imageUsage = new Map()
for (const g of all) {
  const img = imageId(g.image)
  if (!img) continue
  if (!imageUsage.has(img)) imageUsage.set(img, [])
  imageUsage.get(img).push(g)
}

const crossCategory = []
const imageMismatch = []
const titleMismatch = []
const pollutedIndexImage = []

for (const g of filtered) {
  const img = imageId(g.image)
  const meta = index.get(g.asin)
  const usages = img ? imageUsage.get(img) ?? [] : []
  const categories = new Set(usages.map((u) => u.category))

  if (categories.size > 1) {
    crossCategory.push({
      id: g.id,
      file: g.file,
      category: g.category,
      name: g.name,
      asin: g.asin,
      image: g.image,
      sharedWith: usages
        .filter((u) => u.id !== g.id)
        .map((u) => ({ id: u.id, category: u.category, name: u.name, asin: u.asin })),
    })
  }

  if (meta?.title && !likelyMatch(g, meta.title)) {
    titleMismatch.push({
      id: g.id,
      file: g.file,
      category: g.category,
      name: g.name,
      asin: g.asin,
      amazonTitle: meta.title.slice(0, 120),
    })
  }

  if (meta?.title && meta?.image && likelyMatch(g, meta.title)) {
    const metaImg = imageId(meta.image)
    if (metaImg && img && metaImg !== img) {
      imageMismatch.push({
        id: g.id,
        file: g.file,
        category: g.category,
        name: g.name,
        asin: g.asin,
        cardImage: g.image,
        indexImage: meta.image,
      })
    }

    const titleCat = inferCategoryFromText(meta.title)
    const imageCats = new Set(usages.map((u) => u.category))
    if (titleCat && titleCat === g.category && imageCats.size > 1 && !imageCats.has(g.category)) {
      pollutedIndexImage.push({
        id: g.id,
        asin: g.asin,
        name: g.name,
        indexImage: meta.image,
        titleCat,
        gadgetCategory: g.category,
      })
    }
  }
}

const report = {
  scanned: filtered.length,
  crossCategory: crossCategory.length,
  titleMismatch: titleMismatch.length,
  imageMismatch: imageMismatch.length,
  pollutedIndexImage: pollutedIndexImage.length,
  crossCategoryItems: crossCategory,
  titleMismatchItems: titleMismatch.slice(0, 200),
  imageMismatchItems: imageMismatch.slice(0, 200),
  pollutedIndexImageItems: pollutedIndexImage,
  generatedAt: new Date().toISOString(),
}

writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n")
console.log(`Scanned ${filtered.length}`)
console.log(`Cross-category image: ${crossCategory.length}`)
console.log(`Title mismatch: ${titleMismatch.length}`)
console.log(`Image mismatch (index): ${imageMismatch.length}`)
console.log(`Polluted index image: ${pollutedIndexImage.length}`)

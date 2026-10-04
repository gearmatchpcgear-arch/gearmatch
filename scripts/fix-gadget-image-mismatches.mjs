/**
 * Fix gadget image/ASIN mismatches using ASIN index + cross-category detection.
 * Usage:
 *   node scripts/fix-gadget-image-mismatches.mjs
 *   node scripts/fix-gadget-image-mismatches.mjs --apply
 *   node scripts/fix-gadget-image-mismatches.mjs --apply --category=monitor
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const APPLY = process.argv.includes("--apply")
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]
const REPORT = join(__dirname, "gadget-image-mismatch-fix-report.json")

/** Amazon SERP / scrape で本体画像が汚染された ASIN → 正しい商品画像 */
const IMAGE_OVERRIDES = {
  /** ThinkCentre Tiny-in-One 24 Gen 4（B08LW45Q1W と同一モデル） */
  B0HBVT2TDK: "https://m.media-amazon.com/images/I/61yVcc5gM-L._AC_SL1500_.jpg",
  /** ASUS VZ249HR（Amazon.co.jp限定） */
  B08LGHP4C7: "https://m.media-amazon.com/images/I/71O2ThvdW6L._AC_SL1500_.jpg",
  /** Lenovo L24-41 */
  B0G42QB93M: "https://m.media-amazon.com/images/I/610o5mrvwQL._AC_SL1500_.jpg",
  /** AutoFull M6 Ultra 2.0（Amazon SERP がモニター画像に汚染） */
  B0FKB5X4XZ:
    "https://www.autofull.com/cdn/shop/files/M602_MainImage_01_Productimage_front_webp_2e0b5122-4aa4-425a-b6cf-92aee82804d6_grande.webp",
  /** Ewin タブレット用キーボード */
  B0F9FPR8MQ: "https://m.media-amazon.com/images/I/61Qa7Ts8KyL._AC_SL1500_.jpg",
  /** WOBKEY Rainy 75 Pro 静音版（黒・日本語配列）— 親ページ scrape が Pro(ブラック 英字配列) 画像に汚染 */
  B0GGB26MRZ: "https://m.media-amazon.com/images/I/61wYHSXVG-L._AC_SL1500_.jpg",
}

const CARD_ASIN_OVERRIDES = {
  "mon-nr2-005": "B0H28F8CWD",
  "mon-gift-004": "B0DX1BJ2R8",
  "mon-gift-029": "B0CNK91XLQ",
  "k-tbl-019": "B0FDKVKZ5Q",
  "k-tbl-030": "B0F9FPR8MQ",
  "mon-asus-020": "B08LGHP4C7",
  "mon-bs-042": "B08LGHP4C7",
  "mon-gift-026": "B08LGHP4C7",
}

const BRAND_ALIASES = {
  logicool: ["logicool", "logitech", "ロジクール"],
  asus: ["asus", "エイスース"],
  acer: ["acer", "エイサー"],
  "i-o data": ["i-o data", "iodata", "アイ・オー", "io data"],
  lenovo: ["lenovo", "レノボ"],
  dell: ["dell", "デル"],
  minifire: ["minifire"],
  cocopar: ["cocopar"],
  upperizon: ["upperizon"],
  autofull: ["autofull", "オートフル"],
  akracing: ["akracing"],
}

const CHAIR_KW = /チェア|chair|オットマン|gaming chair|ゲーミングチェア|座椅子/i
const MONITOR_KW = /モニター|monitor|display|ディスプレイ|インチ|液晶|hz/i
const KEYBOARD_KW = /キーボード|keyboard|keycap|配列/i
const MOUSE_KW = /マウス|mouse|dpi/i
const MIC_KW = /マイク|microphone|mic\b|xlr/i
const CAMERA_KW = /webcam|webカメラ|カメラ|camera/i
const AUDIO_IF_KW = /オーディオインターフェ|audio interface|ミキサー|mixer/i

function inferCategoryFromText(text) {
  if (CHAIR_KW.test(text)) return "gaming-chair"
  if (MONITOR_KW.test(text)) return "monitor"
  if (KEYBOARD_KW.test(text)) return "keyboard"
  if (MOUSE_KW.test(text)) return "mouse"
  if (MIC_KW.test(text)) return "mic"
  if (CAMERA_KW.test(text)) return "camera"
  if (AUDIO_IF_KW.test(text)) return "audio-interface"
  return null
}

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

function modelTokens(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        !/keyboard|mouse|モニター|monitor|チェア|chair|インチ|ゲーミング/i.test(t),
    )
}

function likelyMatch(gadget, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle.replace(/&amp;/g, "&").toLowerCase()

  if (gadget.brand && gadget.brand !== "—") {
    const brand = gadget.brand.toLowerCase().replace(/[()（）]/g, " ")
    const aliases = BRAND_ALIASES[brand.split(/\s+/)[0]] ?? [brand.split(/\s+/)[0]]
    if (aliases.some((a) => hay.includes(a))) {
      const models = modelTokens(gadget.name)
      if (models.length === 0 || models.some((t) => hay.includes(t))) return true
    }
  }

  const models = modelTokens(gadget.name)
  if (models.some((t) => hay.includes(t))) return true

  const nameWords = (gadget.name || "")
    .toLowerCase()
    .split(/[\s/]+/)
    .filter((w) => w.length >= 4)
  const hits = nameWords.filter((w) => hay.includes(w))
  return hits.length >= Math.min(2, nameWords.length)
}

function scoreMatch(gadget, amazonTitle) {
  if (!amazonTitle) return 0
  let score = 0
  const hay = amazonTitle.toLowerCase()
  const cardHay = `${gadget.name} ${gadget.tagline ?? ""}`.toLowerCase()

  if (gadget.brand && gadget.brand !== "—") {
    const brand = gadget.brand.toLowerCase().replace(/[()（）]/g, " ")
    const aliases = BRAND_ALIASES[brand.split(/\s+/)[0]] ?? [brand.split(/\s+/)[0]]
    if (aliases.some((a) => hay.includes(a))) score += 5
  }

  for (const t of modelTokens(gadget.name)) {
    if (hay.includes(t)) score += 4
  }

  if (/2\.5k|2560|2520|wqxga/i.test(cardHay) && /2\.5k|2560|2520|wqxga/i.test(hay)) score += 6
  if (/120hz/i.test(cardHay) && /120hz/i.test(hay)) score += 2
  if (/240hz/i.test(cardHay) && /240hz/i.test(hay)) score += 2

  return score
}

function findBestAsin(gadget, index) {
  let best = null
  for (const [asin, meta] of index) {
    if (!meta.title) continue
    const inferred = inferCategoryFromText(meta.title)
    if (inferred && inferred !== gadget.category) continue
    const score = scoreMatch(gadget, meta.title)
    if (score < 7) continue
    if (!likelyMatch(gadget, meta.title)) continue
    if (!best || score > best.score) {
      best = { asin, title: meta.title, image: meta.image, score }
    }
  }
  return best
}

function isCrossCategoryPolluted(gadget, imageUsage) {
  const img = imageId(gadget.image)
  if (!img) return false
  const usages = imageUsage.get(img) ?? []
  const categories = new Set(usages.map((u) => u.category))
  if (categories.size <= 1) return false
  for (const u of usages) {
    if (u.id === gadget.id || u.category === gadget.category) continue
    const otherCategory = inferCategoryFromText(`${u.name} ${u.tagline ?? ""}`)
    if (otherCategory && otherCategory !== gadget.category) return true
  }
  return false
}

function resolveOverrideImage(asin, index) {
  if (IMAGE_OVERRIDES[asin]) {
    return IMAGE_OVERRIDES[asin]
  }
  const meta = index.get(asin)
  return meta?.image ? normalizeAmazonImageUrl(meta.image) : null
}

function resolveTargetImage(gadget, index, imageUsage) {
  if (CARD_ASIN_OVERRIDES[gadget.id]) {
    const overrideAsin = CARD_ASIN_OVERRIDES[gadget.id]
    const overrideImage = resolveOverrideImage(overrideAsin, index)
    if (overrideImage && (overrideAsin !== gadget.asin || overrideImage !== gadget.image)) {
      return { asin: overrideAsin, image: overrideImage, reason: "card-asin-override" }
    }
  }

  if (IMAGE_OVERRIDES[gadget.asin]) {
    const image = IMAGE_OVERRIDES[gadget.asin]
    if (image !== gadget.image) {
      return { asin: gadget.asin, image, reason: "image-override" }
    }
    return null
  }

  if (isCrossCategoryPolluted(gadget, imageUsage) && IMAGE_OVERRIDES[gadget.asin]) {
    return {
      asin: gadget.asin,
      image: IMAGE_OVERRIDES[gadget.asin],
      reason: "cross-category-fix",
    }
  }

  let asin = gadget.asin
  let meta = index.get(asin)

  if (meta?.title && likelyMatch(gadget, meta.title) && meta.image) {
    const normalized = normalizeAmazonImageUrl(meta.image)
    const pollutedCrossCategory =
      isCrossCategoryPolluted({ ...gadget, image: normalized }, imageUsage) &&
      !IMAGE_OVERRIDES[gadget.asin]
    if (
      !pollutedCrossCategory &&
      (imageId(normalized) !== imageId(gadget.image) || gadget.image !== normalized)
    ) {
      return { asin, image: normalized, reason: "index-image-sync" }
    }
  }

  return null
}

const index = buildAsinMetaIndex()
const all = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  all.push(...parseGadgetBlocks(readFileSync(join(LIB, file), "utf8"), file))
}

const targets = CATEGORY ? all.filter((g) => g.category === CATEGORY) : all

const imageUsage = new Map()
for (const g of all) {
  const img = imageId(g.image)
  if (!img) continue
  if (!imageUsage.has(img)) imageUsage.set(img, [])
  imageUsage.get(img).push(g)
}

const fixes = []
const unchanged = []
const unresolved = []
const fileChanges = new Map()

for (const g of targets) {
  const resolved = resolveTargetImage(g, index, imageUsage)
  if (!resolved) {
    if (isCrossCategoryPolluted(g, imageUsage) && !IMAGE_OVERRIDES[g.asin]) {
      unresolved.push({ id: g.id, file: g.file, name: g.name, asin: g.asin, issue: "cross-category-unresolved" })
    } else {
      unchanged.push(g.id)
    }
    continue
  }

  const nextAsin = resolved.asin
  const nextImage = resolved.image
  if (nextAsin === g.asin && nextImage === g.image) {
    unchanged.push(g.id)
    continue
  }

  let nextBlock = g.block
  if (nextAsin !== g.asin) {
    nextBlock = nextBlock.replace(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
      `purchaseUrl: "https://www.amazon.co.jp/dp/${nextAsin}"`,
    )
  }
  if (nextImage && nextImage !== g.image) {
    nextBlock = nextBlock.replace(/image: "[^"]*"/, `image: "${nextImage}"`)
  }

  fixes.push({
    id: g.id,
    file: g.file,
    category: g.category,
    name: g.name,
    reason: resolved.reason,
    oldAsin: g.asin,
    newAsin: nextAsin,
    oldImage: g.image,
    newImage: nextImage,
  })

  if (APPLY) {
    const filePath = join(LIB, g.file)
    const current = fileChanges.get(filePath) ?? readFileSync(filePath, "utf8")
    fileChanges.set(filePath, current.replace(g.block, nextBlock))
  }
}

if (APPLY) {
  for (const [filePath, content] of fileChanges) {
    writeFileSync(filePath, content)
  }
}

writeFileSync(
  REPORT,
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      checked: targets.length,
      fixes: fixes.length,
      unchanged: unchanged.length,
      unresolved: unresolved.length,
      fixList: fixes,
      unresolvedList: unresolved,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(`${APPLY ? "Applied" : "Dry-run"}: ${fixes.length} fixes, ${unchanged.length} ok, ${unresolved.length} unresolved`)
for (const f of fixes.slice(0, 40)) {
  console.log(`${f.file} ${f.id} [${f.reason}] ${f.name.slice(0, 50)}`)
  if (f.oldAsin !== f.newAsin) console.log(`  ASIN ${f.oldAsin} -> ${f.newAsin}`)
  if (f.oldImage !== f.newImage) {
    console.log(`  IMG ${imageId(f.oldImage)} -> ${imageId(f.newImage)}`)
  }
}
if (fixes.length > 40) console.log(`... and ${fixes.length - 40} more`)

/**
 * Audit gadget title/brand vs Amazon ASIN title + image.
 * Uses scripts/asin-title-cache.json; pass --refresh to fetch missing/stale ASINs.
 *
 * Usage:
 *   node scripts/audit-gadget-link-image-integrity.mjs
 *   node scripts/audit-gadget-link-image-integrity.mjs --refresh --limit=100
 *   node scripts/audit-gadget-link-image-integrity.mjs --category=monitor
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const REPORT_PATH = join(__dirname, "gadget-link-image-integrity-report.json")

const REFRESH = process.argv.includes("--refresh")
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0)
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const BRAND_ALIASES = {
  logicool: ["logicool", "logitech", "ロジクール"],
  "logicool g": ["logicool", "logitech", "ロジクール", "blue"],
  asus: ["asus", "エイスース"],
  acer: ["acer", "エイサー"],
  "i-o data": ["i-o data", "iodata", "アイ・オー", "io data", "i-o データ"],
  "io data": ["i-o data", "iodata", "アイ・オー", "io data"],
  "iris ohayama": ["iris", "ohyama", "アイリスオーヤマ", "アイリス"],
  benq: ["benq"],
  dell: ["dell", "デル"],
  hp: ["hp", "ヒューレット"],
  lenovo: ["lenovo", "レノボ"],
  samsung: ["samsung", "サムスung"],
  lg: ["lg", "エルジー"],
  visionowl: ["visionowl"],
  koorui: ["koorui"],
  eizo: ["eizo", "エイゾー"],
  buffalo: ["buffalo", "バッファロー"],
  elecom: ["elecom", "エレコム"],
  razer: ["razer", "レイザー"],
  corsair: ["corsair"],
  hyperx: ["hyperx"],
  sony: ["sony", "ソニー"],
  "audio-technica": ["audio-technica", "audio technica", "オーディオテクニカ"],
  shure: ["shure", "シュア"],
  elgato: ["elgato"],
  fifine: ["fifine"],
  maono: ["maono"],
  akracing: ["akracing"],
  autofull: ["autofull", "オートフル"],
  perixx: ["perixx", "ペリックス"],
  realforce: ["realforce", "リアルフォース"],
  pfu: ["pfu", "hhkb"],
  cocopar: ["cocopar"],
  pixio: ["pixio", "ピクシオ"],
  viewsonic: ["viewsonic"],
  philips: ["philips", "フィリップス"],
  iiyama: ["iiyama", "イイヤマ"],
  japanext: ["japanext"],
  newsoul: ["newsoul"],
  upperizon: ["upperizon"],
  eviciv: ["eviciv"],
  arzopa: ["arzopa"],
}

function extractGadgets(src, file) {
  const gadgets = []
  const blockRe =
    /\{\s*\n\s*id: "([^"]+)"[\s\S]*?category: "([^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?image: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    gadgets.push({
      id: m[1],
      category: m[2],
      name: m[3],
      brand: m[4],
      image: m[5],
      asin: m[6],
      file,
    })
  }
  return gadgets
}

function tokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function modelTokens(name) {
  return tokens(name).filter(
    (t) =>
      /[a-z0-9]{3,}/i.test(t) &&
      !/keyboard|mouse|ワイヤレス|bluetooth|キーボード|マウス|モニター|モバイル|インチ|型|ゲーミング|monitor|portable/i.test(
        t,
      ),
  )
}

function likelyMatch(gadget, amazonTitle) {
  const hay = amazonTitle.toLowerCase()
  const title = amazonTitle

  if (!gadget.brand || gadget.brand === "—") {
    const models = modelTokens(gadget.name)
    if (models.some((t) => hay.includes(t.toLowerCase()))) return true
    const nameWords = tokens(gadget.name).filter((t) => t.length >= 3)
    const hits = nameWords.filter((w) => hay.includes(w))
    if (hits.length >= Math.min(2, nameWords.length)) return true
    return false
  }

  const brand = gadget.brand.toLowerCase()
  const aliases = BRAND_ALIASES[brand] ?? [brand]
  if (aliases.some((a) => hay.includes(a) || title.includes(gadget.brand))) return true

  const models = modelTokens(gadget.name)
  if (models.some((t) => hay.includes(t.toLowerCase()))) return true

  return false
}

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

async function fetchMeta(asin) {
  if (cache[asin]?.title && !REFRESH) return cache[asin]
  if (!REFRESH) return cache[asin] ?? { asin, title: "", image: "" }
  await new Promise((r) => setTimeout(r, 1100))
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) =>
    r.text(),
  )
  const title =
    html
      .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  const image =
    html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
    html.match(/"large":"(https:[^"]+)"/)?.[1] ||
    html.match(/data-old-hires="(https:[^"]+)"/)?.[1] ||
    ""
  cache[asin] = {
    asin,
    title,
    image,
    fetchedAt: new Date().toISOString(),
  }
  return cache[asin]
}

const all = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  all.push(...extractGadgets(readFileSync(join(LIB, file), "utf8"), file))
}

const byAsin = new Map()
for (const g of all) {
  if (!byAsin.has(g.asin)) byAsin.set(g.asin, [])
  byAsin.get(g.asin).push(g)
}

let asins = [...byAsin.keys()].sort()
if (CATEGORY) {
  asins = asins.filter((asin) => byAsin.get(asin).some((g) => g.category === CATEGORY))
}
if (LIMIT > 0) asins = asins.slice(0, LIMIT)

const titleMismatches = []
const imageMismatches = []
const missingMeta = []
let checked = 0

for (let i = 0; i < asins.length; i++) {
  const asin = asins[i]
  let meta
  try {
    meta = await fetchMeta(asin)
  } catch (e) {
    missingMeta.push({ asin, error: e.message })
    continue
  }
  if (!meta.title) {
    missingMeta.push({ asin, error: "empty title" })
    continue
  }
  checked++

  for (const g of byAsin.get(asin)) {
    if (CATEGORY && g.category !== CATEGORY) continue
    if (!likelyMatch(g, meta.title)) {
      titleMismatches.push({
        ...g,
        amazonTitle: meta.title,
        amazonImage: meta.image,
      })
    }
    const cardImg = imageId(g.image)
    const amzImg = imageId(meta.image)
    if (cardImg && amzImg && cardImg !== amzImg) {
      imageMismatches.push({
        ...g,
        cardImg,
        amzImg,
        amazonTitle: meta.title,
        amazonImage: meta.image,
      })
    }
  }

  if ((i + 1) % 25 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
    process.stderr.write(`Progress ${i + 1}/${asins.length}\n`)
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")

const report = {
  scannedGadgets: all.length,
  scannedAsins: asins.length,
  checkedWithTitle: checked,
  titleMismatches: titleMismatches.length,
  imageMismatches: imageMismatches.length,
  missingMeta: missingMeta.length,
  titleIssues: titleMismatches,
  imageIssues: imageMismatches.filter(
    (m) => !titleMismatches.some((t) => t.id === m.id && t.file === m.file),
  ),
  missing: missingMeta.slice(0, 100),
  generatedAt: new Date().toISOString(),
}
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n")

console.log(`Gadgets: ${all.length}, ASINs checked: ${checked}/${asins.length}`)
console.log(`Title mismatches: ${titleMismatches.length}`)
console.log(`Image mismatches: ${imageMismatches.length}`)
console.log(`Report: ${REPORT_PATH}`)

for (const m of titleMismatches.slice(0, 30)) {
  console.log(`\n[${m.category}] ${m.id} ASIN=${m.asin} (${m.file})`)
  console.log(`  Card: [${m.brand}] ${m.name.slice(0, 90)}`)
  console.log(`  Amazon: ${m.amazonTitle.slice(0, 90)}`)
}

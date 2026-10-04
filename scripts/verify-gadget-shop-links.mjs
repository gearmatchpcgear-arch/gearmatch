/**
 * Verify all gadget cards: title/brand vs live Amazon ASIN (cache-backed).
 * Run fix-gadget-link-image-live.mjs --apply first to refresh cache + patch.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath, pathToFileURL } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const REPORT_PATH = join(__dirname, "gadget-shop-link-verification.json")

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const BRAND_ALIASES = {
  logicool: ["logicool", "logitech", "ロジクール"],
  "logicool g": ["logicool", "logitech", "ロジクール", "blue"],
  asus: ["asus", "エイスース"],
  acer: ["acer", "エイサー"],
  "i-o data": ["i-o data", "iodata", "アイ・オー", "io data"],
  "io data": ["i-o data", "iodata"],
  "iris ohayama": ["iris", "ohyama", "アイリスオーヤマ", "アイリス", "オーヤマ"],
  visionowl: ["visionowl"],
  koorui: ["koorui"],
  eizo: ["eizo", "エイゾー"],
  msi: ["msi"],
  dell: ["dell"],
  lenovo: ["lenovo"],
  benq: ["benq"],
  pixio: ["pixio"],
  tonor: ["tonor"],
  dowinx: ["dowinx"],
  iodata: ["iodata", "i-o data"],
}

function tokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/&amp;/g, " ")
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function modelTokens(name) {
  return tokens(name).filter(
    (t) =>
      /[a-z0-9]{2,}/i.test(t) &&
      !/keyboard|mouse|モニター|モバイル|インチ|型|ゲーミング|monitor|チェア|椅子/i.test(t),
  )
}

function likelyMatch(gadget, amazonTitle) {
  if (!amazonTitle) return null
  const normalized = amazonTitle.replace(/&amp;/g, "&").replace(/&#39;/g, "'")
  const hay = normalized.toLowerCase()
  if (!gadget.brand || gadget.brand === "—") {
    const models = modelTokens(gadget.name)
    if (models.some((t) => hay.includes(t.toLowerCase()))) return true
    const nw = tokens(gadget.name).filter((t) => t.length >= 3)
    return nw.filter((w) => hay.includes(w)).length >= Math.min(2, nw.length)
  }
  const brand = gadget.brand.toLowerCase()
  const aliases = BRAND_ALIASES[brand] ?? [brand]
  if (aliases.some((a) => hay.includes(a) || normalized.includes(gadget.brand))) return true
  return modelTokens(gadget.name).some((t) => hay.includes(t.toLowerCase()))
}

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

const blockRe =
  /\{\s*\n\s*id: "([^"]+)"[\s\S]*?category: "([^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?image: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g

const issues = []
let checked = 0
let ok = 0
let noCache = 0

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const g = {
      id: m[1],
      category: m[2],
      name: m[3],
      brand: m[4],
      image: m[5],
      asin: m[6],
      file,
      purchaseUrl: `https://www.amazon.co.jp/dp/${m[6]}`,
    }
    const meta = cache[g.asin]
    if (!meta?.title) {
      noCache++
      continue
    }
    checked++
    const titleOk = likelyMatch(g, meta.title)
    const imageOk =
      !meta.image || !g.image
        ? true
        : imageId(g.image) === imageId(meta.image) || g.image === meta.image
    if (titleOk && imageOk) {
      ok++
      continue
    }
    issues.push({
      ...g,
      amazonTitle: meta.title.slice(0, 120),
      amazonImage: meta.image,
      titleOk,
      imageOk,
      cacheSource: meta.source ?? "cache",
    })
  }
}

// Merged export check skipped (gadgets.ts is TypeScript). Source-file scan above is authoritative.
writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      checked,
      ok,
      noCache,
      sourceIssues: issues.length,
      issues,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(`Source files: ${ok}/${checked} ok, ${issues.length} issues, ${noCache} without cache title`)
console.log(`Report: ${REPORT_PATH}`)
for (const x of issues.slice(0, 25)) {
  console.log(`\n${x.id} [${x.brand}] ${x.name.slice(0, 50)} (${x.file})`)
  console.log(`  ${x.asin} titleOk=${x.titleOk} imageOk=${x.imageOk}`)
  console.log(`  Amazon: ${x.amazonTitle}`)
}

/**
 * Fix gadget purchaseUrl/image using live Amazon product pages.
 * Updates scripts/asin-title-cache.json and patches lib/*.ts blocks.
 *
 * Usage:
 *   node scripts/fix-gadget-link-image-live.mjs --dry-run
 *   node scripts/fix-gadget-link-image-live.mjs --apply
 *   node scripts/fix-gadget-link-image-live.mjs --apply --asin=B0HCND3M61
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const REPORT_PATH = join(__dirname, "gadget-link-image-live-fix-report.json")

const APPLY = process.argv.includes("--apply")
const ONLY_ASIN = process.argv.find((a) => a.startsWith("--asin="))?.split("=")[1]
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]
const FROM_AUDIT = process.argv.includes("--from-audit")
const ALL = process.argv.includes("--all")
const REFRESH = process.argv.includes("--refresh")

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const index = buildAsinMetaIndex()
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
  samsung: ["samsung"],
  lg: ["lg", "エルジー"],
  visionowl: ["visionowl"],
  koorui: ["koorui"],
  eizo: ["eizo", "エイゾー"],
  buffalo: ["buffalo", "バッファロー"],
  elecom: ["elecom", "エレコム"],
  razer: ["razer"],
  corsair: ["corsair"],
  msi: ["msi"],
  redragon: ["redragon", "レッドドラゴン"],
  minifire: ["minifire"],
  pixio: ["pixio", "ピクシオ"],
  innocent: ["innocn"],
  innocn: ["innocn"],
  upperizon: ["upperizon"],
  cocopar: ["cocopar"],
  uperfect: ["uperfect"],
  livelect: ["livelect"],
  kimoca: ["kimoca"],
  akracing: ["akracing"],
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
      /[a-z0-9]{2,}/i.test(t) &&
      !/keyboard|mouse|ワイヤレス|bluetooth|キーボード|マウス|モニター|モバイル|インチ|型|ゲーミング|monitor|portable|pc|チェア|椅子/i.test(
        t,
      ),
  )
}

function likelyMatch(gadget, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .toLowerCase()
  const title = amazonTitle.replace(/&amp;/g, "&")

  if (!gadget.brand || gadget.brand === "—") {
    const models = modelTokens(gadget.name)
    if (models.some((t) => hay.includes(t.toLowerCase()))) return true
    const nameWords = tokens(gadget.name).filter((t) => t.length >= 3)
    const hits = nameWords.filter((w) => hay.includes(w))
    return hits.length >= Math.min(2, nameWords.length)
  }

  const brand = gadget.brand.toLowerCase()
  const aliases = BRAND_ALIASES[brand] ?? [brand]
  if (aliases.some((a) => hay.includes(a) || title.includes(gadget.brand))) return true

  return modelTokens(gadget.name).some((t) => hay.includes(t.toLowerCase()))
}

function scoreMatch(gadget, amazonTitle) {
  if (!amazonTitle) return 0
  let score = 0
  const hay = amazonTitle.toLowerCase()
  const cardHay = `${gadget.name} ${gadget.tagline ?? ""}`.toLowerCase()

  if (gadget.brand && gadget.brand !== "—") {
    const aliases = BRAND_ALIASES[gadget.brand.toLowerCase()] ?? [gadget.brand.toLowerCase()]
    if (aliases.some((a) => hay.includes(a))) score += 5
  }

  for (const t of modelTokens(gadget.name)) {
    if (hay.includes(t.toLowerCase())) score += 4
  }

  for (const t of tokens(gadget.name).filter((x) => x.length >= 4)) {
    if (hay.includes(t)) score += 1
  }

  if (/2\.5k|2560|2520|wqxga/i.test(cardHay) && /2\.5k|2560|2520|wqxga/i.test(hay)) score += 6
  if (/1200p|1920|wuxga|1200/i.test(cardHay) && !/2\.5k|2560|2520/i.test(cardHay)) {
    if (/1920|1200|wuxga|1200p/i.test(hay) && !/2\.5k|2560|2520/i.test(hay)) score += 5
  }
  if (/120hz/i.test(cardHay) && /120hz/i.test(hay)) score += 2
  if (/240hz/i.test(cardHay) && /240hz/i.test(hay)) score += 2

  return score
}

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

async function fetchLiveMeta(asin) {
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
  const image = normalizeAmazonImageUrl(
    html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
      html.match(/"large":"(https:[^"]+)"/)?.[1] ||
      html.match(/data-old-hires="(https:[^"]+)"/)?.[1] ||
      "",
  )
  cache[asin] = { asin, title, image, fetchedAt: new Date().toISOString(), source: "live" }
  index.set(asin, {
    asin,
    title,
    image,
    sources: [...(index.get(asin)?.sources ?? []), "live-fetch"],
  })
  return cache[asin]
}

async function getMeta(asin) {
  if (cache[asin]?.title && cache[asin]?.source === "live" && !REFRESH) return cache[asin]

  const fromIndex = index.get(asin)
  if (fromIndex?.title && !REFRESH) {
    return {
      asin,
      title: fromIndex.title,
      image: fromIndex.image,
      source: "index-fallback",
    }
  }

  const live = await fetchLiveMeta(asin)
  if (live.title) return live
  if (fromIndex?.title) {
    return {
      asin,
      title: fromIndex.title,
      image: fromIndex.image,
      source: "index-fallback",
    }
  }
  return live
}

/** Verified card id → ASIN overrides (Amazon reassignment / ranking drift). */
const CARD_ASIN_OVERRIDES = {
  "mon-nr2-005": "B0H28F8CWD", // VisionOwl 14" 2.5K 120Hz — B0HCND3M61 now IODATA on Amazon
  "mon-gift-004": "B0DX1BJ2R8", // IRIS 21" — B08HZ448KY is Acer Nitro VG240YS
  "mon-gift-029": "B0CNK91XLQ", // Minifire 24" USB-C — B0DG84G33D is INNOCN
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
    if (!id || !asin) continue
    blocks.push({ block, id, category, name, brand, tagline, image, asin, file })
  }
  return blocks
}

function findBestAsin(gadget, liveCache) {
  let best = null
  for (const [asin, meta] of index) {
    const title = liveCache[asin]?.title || meta.title
    if (!title) continue
    const score = scoreMatch(gadget, title)
    if (score < 7) continue
    if (!likelyMatch(gadget, title)) continue
    if (!best || score > best.score) best = { asin, title, image: liveCache[asin]?.image || meta.image, score }
  }
  return best
}

const allBlocks = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  allBlocks.push(...parseGadgetBlocks(readFileSync(join(LIB, file), "utf8"), file))
}

let targets = allBlocks
if (!ALL) {
  if (FROM_AUDIT) {
    const auditPath = join(__dirname, "gadget-title-asin-mismatches.json")
    const audit = existsSync(auditPath) ? JSON.parse(readFileSync(auditPath, "utf8")) : { mismatches: [] }
    const ids = new Set(audit.mismatches.map((m) => m.id))
    ids.add("mon-nr2-005")
    targets = targets.filter((g) => ids.has(g.id))
  }
  if (ONLY_ASIN) targets = targets.filter((g) => g.asin === ONLY_ASIN)
  if (CATEGORY) targets = targets.filter((g) => g.category === CATEGORY)
}

const uniqueAsins = [...new Set([
  ...targets.map((g) => g.asin),
  ...Object.values(CARD_ASIN_OVERRIDES),
])]
const liveCache = {}
for (const asin of uniqueAsins) {
  try {
    liveCache[asin] = await getMeta(asin)
    if (Object.keys(liveCache).length % 20 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
    }
  } catch (e) {
    console.error("fetch failed", asin, e.message)
  }
}
writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")

const fileChanges = new Map()
const fixes = []
const ok = []
const unresolved = []

for (const g of targets) {
  const meta = liveCache[g.asin]
  if (!meta?.title) {
    unresolved.push({ ...g, issue: "no-live-title" })
    continue
  }

  let nextAsin = g.asin
  let nextImage = g.image
  const titleOk = likelyMatch(g, meta.title)
  const imageOk =
    !meta.image || !g.image
      ? true
      : imageId(g.image) === imageId(meta.image) || g.image === meta.image

  if (titleOk && imageOk) {
    ok.push(g.id)
    continue
  }

  if (CARD_ASIN_OVERRIDES[g.id]) {
    nextAsin = CARD_ASIN_OVERRIDES[g.id]
    if (!liveCache[nextAsin]) {
      liveCache[nextAsin] = await getMeta(nextAsin)
    }
  } else if (!titleOk) {
    const best = findBestAsin(g, liveCache)
    if (best && best.asin !== g.asin) {
      if (!liveCache[best.asin]) {
        liveCache[best.asin] = await getMeta(best.asin)
      }
      nextAsin = best.asin
      nextImage = liveCache[best.asin]?.image || best.image || nextImage
    } else {
      unresolved.push({ ...g, amazonTitle: meta.title, issue: "title-mismatch" })
      continue
    }
  } else if (!imageOk && meta.image) {
    nextImage = meta.image
  }

  const resolvedMeta = liveCache[nextAsin] ?? meta
  if (!likelyMatch(g, resolvedMeta.title)) {
    unresolved.push({ ...g, amazonTitle: resolvedMeta.title, candidateAsin: nextAsin, issue: "still-mismatch" })
    continue
  }

  if (resolvedMeta.image) {
    const normalized = normalizeAmazonImageUrl(resolvedMeta.image)
    if (normalized) nextImage = normalized
  }

  if (nextAsin === g.asin && nextImage === g.image) continue

  let nextBlock = g.block
  if (nextAsin !== g.asin) {
    nextBlock = nextBlock.replace(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
      `purchaseUrl: "https://www.amazon.co.jp/dp/${nextAsin}"`,
    )
  }
  if (nextImage !== g.image) {
    nextBlock = nextBlock.replace(/image: "[^"]*"/, `image: "${nextImage}"`)
  }

  fixes.push({
    file: g.file,
    id: g.id,
    name: g.name,
    brand: g.brand,
    oldAsin: g.asin,
    newAsin: nextAsin,
    oldImage: g.image,
    newImage: nextImage,
    oldAmazonTitle: meta.title.slice(0, 120),
    newAmazonTitle: resolvedMeta.title.slice(0, 120),
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
  REPORT_PATH,
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      checked: targets.length,
      ok: ok.length,
      fixes: fixes.length,
      unresolved: unresolved.length,
      fixList: fixes,
      unresolvedList: unresolved,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(`${APPLY ? "Applied" : "Dry-run"}: ${fixes.length} fixes, ${ok.length} ok, ${unresolved.length} unresolved`)
for (const f of fixes) {
  console.log(`\n${f.file} ${f.id} [${f.brand}] ${f.name.slice(0, 55)}`)
  console.log(`  ASIN ${f.oldAsin} -> ${f.newAsin}`)
  console.log(`  Was: ${f.oldAmazonTitle.slice(0, 85)}`)
  console.log(`  Now: ${f.newAmazonTitle.slice(0, 85)}`)
}

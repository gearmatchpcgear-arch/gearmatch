/**
 * Align gadget name/tagline/image/purchaseUrl with live Amazon product pages.
 *
 * Strategy per card:
 *   1. Refresh live Amazon title/image for involved ASINs
 *   2. If card text already matches live page → sync image only if needed
 *   3. Else try another ASIN from metadata index whose live/cached title matches the card
 *   4. Else rewrite name/brand/tagline/image from the linked ASIN's live page
 *
 * Usage:
 *   node scripts/fix-gadget-url-description-sync.mjs
 *   node scripts/fix-gadget-url-description-sync.mjs --apply
 *   node scripts/fix-gadget-url-description-sync.mjs --apply --refresh
 *   node scripts/fix-gadget-url-description-sync.mjs --apply --category=mouse
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { extractBrand, shortProductName } from "./amazon-keyboard-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const REPORT_PATH = join(__dirname, "gadget-url-description-sync-report.json")

const APPLY = process.argv.includes("--apply")
const REFRESH = process.argv.includes("--refresh")
const FROM_AUDIT = process.argv.includes("--from-audit")
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0)

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const index = buildAsinMetaIndex()
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const CARD_ASIN_OVERRIDES = {
  "mon-nr2-005": "B0H28F8CWD",
  "mon-gift-004": "B0DX1BJ2R8",
  "mon-gift-029": "B0CNK91XLQ",
}

const BRAND_ALIASES = {
  logicool: ["logicool", "logitech", "ロジクール"],
  "logicool g": ["logicool", "logitech", "ロジクール", "blue"],
  asus: ["asus", "エイスース"],
  acer: ["acer", "エイサー"],
  "i-o data": ["i-o data", "iodata", "アイ・オー", "io data", "i-o データ"],
  "io data": ["i-o data", "iodata", "アイ・オー", "io data"],
  "iris ohayama": ["iris", "ohyama", "アイリスオーヤマ", "アイリス", "iris ohayama"],
  benq: ["benq"],
  dell: ["dell", "デル"],
  hp: ["hp", "ヒューレット"],
  lenovo: ["lenovo", "レノボ"],
  samsung: ["samsung"],
  lg: ["lg", "エルジー"],
  eizo: ["eizo", "エイゾー"],
  visionowl: ["visionowl"],
  koorui: ["koorui"],
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
  gtplayer: ["gtplayer"],
  dowinx: ["dowinx"],
  sihoo: ["sihoo"],
  leeka: ["leeka", "leekaelio"],
  pixio: ["pixio", "ピクシオ"],
  cocopar: ["cocopar"],
  iiyama: ["iiyama", "イイヤマ"],
  newsoul: ["newsoul"],
  kimoca: ["kimoca"],
  minifire: ["minifire"],
  innocent: ["innocn"],
  innocn: ["innocn"],
}

function tokens(text) {
  return (text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function cardText(g) {
  return `${g.name} ${g.tagline ?? ""}`.trim()
}

function modelTokens(text) {
  return tokens(text).filter(
    (t) =>
      /[a-z0-9]{2,}/i.test(t) &&
      !/keyboard|mouse|ワイヤレス|bluetooth|キーボード|マウス|モニター|モバイル|インチ|型|ゲーミング|monitor|portable|pc|チェア|椅子|ミキサー|インターフェース/i.test(
        t,
      ),
  )
}

function likelyMatch(g, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle.normalize("NFKC").toLowerCase()
  const title = amazonTitle.normalize("NFKC")
  const card = cardText(g).normalize("NFKC").toLowerCase()

  if (card.includes("suwira") && hay.includes("suwira")) return true
  if (card.includes("高感度 c マウス") && hay.includes("高感度 c マウス")) return true

  const cardToks = tokens(card).filter((t) => t.length >= 3)
  const amzToks = tokens(hay).filter((t) => t.length >= 3)
  if (cardToks.length >= 3 && amzToks.length >= 3) {
    const hits = cardToks.filter((t) => hay.includes(t))
    if (hits.length >= Math.min(4, Math.ceil(cardToks.length * 0.45))) return true
  }

  if (!g.brand || g.brand === "—") {
    const models = modelTokens(g.name)
    if (models.some((t) => hay.includes(t))) return true
    const nameWords = tokens(g.name).filter((t) => t.length >= 3)
    const hits = nameWords.filter((w) => hay.includes(w))
    if (hits.length >= Math.min(2, nameWords.length)) return true
    const tagWords = tokens(g.tagline).filter((t) => t.length >= 4)
    const tagHits = tagWords.filter((w) => hay.includes(w))
    return tagHits.length >= Math.min(3, tagWords.length)
  }

  const brand = g.brand.toLowerCase().replace(/[?？]/g, "")
  const aliases = BRAND_ALIASES[brand] ?? [brand]
  if (aliases.some((a) => hay.includes(a) || title.toLowerCase().includes(a))) {
    const models = modelTokens(`${g.name} ${g.tagline ?? ""}`)
    if (models.length === 0) return true
    if (models.some((t) => hay.includes(t))) return true
    const nameWords = tokens(g.name).filter((t) => t.length >= 3)
    return nameWords.filter((w) => hay.includes(w)).length >= Math.min(2, nameWords.length)
  }

  return modelTokens(`${g.name} ${g.tagline ?? ""}`).some((t) => hay.includes(t))
}

function scoreMatch(g, amazonTitle) {
  if (!amazonTitle) return 0
  let score = 0
  const hay = amazonTitle.normalize("NFKC").toLowerCase()
  const card = cardText(g).normalize("NFKC").toLowerCase()

  for (const t of tokens(card).filter((x) => x.length >= 4)) {
    if (hay.includes(t)) score += 2
  }
  for (const t of modelTokens(card)) {
    if (hay.includes(t)) score += 4
  }

  if (g.brand && g.brand !== "—") {
    const brand = g.brand.toLowerCase().replace(/[?？]/g, "")
    const aliases = BRAND_ALIASES[brand] ?? [brand]
    if (aliases.some((a) => hay.includes(a))) score += 5
  }

  if (tokens(card).some((t) => t.length >= 5 && hay.includes(t))) score += 3
  if (card.slice(0, 24) && hay.includes(card.slice(0, 24))) score += 4

  return score
}

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

function buildTagline(title) {
  const t = title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim()
  return t.length > 140 ? t.slice(0, 137) + "…" : t
}

function patchField(block, field, value) {
  const re = new RegExp(`(\\n    ${field}: )(?:\"[^\"]*\"|[^,\\n]+)(,?)`)
  if (!re.test(block)) return block
  const serialized = typeof value === "string" ? JSON.stringify(value) : String(value)
  return block.replace(re, `$1${serialized}$2`)
}

async function fetchLiveMeta(asin, attempt = 1) {
  await new Promise((r) => setTimeout(r, attempt === 1 ? 1100 : 2200))
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
  if (!title && attempt < 3) return fetchLiveMeta(asin, attempt + 1)
  cache[asin] = {
    asin,
    title,
    image,
    fetchedAt: new Date().toISOString(),
    source: "live",
  }
  return cache[asin]
}

function metaFromLocal(asin, { allowIndexFallback = true } = {}) {
  const cached = cache[asin]
  if (cached?.title) return cached
  if (cached?.source === "live" && !cached.title) {
    return { asin, title: "", image: cached.image ?? "", source: "live-empty" }
  }
  if (!allowIndexFallback) return { asin, title: "", image: cached?.image ?? "" }
  const fromIndex = index.get(asin)
  if (fromIndex?.title) {
    return {
      asin,
      title: fromIndex.title,
      image: fromIndex.image ?? cached?.image ?? "",
      source: "index",
    }
  }
  return { asin, title: "", image: cached?.image ?? "" }
}

function resolveMeta(asin, liveCache) {
  if (liveCache[asin]?.title || liveCache[asin]?.source === "live") return liveCache[asin]
  if (cache[asin]?.source === "live") return cache[asin]
  return metaFromLocal(asin)
}

async function getMeta(asin, liveCache, { allowFetch = true } = {}) {
  if (liveCache[asin]?.title) return liveCache[asin]

  const local = metaFromLocal(asin)
  if (local.title && !REFRESH) {
    liveCache[asin] = local
    return local
  }

  if (!allowFetch && !REFRESH) return local

  if (REFRESH || !local.title) {
    try {
      liveCache[asin] = await fetchLiveMeta(asin)
      if (Object.keys(liveCache).length % 25 === 0) {
        writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
      }
      return liveCache[asin]
    } catch (e) {
      console.error("fetch failed", asin, e.message)
    }
  }

  if (local.title) {
    liveCache[asin] = local
    return local
  }
  return { asin, title: "", image: "" }
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

function findBestAsin(g, liveCache, currentAsin = "") {
  const currentTitle = currentAsin ? resolveMeta(currentAsin, liveCache)?.title : ""
  const currentScore = currentTitle ? scoreMatch(g, currentTitle) : 0
  let best = null
  for (const [asin, meta] of index) {
    if (asin === currentAsin) continue
    const resolved = liveCache[asin] ?? metaFromLocal(asin)
    const title = resolved?.title
    if (!title) continue
    const score = scoreMatch(g, title)
    if (score < 12) continue
    if (score <= currentScore + 4) continue
    if (!likelyMatch(g, title)) continue
    if (g.brand && g.brand !== "—") {
      const brand = g.brand.toLowerCase().replace(/[?？]/g, "")
      const aliases = BRAND_ALIASES[brand] ?? [brand]
      if (!aliases.some((a) => title.toLowerCase().includes(a))) continue
    }
    if (!best || score > best.score) {
      best = { asin, title, image: resolved.image || meta.image, score }
    }
  }
  return best
}

function syncBlockFromAmazon(block, meta) {
  if (!meta?.title) return block
  const title = meta.title.replace(/&amp;/g, "&").replace(/&#39;/g, "'")
  let next = block
  next = patchField(next, "name", shortProductName(title))
  next = patchField(next, "brand", extractBrand(title))
  next = patchField(next, "tagline", buildTagline(title))
  if (meta.image) next = patchField(next, "image", normalizeAmazonImageUrl(meta.image))
  return next
}

const allBlocks = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  allBlocks.push(...parseGadgetBlocks(readFileSync(join(LIB, file), "utf8"), file))
}

let targets = allBlocks
if (FROM_AUDIT) {
  const auditPath = join(__dirname, "gadget-title-asin-mismatches.json")
  const audit = existsSync(auditPath) ? JSON.parse(readFileSync(auditPath, "utf8")) : { mismatches: [] }
  const ids = new Set(audit.mismatches.map((m) => m.id))
  ids.add("m-nr-021")
  targets = targets.filter((g) => ids.has(g.id))
}
if (CATEGORY) targets = targets.filter((g) => g.category === CATEGORY)
if (LIMIT > 0) targets = targets.slice(0, LIMIT)

const liveCache = { ...cache }

/** Phase 1: local-only pass to find gadgets needing live fetch or fixes */
const needsLive = new Set()
const phase1 = []

for (const g of targets) {
  const asin = CARD_ASIN_OVERRIDES[g.id] ?? g.asin
  const meta = metaFromLocal(asin)
  if (!meta.title) {
    needsLive.add(asin)
  } else if (cache[asin]?.source === "live" && cache[asin]?.title && !likelyMatch(g, cache[asin].title)) {
    needsLive.add(asin)
    const best = findBestAsin(g, liveCache, asin)
    if (best) needsLive.add(best.asin)
  } else if (cache[asin]?.source === "live" && !cache[asin]?.title) {
    needsLive.add(asin)
  } else if (!likelyMatch(g, meta.title)) {
    needsLive.add(asin)
    const best = findBestAsin(g, liveCache, asin)
    if (best) needsLive.add(best.asin)
  } else if (REFRESH) {
    needsLive.add(asin)
  }
  phase1.push({ g, asin })
}

if (REFRESH) {
  const allAsins = [...new Set(targets.map((g) => CARD_ASIN_OVERRIDES[g.id] ?? g.asin))].sort()
  console.log(`Refreshing live metadata for ${allAsins.length} ASIN(s)...`)
  for (let i = 0; i < allAsins.length; i++) {
    await getMeta(allAsins[i], liveCache, { allowFetch: true })
    if ((i + 1) % 50 === 0) process.stderr.write(`  ${i + 1}/${allAsins.length}\n`)
  }
} else if (needsLive.size > 0) {
  const asins = [...needsLive].sort()
  console.log(`Fetching live metadata for ${asins.length} mismatched/empty ASIN(s)...`)
  for (let i = 0; i < asins.length; i++) {
    await getMeta(asins[i], liveCache, { allowFetch: true })
    if ((i + 1) % 25 === 0) process.stderr.write(`  ${i + 1}/${asins.length}\n`)
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")

const fileChanges = new Map()
const fixes = []
const ok = []
const unresolved = []

for (const { g } of phase1) {
  let nextAsin = CARD_ASIN_OVERRIDES[g.id] ?? g.asin
  let meta = resolveMeta(nextAsin, liveCache)
  if (!meta?.title) {
    unresolved.push({ id: g.id, file: g.file, issue: "no-amazon-title", asin: nextAsin })
    continue
  }

  if (likelyMatch(g, meta.title)) {
    let nextBlock = g.block
    const imageOk =
      !meta.image || !g.image
        ? true
        : imageId(g.image) === imageId(meta.image) || g.image === meta.image
    if (!imageOk && meta.image) {
      nextBlock = patchField(nextBlock, "image", normalizeAmazonImageUrl(meta.image))
      fixes.push({
        id: g.id,
        file: g.file,
        action: "image-sync",
        asin: nextAsin,
        name: g.name.slice(0, 60),
      })
      if (APPLY) {
        const filePath = join(LIB, g.file)
        const current = fileChanges.get(filePath) ?? readFileSync(filePath, "utf8")
        fileChanges.set(filePath, current.replace(g.block, nextBlock))
      }
    } else {
      ok.push(g.id)
    }
    if (nextAsin !== g.asin && APPLY) {
      let nextBlock = (fileChanges.get(join(LIB, g.file)) ?? readFileSync(join(LIB, g.file), "utf8")).match(
        new RegExp(`\\{\\s*\\n\\s*id: "${g.id}"[\\s\\S]*?\\n  \\},`),
      )?.[0]
      if (nextBlock) {
        nextBlock = nextBlock.replace(
          /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
          `purchaseUrl: "https://www.amazon.co.jp/dp/${nextAsin}"`,
        )
        const filePath = join(LIB, g.file)
        const current = fileChanges.get(filePath) ?? readFileSync(filePath, "utf8")
        fileChanges.set(filePath, current.replace(g.block, nextBlock))
      }
    }
    continue
  }

  const best = findBestAsin(g, liveCache, nextAsin)
  if (best && best.asin !== nextAsin) {
    nextAsin = best.asin
    meta = resolveMeta(nextAsin, liveCache)
    if (!meta?.title) meta = await getMeta(nextAsin, liveCache, { allowFetch: true })
  }

  if (meta?.title && likelyMatch(g, meta.title)) {
    let nextBlock = g.block
    if (nextAsin !== g.asin) {
      nextBlock = nextBlock.replace(
        /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
        `purchaseUrl: "https://www.amazon.co.jp/dp/${nextAsin}"`,
      )
    }
    if (meta.image) {
      const img = normalizeAmazonImageUrl(meta.image)
      if (img && img !== g.image) nextBlock = patchField(nextBlock, "image", img)
    }
    fixes.push({
      id: g.id,
      file: g.file,
      action: "asin-fix",
      oldAsin: g.asin,
      newAsin: nextAsin,
      amazonTitle: meta.title.slice(0, 100),
    })
    if (APPLY) {
      const filePath = join(LIB, g.file)
      const current = fileChanges.get(filePath) ?? readFileSync(filePath, "utf8")
      fileChanges.set(filePath, current.replace(g.block, nextBlock))
    }
    continue
  }

  if (!meta?.title) {
    unresolved.push({ id: g.id, file: g.file, issue: "no-title-after-search", asin: nextAsin })
    continue
  }

  let nextBlock = g.block
  if (nextAsin !== g.asin) {
    nextBlock = nextBlock.replace(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
      `purchaseUrl: "https://www.amazon.co.jp/dp/${nextAsin}"`,
    )
  }
  nextBlock = syncBlockFromAmazon(nextBlock, meta)
  fixes.push({
    id: g.id,
    file: g.file,
    action: "metadata-sync",
    oldAsin: g.asin,
    newAsin: nextAsin,
    oldName: g.name.slice(0, 60),
    amazonTitle: meta.title.slice(0, 100),
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

let remaining = 0
for (const { g, asin: startAsin } of phase1) {
  const asin = CARD_ASIN_OVERRIDES[g.id] ?? startAsin
  const meta = resolveMeta(asin, liveCache)
  if (meta?.title && !likelyMatch(g, meta.title)) remaining++
}

writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      refresh: REFRESH,
      checked: targets.length,
      ok: ok.length,
      fixes: fixes.length,
      unresolved: unresolved.length,
      remainingMismatches: remaining,
      fixList: fixes,
      unresolvedList: unresolved.slice(0, 100),
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(
  `${APPLY ? "Applied" : "Dry-run"}: ${fixes.length} fix(es), ${ok.length} ok, ${unresolved.length} unresolved, ${remaining} remaining mismatches (pre-sync card text)`,
)
console.log(`Report: ${REPORT_PATH}`)
for (const f of fixes.slice(0, 40)) {
  console.log(`  ${f.action} ${f.file} ${f.id} ${f.oldAsin ? `${f.oldAsin}->${f.newAsin}` : f.asin ?? ""}`)
  if (f.amazonTitle) console.log(`    ${f.amazonTitle}`)
}

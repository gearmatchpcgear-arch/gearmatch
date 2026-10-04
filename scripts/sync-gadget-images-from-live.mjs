/**
 * Sync gadget card images to live Amazon main image for each purchaseUrl ASIN.
 * Updates scripts/asin-title-cache.json and optionally patches lib/*.ts.
 *
 * Usage:
 *   node scripts/sync-gadget-images-from-live.mjs --dry-run
 *   node scripts/sync-gadget-images-from-live.mjs --apply --category=camera
 *   node scripts/sync-gadget-images-from-live.mjs --apply --all --refresh
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { extractAmazonMainImage, isValidAmazonProductImage, normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const REPORT_PATH = join(__dirname, "sync-gadget-images-from-live-report.json")

const APPLY = process.argv.includes("--apply")
const REFRESH = process.argv.includes("--refresh")
const ALL = process.argv.includes("--all")
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]
const ONLY_ASIN = process.argv.find((a) => a.startsWith("--asin="))?.split("=")[1]

/** Card id → correct ASIN when Amazon recycled the original listing. */
const CARD_ASIN_OVERRIDES = {
  "cam-str-097-vckw": "B0BJL7Q3SR",
}

const BRAND_ALIASES = {
  logicool: ["logicool", "logitech", "ロジクール"],
  philips: ["philips", "フィリップス"],
  elecom: ["elecom", "エレコム"],
  elgato: ["elgato", "エルガト"],
  aoc: ["aoc"],
  asus: ["asus", "エイスース"],
  acer: ["acer", "エイサー"],
  lenovo: ["lenovo", "レノボ"],
  dell: ["dell", "デル"],
  insta360: ["insta360"],
  redragon: ["redragon", "レッドドラゴン"],
}

function modelTokens(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        !/keyboard|mouse|webカメラ|webcam|カメラ|camera|4k|1080p|720p|2k|uhd|hd/i.test(t),
    )
}

function titlePlausibleForGadget(gadget, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle.replace(/&amp;/g, "&").toLowerCase()
  const cardHay = `${gadget.name} ${gadget.tagline ?? ""}`.toLowerCase()

  if (gadget.brand && gadget.brand !== "—") {
    const brand = gadget.brand.toLowerCase()
    const aliases = BRAND_ALIASES[brand] ?? [brand]
    if (!aliases.some((a) => hay.includes(a))) return false
  } else if (/redragon|レッドドラゴン/i.test(cardHay)) {
    if (!/redragon|レッドドラゴン/i.test(hay)) return false
  }

  const models = modelTokens(gadget.name)
  if (models.length === 0) return true
  return models.some((t) => hay.includes(t))
}

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function imageId(url) {
  return url?.match(/\/I\/([^._]+)/)?.[1] ?? null
}

async function fetchLiveMeta(asin) {
  await new Promise((r) => setTimeout(r, 1100))
  const previous = cache[asin]
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) =>
    r.text(),
  )
  const title =
    html
      .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  const extracted = extractAmazonMainImage(html)
  const image =
    extracted ||
    (previous?.image && isValidAmazonProductImage(previous.image)
      ? normalizeAmazonImageUrl(previous.image)
      : "")

  if (image || title) {
    cache[asin] = {
      asin,
      title: title || previous?.title || "",
      image,
      fetchedAt: new Date().toISOString(),
      source: image || title ? "live" : previous?.source ?? "live",
    }
  } else if (previous?.image && isValidAmazonProductImage(previous.image)) {
    return previous
  }

  return cache[asin] ?? previous ?? { asin, title: "", image: "", source: "live" }
}

async function getMeta(asin) {
  if (!REFRESH && cache[asin]?.image && cache[asin]?.source === "live") return cache[asin]
  if (!REFRESH && cache[asin]?.image) return cache[asin]
  return fetchLiveMeta(asin)
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
    const image = block.match(/\bimage: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!id || !asin) continue
    blocks.push({ block, id, category, name, brand, image, asin, file })
  }
  return blocks
}

const allBlocks = []
for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  allBlocks.push(...parseGadgetBlocks(readFileSync(join(LIB, file), "utf8"), file))
}

let targets = allBlocks
if (!ALL && CATEGORY) targets = targets.filter((g) => g.category === CATEGORY)
if (ONLY_ASIN) targets = targets.filter((g) => g.asin === ONLY_ASIN)

const uniqueAsins = [
  ...new Set([...targets.map((g) => g.asin), ...Object.values(CARD_ASIN_OVERRIDES)]),
]
const liveCache = {}
for (let i = 0; i < uniqueAsins.length; i++) {
  const asin = uniqueAsins[i]
  try {
    liveCache[asin] = await getMeta(asin)
    if ((i + 1) % 25 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
      process.stdout.write(`Fetched ${i + 1}/${uniqueAsins.length}\n`)
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
  const lookupAsin = CARD_ASIN_OVERRIDES[g.id] ?? g.asin
  const meta = liveCache[lookupAsin] ?? liveCache[g.asin]
  if (!meta?.image) {
    unresolved.push({ ...g, issue: "no-live-image", lookupAsin })
    continue
  }

  const usesOverrideAsin = lookupAsin !== g.asin
  if (usesOverrideAsin && meta.title && !titlePlausibleForGadget(g, meta.title)) {
    unresolved.push({
      ...g,
      issue: "title-mismatch",
      lookupAsin,
      amazonTitle: meta.title.slice(0, 120),
    })
    continue
  }

  const normalized = normalizeAmazonImageUrl(meta.image)
  const currentValid = isValidAmazonProductImage(g.image)
  const imageOk =
    currentValid &&
    (imageId(g.image) === imageId(normalized) || g.image === normalized)

  if (imageOk) {
    ok.push(g.id)
    continue
  }

  let nextBlock = g.block.replace(/image: "[^"]*"/, `image: "${normalized}"`)
  const overrideAsin = CARD_ASIN_OVERRIDES[g.id]
  if (overrideAsin && overrideAsin !== g.asin) {
    nextBlock = nextBlock.replace(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"/,
      `purchaseUrl: "https://www.amazon.co.jp/dp/${overrideAsin}"`,
    )
  }

  fixes.push({
    file: g.file,
    id: g.id,
    name: g.name,
    brand: g.brand,
    asin: g.asin,
    lookupAsin: overrideAsin ?? g.asin,
    oldImage: g.image,
    newImage: normalized,
    amazonTitle: meta.title?.slice(0, 120) ?? "",
    oldImageId: imageId(g.image),
    newImageId: imageId(normalized),
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
      unresolvedList: unresolved.slice(0, 200),
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(
  `${APPLY ? "Applied" : "Dry-run"}: ${fixes.length} image fixes, ${ok.length} ok, ${unresolved.length} unresolved`,
)
for (const f of fixes.slice(0, 30)) {
  console.log(`${f.file} ${f.id} ${f.oldImageId} -> ${f.newImageId} (${f.asin})`)
}
if (fixes.length > 30) console.log(`... and ${fixes.length - 30} more`)

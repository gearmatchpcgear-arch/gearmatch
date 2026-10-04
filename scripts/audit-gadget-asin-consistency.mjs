/**
 * Audit gadget cards: name/brand vs Amazon product title for each ASIN.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const refresh = process.argv.includes("--refresh")

function extractGadgets(src, file) {
  const gadgets = []
  const blockRe =
    /\{\s*\n\s*id: "([^"]+)"[\s\S]*?category: "([^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?price: ([^,\n]+)[\s\S]*?image: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    gadgets.push({
      id: m[1],
      category: m[2],
      name: m[3],
      brand: m[4],
      price: m[5].trim(),
      image: m[6],
      asin: m[7],
      file,
    })
  }
  return gadgets
}

const all = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  all.push(...extractGadgets(readFileSync(join(ROOT, "lib", file), "utf8"), file))
}

const byAsin = new Map()
for (const g of all) {
  if (!byAsin.has(g.asin)) byAsin.set(g.asin, [])
  byAsin.get(g.asin).push(g)
}

function tokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function modelTokens(name) {
  return tokens(name).filter((t) => /[a-z0-9]{3,}/i.test(t) && !/keyboard|mouse|ワイヤレス|bluetooth|キーボード|マウス/i.test(t))
}

function likelyMatch(gadget, amazonTitle) {
  const hay = amazonTitle.toLowerCase()
  const title = amazonTitle

  if (/^—$/.test(gadget.brand)) {
    const models = modelTokens(gadget.name)
    if (models.some((t) => hay.includes(t.toLowerCase()))) return true
    const nameWords = tokens(gadget.name).filter((t) => t.length >= 3)
    const hits = nameWords.filter((w) => hay.includes(w))
    if (hits.length >= Math.min(2, nameWords.length)) return true
    return false
  }

  const brand = gadget.brand.toLowerCase()
  const brandAliases = {
    logicool: ["logicool", "logitech", "ロジクール"],
    logitech: ["logicool", "logitech", "ロジクール"],
    elecom: ["elecom", "エレコム"],
    asus: ["asus", "エイスース"],
    pfu: ["pfu", "hhkb"],
    realforce: ["realforce", "リアルフォース"],
    ewin: ["ewin", "ewinwotoko"],
    perixx: ["perixx", "ペリックス"],
    arteck: ["arteck"],
    iclever: ["iclever"],
    nillkin: ["nillkin"],
    omikamo: ["omikamo"],
    dell: ["dell"],
    hp: ["hp"],
    buffalo: ["buffalo", "バッファロー"],
    amazon: ["amazon", "amazonbasics", "ベーシック"],
    actionring: ["actionring"],
  }

  const aliases = brandAliases[brand] ?? [brand]
  if (aliases.some((a) => hay.includes(a) || title.includes(gadget.brand))) return true

  const models = modelTokens(gadget.name)
  if (models.some((t) => hay.includes(t.toLowerCase()))) return true

  return false
}

async function fetchMeta(asin) {
  if (cache[asin]?.title && !refresh) return cache[asin]
  await new Promise((r) => setTimeout(r, 1200))
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) =>
    r.text(),
  )
  const title =
    html
      .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ?? ""
  const image =
    html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
    html.match(/"large":"(https:[^"]+)"/)?.[1] ||
    ""
  const priceMatch =
    html.match(/"priceAmount":([0-9.]+)/)?.[1] ||
    html.match(/class="a-price-whole">([0-9,]+)/)?.[1]?.replace(/,/g, "")
  cache[asin] = {
    asin,
    title,
    image,
    price: priceMatch ? Number(priceMatch) : null,
    fetchedAt: new Date().toISOString(),
  }
  return cache[asin]
}

const categoryFilter = process.argv.find((a) => a.startsWith("--category="))?.slice(11)
const asins = [...byAsin.keys()].sort()
const mismatches = []
const imageMismatches = []

for (let i = 0; i < asins.length; i++) {
  const asin = asins[i]
  const gadgets = byAsin.get(asin)
  if (categoryFilter && !gadgets.some((g) => g.category === categoryFilter)) continue

  let meta
  try {
    meta = await fetchMeta(asin)
  } catch (e) {
    console.error("fetch failed", asin, e.message)
    continue
  }
  if (!meta.title) continue

  for (const g of gadgets) {
    if (!likelyMatch(g, meta.title)) {
      mismatches.push({ ...g, amazonTitle: meta.title, amazonImage: meta.image, amazonPrice: meta.price })
    }
    const imgId = g.image.match(/\/I\/([^._]+)/)?.[1]
    const amzImgId = meta.image.match(/\/I\/([^._]+)/)?.[1]
    if (imgId && amzImgId && imgId !== amzImgId) {
      imageMismatches.push({ ...g, amazonImage: meta.image, imgId, amzImgId, amazonTitle: meta.title })
    }
  }

  if ((i + 1) % 20 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
    process.stderr.write(`Progress ${i + 1}/${asins.length}\n`)
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")

console.log(`Checked ${asins.length} ASINs, ${all.length} gadget entries`)
console.log(`Title/brand mismatches: ${mismatches.length}`)
for (const m of mismatches) {
  console.log(`\n[${m.category}] ${m.id} ASIN=${m.asin} file=${m.file}`)
  console.log(`  Card: [${m.brand}] ${m.name} ¥${m.price}`)
  console.log(`  Amazon: ${m.amazonTitle.slice(0, 120)}`)
  if (m.amazonPrice) console.log(`  Amazon price: ¥${m.amazonPrice}`)
}

console.log(`\nImage ID mismatches: ${imageMismatches.length}`)
for (const m of imageMismatches.slice(0, 30)) {
  if (mismatches.some((x) => x.asin === m.asin && x.id === m.id)) continue
  console.log(`\n${m.id} ASIN=${m.asin} card=${m.imgId} amazon=${m.amzImgId}`)
}

/**
 * Audit + fix gadget purchaseUrl/image vs title/brand using raw JSON + cache metadata.
 *
 * Usage:
 *   node scripts/fix-gadget-link-image-integrity.mjs --dry-run
 *   node scripts/fix-gadget-link-image-integrity.mjs --apply
 *   node scripts/fix-gadget-link-image-integrity.mjs --apply --category=monitor
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const REPORT_PATH = join(__dirname, "gadget-link-image-fix-report.json")

const APPLY = process.argv.includes("--apply")
const DRY = !APPLY || process.argv.includes("--dry-run")
const CATEGORY = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1]

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
  perixx: ["perixx"],
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
  minifire: ["minifire"],
  livElect: ["livelect"],
  livelect: ["livelect"],
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
      !/keyboard|mouse|ワイヤレス|bluetooth|キーボード|マウス|モニター|モバイル|インチ|型|ゲーミング|monitor|portable|pc/i.test(
        t,
      ),
  )
}

function likelyMatch(gadget, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle.toLowerCase()
  const title = amazonTitle

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

  const models = modelTokens(gadget.name)
  if (models.some((t) => hay.includes(t.toLowerCase()))) return true

  return false
}

function scoreMatch(gadget, amazonTitle) {
  if (!amazonTitle) return 0
  let score = 0
  const hay = amazonTitle.toLowerCase()

  if (gadget.brand && gadget.brand !== "—") {
    const aliases = BRAND_ALIASES[gadget.brand.toLowerCase()] ?? [gadget.brand.toLowerCase()]
    if (aliases.some((a) => hay.includes(a))) score += 4
  }

  for (const t of modelTokens(gadget.name)) {
    if (hay.includes(t.toLowerCase())) score += 3
  }

  for (const t of tokens(gadget.name).filter((x) => x.length >= 4)) {
    if (hay.includes(t)) score += 1
  }

  if (hay.includes(gadget.name.toLowerCase().slice(0, Math.min(20, gadget.name.length)))) score += 2

  return score
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
    const image = block.match(/\bimage: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!id || !asin) continue
    blocks.push({ block, id, category, name, brand, image, asin, file })
  }
  return blocks
}

function findBestAsin(gadget, index) {
  let best = null
  for (const [asin, meta] of index) {
    if (!meta.title) continue
    const score = scoreMatch(gadget, meta.title)
    if (score < 5) continue
    if (!best || score > best.score) best = { asin, meta, score }
  }
  return best
}

const index = buildAsinMetaIndex()
const fileChanges = new Map()
const fixes = []
const unresolved = []

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const filePath = join(LIB, file)
  let src = readFileSync(filePath, "utf8")
  const blocks = parseGadgetBlocks(src, file)

  for (const g of blocks) {
    if (CATEGORY && g.category !== CATEGORY) continue
    const meta = index.get(g.asin)
    const amazonTitle = meta?.title ?? ""
    const amazonImage = meta?.image ? normalizeAmazonImageUrl(meta.image) : ""

    const titleOk = amazonTitle ? likelyMatch(g, amazonTitle) : null
    const imageOk =
      !amazonImage || !g.image
        ? null
        : imageId(g.image) === imageId(amazonImage) || g.image === amazonImage

    if (titleOk !== false && imageOk !== false) continue

    let nextAsin = g.asin
    let nextImage = g.image
    let reason = []

    if (titleOk === false) {
      const best = findBestAsin(g, index)
      if (best && best.asin !== g.asin) {
        nextAsin = best.asin
        nextImage = best.meta.image || nextImage
        reason.push(`asin ${g.asin} -> ${nextAsin} (score ${best.score})`)
      } else {
        unresolved.push({
          ...g,
          amazonTitle,
          issue: "title-mismatch-no-asin",
        })
        continue
      }
    }

    const nextMeta = index.get(nextAsin)
    const resolvedTitle = nextMeta?.title ?? amazonTitle
    if (resolvedTitle && !likelyMatch(g, resolvedTitle)) {
      unresolved.push({
        ...g,
        amazonTitle: resolvedTitle,
        candidateAsin: nextAsin,
        issue: "still-unmatched-after-search",
      })
      continue
    }

    if (nextMeta?.image) {
      const normalized = normalizeAmazonImageUrl(nextMeta.image)
      if (normalized && normalized !== g.image) {
        nextImage = normalized
        reason.push("image synced")
      }
    }

    if (nextAsin === g.asin && nextImage === g.image) {
      if (titleOk === false) {
        unresolved.push({ ...g, amazonTitle, issue: "title-mismatch-unchanged" })
      }
      continue
    }

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
      file,
      id: g.id,
      name: g.name,
      brand: g.brand,
      oldAsin: g.asin,
      newAsin: nextAsin,
      oldImage: g.image,
      newImage: nextImage,
      amazonTitle: resolvedTitle?.slice(0, 120),
      reason: reason.join("; "),
    })

    src = src.replace(g.block, nextBlock)
    fileChanges.set(filePath, src)
  }
}

writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
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

if (APPLY) {
  for (const [filePath, content] of fileChanges) {
    writeFileSync(filePath, content)
  }
}

console.log(`${APPLY ? "Applied" : "Dry-run"}: ${fixes.length} fix(es), ${unresolved.length} unresolved`)
console.log(`Report: ${REPORT_PATH}`)
for (const f of fixes.slice(0, 40)) {
  console.log(`\n${f.file} ${f.id} [${f.brand}] ${f.name.slice(0, 60)}`)
  console.log(`  ASIN: ${f.oldAsin} -> ${f.newAsin}`)
  if (f.oldImage !== f.newImage) console.log(`  image updated`)
  console.log(`  Amazon: ${f.amazonTitle?.slice(0, 90)}`)
}

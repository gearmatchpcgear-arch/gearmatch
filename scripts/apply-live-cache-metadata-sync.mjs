/**
 * Sync gadget cards from non-empty live entries in asin-title-cache.json.
 * Usage: node scripts/apply-live-cache-metadata-sync.mjs [--apply]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { extractBrand, shortProductName } from "./amazon-keyboard-specs.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const APPLY = process.argv.includes("--apply")

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

function tokens(text) {
  return (text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function likelyMatch(g, amazonTitle) {
  if (!amazonTitle) return false
  const hay = amazonTitle.normalize("NFKC").toLowerCase()
  const card = `${g.name} ${g.tagline ?? ""}`.normalize("NFKC").toLowerCase()
  const cardToks = tokens(card).filter((t) => t.length >= 3)
  const hits = cardToks.filter((t) => hay.includes(t))
  if (hits.length >= Math.min(4, Math.ceil(cardToks.length * 0.4))) return true
  if (card.slice(0, 20) && hay.includes(card.slice(0, 20))) return true
  return false
}

function patchField(block, field, value) {
  const re = new RegExp(`(\\n    ${field}: )(?:\"[^\"]*\"|[^,\\n]+)(,?)`)
  if (!re.test(block)) return block
  return block.replace(re, `$1${JSON.stringify(value)}$2`)
}

function buildTagline(title) {
  const t = title.trim()
  return t.length > 140 ? t.slice(0, 137) + "…" : t
}

function syncBlock(block, meta) {
  const title = meta.title.replace(/&amp;/g, "&")
  let next = block
  next = patchField(next, "name", shortProductName(title))
  next = patchField(next, "brand", extractBrand(title))
  next = patchField(next, "tagline", buildTagline(title))
  if (meta.image) next = patchField(next, "image", normalizeAmazonImageUrl(meta.image))
  return next
}

const blockRe = /(\{\s*\n\s*id: "([^"]+)"[\s\S]*?\n  \},)/g
const fileChanges = new Map()
const fixes = []

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const filePath = join(LIB, file)
  let src = readFileSync(filePath, "utf8")
  let changed = false
  blockRe.lastIndex = 0
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[1]
    const id = m[2]
    const name = block.match(/\bname: "([^"]*)"/)?.[1] ?? ""
    const tagline = block.match(/\btagline: "([^"]*)"/)?.[1] ?? ""
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!asin) continue
    const meta = cache[asin]
    if (!meta?.title) continue
    const g = { id, name, tagline }
    if (likelyMatch(g, meta.title)) continue
    const nextBlock = syncBlock(block, meta)
    if (nextBlock === block) continue
    fixes.push({ id, file, asin, amazonTitle: meta.title.slice(0, 90) })
    src = src.replace(block, nextBlock)
    changed = true
  }
  if (changed) fileChanges.set(filePath, src)
}

if (APPLY) {
  for (const [filePath, content] of fileChanges) writeFileSync(filePath, content)
}

console.log(`${APPLY ? "Applied" : "Dry-run"}: ${fixes.length} metadata sync(s)`)
for (const f of fixes.slice(0, 30)) {
  console.log(`  ${f.file} ${f.id} ${f.asin}`)
  console.log(`    ${f.amazonTitle}`)
}

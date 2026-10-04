/**
 * Scan lib/*.ts gadget sources for purchaseUrl / product name mismatches.
 * Uses Amazon spec caches when available.
 */
import { readFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isKeyboardAccessoryTitle } from "./keyboard-accessory.mjs"
import {
  BLOCKED_GADGET_ASINS,
  isBlockedGadgetAsin,
  isExcludedByAmazonSpecTitle,
  amazonTitleFromSpecCache,
} from "./gadget-asin-blocklist.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")

const ACCESSORY_TITLE_RE =
  /キーホルダー|キーリング|keychain|フィジットトイ|fidget toy|補強プレート|取付用プレート|交換用.*ノート|repair replacement|修理交換用|replacement keyboard|キーキャップのみ|keycap only|引抜器|switch puller|key puller|工具キット|lube kit|潤滑剤|キーキャップセット|keycap set|スイッチ.*セット|switch pack|延長アーム|増設アーム|VESA.*プレート|magic arm|マジックアーム|ラップトップ.*トレイ|laptop tray/i

const SKIP_FILES = new Set([
  "gadgets.ts",
  "gadget-filters.ts",
  "gadget-images.ts",
  "monitor-detail-specs.ts",
  "monitor-arm-filter-tags.ts",
  "monitor-filter-tags.ts",
  "keyboard-filter-tags.ts",
  "keyboard-use-tags.ts",
  "mic-filter-tags.ts",
  "mic-feature-tags.ts",
  "mic-use-tags.ts",
  "mouse-filter-tags.ts",
  "mic-accessory-filter.ts",
])

function loadSpecCaches() {
  const cache = {}
  for (const name of readdirSync(join(__dirname))) {
    if (!name.endsWith("-specs-cache.json") && name !== "keyboard-specs-cache.json") continue
    Object.assign(cache, JSON.parse(readFileSync(join(__dirname, name), "utf8")))
  }
  return cache
}

function parseGadgetsFromFile(filePath, fileName) {
  const txt = readFileSync(filePath, "utf8")
  const blocks = txt.split(/\{\s*\n\s*id:/).slice(1)
  const gadgets = []
  for (const block of blocks) {
    const id = block.match(/^ "([^"]+)"/)?.[1]
    const name = block.match(/name:\s*"([^"]+)"/)?.[1]
    const asin = block.match(
      /purchaseUrl:\s*"https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/,
    )?.[1]
    const category = block.match(/category:\s*"([^"]+)"/)?.[1]
    const weight = block.match(/label: "重量", value: "([^"]+)"/)?.[1]
    if (id && name && asin) {
      gadgets.push({ file: fileName, id, name, asin, category, weight })
    }
  }
  return gadgets
}

function parseWeightGrams(weight) {
  if (!weight || weight === "—") return null
  const m = String(weight).match(/([\d.]+)\s*(?:グラム|g)/i)
  return m ? Number(m[1]) : null
}

function amazonTitleForAsin(cache, asin) {
  return amazonTitleFromSpecCache(cache, asin)
}

function isAccessoryAmazonTitle(title) {
  if (!title) return false
  if (isKeyboardAccessoryTitle(title)) return true
  return ACCESSORY_TITLE_RE.test(title)
}

function normalizeForCompare(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\s　|｜\-–—_【】\[\]()（）]/g, "")
    .replace(/amazon\.co\.jp.*$/i, "")
}

function titleMismatchScore(cardName, amazonTitle) {
  const a = normalizeForCompare(cardName)
  const b = normalizeForCompare(amazonTitle)
  if (!a || !b) return 0
  if (a.includes(b.slice(0, Math.min(20, b.length))) || b.includes(a.slice(0, Math.min(20, a.length)))) {
    return 0
  }
  const aTokens = [...new Set(a.match(/[a-z0-9\u3040-\u9fff]{2,}/gi) ?? [])]
  const bTokens = new Set(b.match(/[a-z0-9\u3040-\u9fff]{2,}/gi) ?? [])
  if (aTokens.length === 0 || bTokens.size === 0) return 0.5
  const overlap = aTokens.filter((t) => bTokens.has(t)).length
  return 1 - overlap / aTokens.length
}

const specCache = loadSpecCaches()
const allGadgets = []
for (const file of readdirSync(LIB)) {
  if (!file.endsWith(".ts") || SKIP_FILES.has(file)) continue
  if (!readFileSync(join(LIB, file), "utf8").includes("purchaseUrl:")) continue
  allGadgets.push(...parseGadgetsFromFile(join(LIB, file), file))
}

const issues = []
const byAsin = new Map()
for (const g of allGadgets) {
  if (!byAsin.has(g.asin)) byAsin.set(g.asin, [])
  byAsin.get(g.asin).push(g)
}

for (const g of allGadgets) {
  if (isBlockedGadgetAsin(g.asin)) {
    issues.push({ type: "blocked-asin", ...g })
  }

  const amazonTitle = amazonTitleForAsin(specCache, g.asin)
  if (amazonTitle && isAccessoryAmazonTitle(amazonTitle)) {
    issues.push({
      type: "accessory-url",
      ...g,
      amazonTitle,
    })
  }

  if (amazonTitle) {
    const score = titleMismatchScore(g.name, amazonTitle)
    if (score >= 0.75) {
      issues.push({
        type: "title-mismatch",
        score,
        ...g,
        amazonTitle,
      })
    }
  }

  const grams = parseWeightGrams(g.weight)
  if (g.category === "keyboard" && grams != null && grams < 100) {
    issues.push({
      type: "implausible-weight",
      ...g,
      amazonTitle,
      grams,
    })
  }
}

for (const [asin, items] of byAsin) {
  const names = new Set(items.map((i) => i.name))
  if (items.length > 1 && names.size > 1) {
    issues.push({
      type: "duplicate-asin",
      asin,
      items: items.map(({ file, id, name }) => ({ file, id, name })),
    })
  }
}

const unique = new Map()
for (const issue of issues) {
  const key = `${issue.type}:${issue.asin ?? ""}:${issue.id ?? ""}`
  unique.set(key, issue)
}

const sorted = [...unique.values()].sort((a, b) => {
  const ta = a.type.localeCompare(b.type)
  return ta !== 0 ? ta : (a.asin ?? "").localeCompare(b.asin ?? "")
})

console.log(`Scanned ${allGadgets.length} gadgets across lib/*.ts`)
console.log(`Spec cache ASINs: ${Object.keys(specCache).length}`)
console.log(`Issues found: ${sorted.length}\n`)

for (const issue of sorted) {
  if (issue.type === "duplicate-asin") {
    console.log(`[duplicate-asin] ${issue.asin}`)
    for (const item of issue.items) {
      console.log(`  ${item.file} ${item.id} ${item.name}`)
    }
    continue
  }
  console.log(
    `[${issue.type}] ${issue.file} ${issue.id} ${issue.asin} ${JSON.stringify(issue.name)}`,
  )
  if (issue.amazonTitle) console.log(`  Amazon: ${issue.amazonTitle}`)
  if (issue.grams != null) console.log(`  Weight: ${issue.grams}g`)
  if (issue.score != null) console.log(`  Mismatch score: ${issue.score.toFixed(2)}`)
}

process.exit(sorted.length > 0 ? 1 : 0)

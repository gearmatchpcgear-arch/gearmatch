/**
 * Remove accessory ASINs and sync mismatched keyboard cards with asin-title-cache.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isKeyboardAccessoryTitle } from "./keyboard-accessory.mjs"
import { extractBrand, shortProductName } from "./amazon-keyboard-specs.mjs"
import {
  BLOCKED_GADGET_ASINS,
  isExcludedByAmazonSpecTitle,
} from "./gadget-asin-blocklist.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const cache = JSON.parse(readFileSync(join(ROOT, "scripts", "asin-title-cache.json"), "utf8"))
const keyboardSpecCache = {
  ...JSON.parse(readFileSync(join(ROOT, "scripts", "keyboard-specs-cache.json"), "utf8")),
}

/** ASINs that must be removed (not keyboard bodies). */
const REMOVE_ASINS = BLOCKED_GADGET_ASINS

const BRAND_OVERRIDES = {
  B081JSVYHQ: "Ewin",
  B0DK5GRBFY: "Ewin",
  B097BW662Y: "Turtle Beach",
  B09K6YGV93: "Mobo",
  B0BC8N9XHY: "Merdia",
  B0G39189M1: "KizunaAI",
  B0GGB26MRZ: "WOBKEY",
  B0GL8558SZ: "EPOMAKER",
}

function patchField(block, field, value) {
  const re = new RegExp(`(\\n    ${field}: )(?:\"[^\"]*\"|[^,\\n]+)(,?)`)
  if (!re.test(block)) return block
  const serialized =
    typeof value === "string" ? JSON.stringify(value) : String(value)
  return block.replace(re, `$1${serialized}$2`)
}

function syncBlockFromCache(block, asin) {
  const meta = cache[asin]
  if (!meta?.title) return block

  if (isKeyboardAccessoryTitle(meta.title)) return null

  let next = block
  const brand = BRAND_OVERRIDES[asin] ?? extractBrand(meta.title)
  const name = shortProductName(meta.title)
  const tagline =
    meta.title.length > 140 ? meta.title.slice(0, 137) + "…" : meta.title

  next = patchField(next, "name", name)
  next = patchField(next, "brand", brand)
  next = patchField(next, "tagline", tagline)
  if (meta.price != null) next = patchField(next, "price", meta.price)
  if (meta.image) next = patchField(next, "image", meta.image)
  return next
}

function processGadgetFile(filePath) {
  let src = readFileSync(filePath, "utf8")
  const match = src.match(/^([\s\S]*?export const \w+: Gadget\[\] = \[)([\s\S]*?)(\n\]\n?)$/)
  if (!match) return { removed: 0, updated: 0 }

  const [, head, body, tail] = match
  const chunks = body.split(/\n  \},\n/).map((chunk, i, arr) =>
    i < arr.length - 1 ? chunk + "\n  }," : chunk,
  )

  let removed = 0
  let updated = 0
  const kept = []

  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const asin = chunk.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!asin) {
      kept.push(chunk)
      continue
    }

    if (REMOVE_ASINS.has(asin) || isExcludedByAmazonSpecTitle(asin, keyboardSpecCache)) {
      removed++
      continue
    }

    const meta = cache[asin]
    if (meta?.title) {
      const synced = syncBlockFromCache(chunk, asin)
      if (synced === null) {
        removed++
        continue
      }
      if (synced !== chunk) updated++
      kept.push(synced)
      continue
    }

    kept.push(chunk)
  }

  if (removed || updated) {
    writeFileSync(filePath, head + kept.join("\n") + tail)
  }
  return { removed, updated }
}

let totalRemoved = 0
let totalUpdated = 0
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\//.test(src)) continue
  const { removed, updated } = processGadgetFile(path)
  if (removed || updated) {
    console.log(`${file}: removed=${removed} updated=${updated}`)
    totalRemoved += removed
    totalUpdated += updated
  }
}

console.log(`Done. removed=${totalRemoved} updated=${totalUpdated}`)

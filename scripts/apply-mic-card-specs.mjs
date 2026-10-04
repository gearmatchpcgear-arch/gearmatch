/**
 * Apply mic-card-specs-known (+ optional cache) → lib mic highlights/specGroups
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { getMicCardSpecsForAsin } from "./amazon-mic-card-specs.mjs"
import { MIC_CARD_SPECS_KNOWN, DASH } from "./mic-card-specs-known.mjs"
import {
  isVerifiedMicFrequency,
  isVerifiedMicSampleRate,
} from "./mic-verified-audio-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mic-card-specs-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const FIELDS = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

function getHighlightValue(block, label) {
  const m = block.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
  return m?.[1]
}

function getSpecs(asin, block) {
  const fromKnown = getMicCardSpecsForAsin(asin, null, FIELDS)
  const fromCache = cache[asin]?.specs ?? {}
  const merged = { ...fromCache, ...fromKnown }

  const out = {}
  for (const field of FIELDS) {
    const current = getHighlightValue(block, field)
    const next = merged[field]
    if (!next) continue

    const forceKnown = MIC_CARD_SPECS_KNOWN[asin]?.[field] !== undefined
    const isEmpty = !current || current === DASH || current === "-"

    if (!forceKnown && !isEmpty) continue
    const candidate = next.highlight ?? next
    if (field === "周波数特性" && !isVerifiedMicFrequency(asin, candidate)) {
      continue
    }
    if (field === "サンプルレート" && !isVerifiedMicSampleRate(asin, candidate)) {
      continue
    }

    if (forceKnown || isEmpty) {
      out[field] = next
    }
  }
  return out
}

function replaceHighlightField(block, label, value) {
  const re = new RegExp(`(\\{ label: "${label}", value: ")[^"]*(" \\})`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}$2`)
  return { block: next, changed: next !== block }
}

function updateBlock(block, asin) {
  const specs = getSpecs(asin, block)
  if (!Object.keys(specs).length) return { block, changed: false }

  let next = block
  let changed = false
  for (const [label, data] of Object.entries(specs)) {
    const r1 = replaceHighlightField(next, label, data.highlight)
    next = r1.block
    if (r1.changed) changed = true

    const specStart = next.indexOf("specGroups:")
    if (specStart !== -1) {
      const specPart = next.slice(specStart)
      const re = new RegExp(`(\\{ label: "${label}", value: ")[^"]*(" \\})`, "g")
      const newSpec = specPart.replace(re, `$1${data.spec}$2`)
      if (newSpec !== specPart) {
        next = next.slice(0, specStart) + newSpec
        changed = true
      }
    }
  }
  return { block: next, changed }
}

function applyToSource(src) {
  let updated = 0
  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  const out = src.replace(blockRe, (block, asin) => {
    if (!MIC_CARD_SPECS_KNOWN[asin] && !cache[asin]) {
      // still try amazon-known frequency for empty fields
      if (!FIELDS.some((f) => getHighlightValue(block, f) === DASH)) return block
    }
    const { block: next, changed } = updateBlock(block, asin)
    if (changed) updated++
    return next
  })
  return { src: out, updated }
}

let total = 0
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue
  const { src: next, updated } = applyToSource(src)
  if (updated > 0) {
    writeFileSync(path, next)
    console.log(`${file}: ${updated} blocks`)
    total += updated
  }
}

console.log(`Total: ${total}`)

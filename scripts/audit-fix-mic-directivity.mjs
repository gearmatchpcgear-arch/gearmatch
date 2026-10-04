/**
 * Fix mic directivity from known overrides, cache re-parse, and title inference.
 * Targets wrong ライン+ガン (オンライン false positive), pin/omni mismatches, and missing values.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMicCardSpecs } from "./amazon-mic-card-specs.mjs"
import { MIC_CARD_SPECS_KNOWN, DASH, toSpecFormat } from "./mic-card-specs-known.mjs"
import { inferPolarFromText } from "./spec-value-sanitize.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const CACHE_PATH = join(dirname(fileURLToPath(import.meta.url)), "mic-card-specs-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

function getTitleHaystack(block) {
  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  return `${name} ${tagline}`
}

function isShotgunMic(hay) {
  return /ショットガン|shotgun|ガンマイク|AT875|NTG-|VMM|deity.*shot/i.test(hay)
}

function isPinMic(block, hay) {
  const tags = block.match(/micFilterTags: \[([^\]]*)\]/)?.[1] ?? ""
  return /"pin"/.test(tags) || /ピン|ラベリア|clip|lavali/i.test(hay)
}

function resolveDirectivity(asin, block) {
  const hay = getTitleHaystack(block)
  const known = MIC_CARD_SPECS_KNOWN[asin]?.["指向性"]
  if (known) return known

  const html = cache[asin]?.html
  if (html) {
    const fromAmazon = parseAmazonMicCardSpecs(html)["指向性"]
    if (fromAmazon) return fromAmazon
  }

  const fromTitle = inferPolarFromText(hay)
  if (fromTitle) return fromTitle

  if (isPinMic(block, hay) && /全指向|無指向|360|omni/i.test(hay)) {
    return /360/.test(hay) ? "全指向性 (360°)" : "全指向性"
  }

  return null
}

function shouldFixDirectivity(current, next, block, hay, asin) {
  if (!next || next === current) return false
  if (!current || current === DASH || current === "-") return true

  if (/ライン\+ガン/.test(current) && !isShotgunMic(hay)) return true

  if (isPinMic(block, hay) && /全指向|無指向|360|omni/i.test(hay) && /単一指向|超単一/i.test(current)) {
    return true
  }

  if (MIC_CARD_SPECS_KNOWN[asin]?.["指向性"]) return true

  return false
}

function replaceField(block, label, value) {
  const re = new RegExp(`(\\{ label: "${label}", value: ")[^"]*(" \\})`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}$2`)
  return { block: next, changed: next !== block }
}

function updateBlock(block, asin) {
  const hay = getTitleHaystack(block)
  const current = block.match(/label: "指向性", value: "([^"]*)"/)?.[1] ?? ""
  const next = resolveDirectivity(asin, block)
  if (!shouldFixDirectivity(current, next, block, hay, asin)) {
    return { block, changed: false }
  }

  let out = block
  const r1 = replaceField(out, "指向性", next)
  out = r1.block
  if (!r1.changed) return { block, changed: false }

  const specVal = toSpecFormat(next, "指向性")
  const specStart = out.indexOf("specGroups:")
  if (specStart !== -1) {
    const specPart = out.slice(specStart)
    const re = /(\{ label: "指向性", value: ")[^"]*(" \})/g
    const newSpec = specPart.replace(re, `$1${specVal}$2`)
    if (newSpec !== specPart) out = out.slice(0, specStart) + newSpec
  }

  return { block: out, changed: true, asin, from: current, to: next }
}

let total = 0
const changes = []

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue

  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  const out = src.replace(blockRe, (block, asin) => {
    const { block: next, changed, from, to } = updateBlock(block, asin)
    if (changed) {
      total++
      changes.push({ file, asin, from, to })
    }
    return next
  })

  if (out !== src) writeFileSync(path, out)
}

console.log(`Fixed directivity on ${total} mic card(s)`)
for (const c of changes) {
  console.log(`${c.asin} (${c.file}): ${c.from} → ${c.to}`)
}

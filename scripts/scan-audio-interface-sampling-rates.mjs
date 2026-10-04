/**
 * Scan audio-interface sampling rates: flag unverified values.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { AI_SPECS_KNOWN, DASH } from "./audio-interface-specs-known.mjs"
import { inferSamplingRateFromTitle } from "./amazon-audio-interface-sampling-rate.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const cachePath = path.join(root, "scripts/audio-interface-sampling-rate-cache.json")
const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
  : {}

function parseGadgetBlocks(text) {
  const gadgets = []
  let depth = 0
  let start = -1
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("{", i) && /[\s,\[]/.test(text[i - 1] ?? "[")) {
      if (depth === 0) start = i
      depth++
    } else if (text[i] === "}") {
      depth--
      if (depth === 0 && start >= 0) {
        gadgets.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }
  return gadgets
}

function extractAsin(url) {
  return url?.match(/\/dp\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase() ?? null
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text).filter((b) => /category: "audio-interface"/.test(b))

const verified = []
const unverified = []
const dashed = []

for (const block of blocks) {
  const id = block.match(/id: "([^"]+)"/)?.[1]
  const name = block.match(/name: "([^"]+)"/)?.[1]
  const tagline = block.match(/tagline: "([^"]+)"/)?.[1] ?? ""
  const url = block.match(/purchaseUrl: "([^"]+)"/)?.[1]
  const asin = extractAsin(url)
  const rate = block.match(/samplingRate: "([^"]*)"/)?.[1] ?? ""

  const known = asin ? AI_SPECS_KNOWN[asin] : null
  const cached = asin ? cache[asin] : null
  const taglineRate = inferSamplingRateFromTitle(tagline)

  let source = null
  if (known?.samplingRate) source = "known"
  else if (cached?.rate) source = "amazon"
  else if (taglineRate !== DASH) source = "tagline"

  const row = { id, name, asin, rate, source }

  if (rate === DASH) dashed.push(row)
  else if (source) verified.push(row)
  else unverified.push(row)
}

console.log(`Total: ${blocks.length}`)
console.log(`Verified: ${verified.length}`)
console.log(`Unverified (should dash): ${unverified.length}`)
console.log(`Already dashed: ${dashed.length}`)
console.log("\nUnverified:")
for (const u of unverified) {
  console.log(`  ${u.id} ${u.name} (${u.asin}) = ${u.rate}`)
}

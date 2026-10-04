/**
 * Clear unverified mic frequency / sample-rate values from lib/*.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  DASH,
  isVerifiedMicFrequency,
  isVerifiedMicSampleRate,
} from "./mic-verified-audio-specs.mjs"
import { toSpecFormat } from "./mic-card-specs-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const FIELDS = ["周波数特性", "サンプルレート"]

function getField(block, label) {
  const m = block.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
  return m?.[1]
}

function replaceField(block, label, value) {
  const re = new RegExp(`(\\{ label: "${label}", value: ")[^"]*(" \\})`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value}$2`)
  return { block: next, changed: next !== block }
}

function updateBlock(block, asin) {
  let next = block
  let changed = false

  for (const field of FIELDS) {
    const current = getField(next, field)
    if (!current || current === DASH || current === "-") continue

    const verified =
      field === "周波数特性"
        ? isVerifiedMicFrequency(asin, current)
        : isVerifiedMicSampleRate(asin, current)

    if (verified) continue

    const specValue = toSpecFormat(DASH, field)
    const r1 = replaceField(next, field, DASH)
    next = r1.block
    if (r1.changed) changed = true

    const specStart = next.indexOf("specGroups:")
    if (specStart !== -1) {
      const specPart = next.slice(specStart)
      const re = new RegExp(`(\\{ label: "${field}", value: ")[^"]*(" \\})`, "g")
      const newSpec = specPart.replace(re, `$1${specValue}$2`)
      if (newSpec !== specPart) {
        next = next.slice(0, specStart) + newSpec
        changed = true
      }
    }
  }

  return { block: next, changed }
}

let total = 0
const cleared = { 周波数特性: 0, サンプルレート: 0 }

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue

  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  const out = src.replace(blockRe, (block, asin) => {
    for (const field of FIELDS) {
      const current = getField(block, field)
      if (!current || current === DASH) continue
      const verified =
        field === "周波数特性"
          ? isVerifiedMicFrequency(asin, current)
          : isVerifiedMicSampleRate(asin, current)
      if (!verified) cleared[field]++
    }
    const { block: next, changed } = updateBlock(block, asin)
    if (changed) total++
    return next
  })

  if (out !== src) {
    writeFileSync(path, out)
    console.log(`${file}: updated`)
  }
}

console.log(`Blocks cleansed: ${total}`)
console.log("Fields cleared:", cleared)

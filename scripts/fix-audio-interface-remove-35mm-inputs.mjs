/**
 * Remove 3.5mm from audio-interface input fields (known specs + bestsellers data).
 * Usage: node scripts/fix-audio-interface-remove-35mm-inputs.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  contains35mmInput,
  getHighlightInputs,
  getInputsFromBlock,
  getSpecInputs,
  normalizeAudioInterfaceInputs,
  shortCardInputs,
} from "./audio-interface-inputs-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const bestsellersPath = path.join(root, "lib/audio-interface-bestsellers.ts")
const knownPath = path.join(root, "scripts/audio-interface-specs-known.mjs")
const reportPath = path.join(root, "scripts/audio-interface-remove-35mm-report.json")
const apply = process.argv.includes("--apply")

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
        gadgets.push({ start, end: i + 1, text: text.slice(start, i + 1) })
        start = -1
      }
    }
  }
  return gadgets
}

function replaceField(block, field, value) {
  const re = new RegExp(`(${field}: ")(?:[^"\\\\]|\\\\.)*(")`)
  const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  if (re.test(block)) return block.replace(re, `$1${escapedValue}$2`)
  return block
}

function updateHighlightInputs(block, cardValue) {
  if (/\{ label: "入力端子と数", value: "[^"]*" \}/.test(block)) {
    return block.replace(
      /\{ label: "入力端子と数", value: "[^"]*" \}/,
      `{ label: "入力端子と数", value: "${cardValue}" }`,
    )
  }
  return block
}

function updateSpecInputsRow(block, inputsValue) {
  if (/          \{ label: "入力端子", value: "[^"]*" \},/.test(block)) {
    return block.replace(
      /          \{ label: "入力端子", value: "[^"]*" \},/,
      `          { label: "入力端子", value: "${inputsValue}" },`,
    )
  }
  return block
}

function fixKnownSpecs(text) {
  const changes = []
  const next = text.replace(/inputs: "([^"]*)"/g, (full, value) => {
    if (!contains35mmInput(value)) return full
    const normalized = normalizeAudioInterfaceInputs(value)
    if (normalized === value) return full
    changes.push({ before: value, after: normalized })
    return `inputs: "${normalized}"`
  })
  return { text: next, changes }
}

const knownText = fs.readFileSync(knownPath, "utf8")
const knownFix = fixKnownSpecs(knownText)

const bestsellersText = fs.readFileSync(bestsellersPath, "utf8")
const blocks = parseGadgetBlocks(bestsellersText)
const bestsellerChanges = []

let nextBestsellers = bestsellersText
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue

  const beforeField = getInputsFromBlock(block)
  const beforeHighlight = getHighlightInputs(block)
  const beforeSpec = getSpecInputs(block)

  if (
    !contains35mmInput(beforeField) &&
    !contains35mmInput(beforeHighlight) &&
    !contains35mmInput(beforeSpec)
  ) {
    continue
  }

  const normalized = normalizeAudioInterfaceInputs(beforeField)
  const cardValue = shortCardInputs(normalized)

  let updated = block
  updated = replaceField(updated, "inputs", normalized)
  updated = updateHighlightInputs(updated, cardValue)
  updated = updateSpecInputsRow(updated, normalized)

  if (updated === block) continue

  bestsellerChanges.push({
    id: block.match(/id: "([^"]+)"/)?.[1],
    name: block.match(/name: "([^"]+)"/)?.[1],
    before: beforeField,
    after: normalized,
  })

  if (apply) {
    const absStart = start + offset
    const absEnd = end + offset
    nextBestsellers = nextBestsellers.slice(0, absStart) + updated + nextBestsellers.slice(absEnd)
    offset += updated.length - block.length
  }
}

const report = {
  mode: apply ? "apply" : "dry-run",
  knownSpecChanges: knownFix.changes.length,
  bestsellerChanges: bestsellerChanges.length,
  knownChangeList: knownFix.changes,
  bestsellerChangeList: bestsellerChanges,
  generatedAt: new Date().toISOString(),
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`${apply ? "Applied" : "Dry-run"}:`)
console.log(`  known specs: ${knownFix.changes.length}`)
console.log(`  bestsellers: ${bestsellerChanges.length}`)

for (const c of bestsellerChanges.slice(0, 20)) {
  console.log(`  ${c.id} | ${c.before} -> ${c.after}`)
}
if (bestsellerChanges.length > 20) console.log(`  ... and ${bestsellerChanges.length - 20} more`)

if (apply) {
  fs.writeFileSync(knownPath, knownFix.text, "utf8")
  fs.writeFileSync(bestsellersPath, nextBestsellers, "utf8")
  console.log("\nApplied to scripts/audio-interface-specs-known.mjs and lib/audio-interface-bestsellers.ts")
} else {
  console.log("\nDry run. Pass --apply to write.")
}

/**
 * Scan audio-interface input terminal mismatches.
 * Usage: node scripts/scan-audio-interface-input-mismatches.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { AI_SPECS_KNOWN } from "./audio-interface-specs-known.mjs"
import {
  extractAsinFromUrl,
  normalizeAudioInterfaceInputs,
  shortCardInputs,
} from "./audio-interface-inputs-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const knownPath = path.join(root, "scripts/audio-interface-specs-known.mjs")
const apply = process.argv.includes("--apply")

/** ASIN -> canonical inputs (manual overrides from product specs) */
const INPUT_OVERRIDES = {
  B09ZGT64RV: "XLR×1, 3.5mm TRRS×1", // Focusrite Vocaster Two
  B08HQQ2XVC: "XLR/TRSコンボ×2", // TC-HELICON GO TWIN
  B0DTJQL2YT: "XLR×1, 3.5mm×1", // BOMGE M12 (2ch: XLR + 3.5mm mic)
  B00UV71Y4I: "6.35mm ギターIN×1", // IK Multimedia iRig 2 (TRRS is PC connection)
}

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
  const pcRow = block.match(/(          \{ label: "PC接続", value: "[^"]*" \},)/)?.[1]
  if (pcRow) {
    return block.replace(pcRow, `          { label: "入力端子", value: "${inputsValue}" },\n${pcRow}`)
  }
  return block
}

function detectIssues(block) {
  const id = block.match(/id: "([^"]+)"/)?.[1] ?? ""
  const name = block.match(/name: "([^"]+)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]+)"/)?.[1] ?? ""
  const inputs = block.match(/inputs: "([^"]*)"/)?.[1] ?? "—"
  const asin = extractAsinFromUrl(block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? "")
  const hay = `${name} ${tagline}`.toLowerCase()
  const reasons = []

  if (INPUT_OVERRIDES[asin] && inputs !== INPUT_OVERRIDES[asin]) {
    reasons.push("known_override")
  }
  if (/vocaster\s*two/i.test(hay) && /xlr×2/i.test(inputs)) {
    reasons.push("vocaster_two_xlr2")
  }
  if (/go twin/i.test(hay) && inputs === "XLR×2") {
    reasons.push("go_twin_plain_xlr")
  }
  if (/combo|コンボ|xlr\/trs|xlr\/1\/4|1\/4.*xlr/i.test(hay) && /^XLR×\d+$/.test(inputs.replace(/\s/g, ""))) {
    reasons.push("combo_in_title_plain_xlr")
  }
  if (/trrs|stereo input|3\.5mm.*input/i.test(hay) && !/trrs|3\.5\s*mm/i.test(inputs) && /xlr/i.test(inputs)) {
    reasons.push("tagline_trrs_missing")
  }

  return { id, name, asin, inputs, reasons, fix: asin ? INPUT_OVERRIDES[asin] : null }
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const flagged = blocks
  .filter((b) => /category: "audio-interface"/.test(b.text))
  .map((b) => ({ ...detectIssues(b.text), block: b }))
  .filter((x) => x.reasons.length)

console.log(`Flagged ${flagged.length} audio interfaces`)
for (const f of flagged) {
  console.log(`  ${f.id} ${f.asin ?? "?"} ${f.name}: ${f.inputs} -> ${f.fix ?? "?"} [${f.reasons.join(", ")}]`)
}

if (!apply) {
  console.log("\nDry run. Pass --apply to write fixes.")
  process.exit(0)
}

let next = text
let offset = 0
let applied = 0

for (const item of flagged) {
  if (!item.fix) continue
  const { start, end, text: block } = item.block
  const cardValue = shortCardInputs(item.fix)
  let updated = block
  updated = replaceField(updated, "inputs", item.fix)
  updated = updateHighlightInputs(updated, cardValue)
  updated = updateSpecInputsRow(updated, item.fix)
  if (updated === block) continue

  const absStart = start + offset
  const absEnd = end + offset
  next = next.slice(0, absStart) + updated + next.slice(absEnd)
  offset += updated.length - block.length
  applied++
}

// Sync known specs overrides
let knownText = fs.readFileSync(knownPath, "utf8")
for (const [asin, inputs] of Object.entries(INPUT_OVERRIDES)) {
  const re = new RegExp(`(${asin}:[\\s\\S]*?inputs: ")([^"]*)(")`)
  if (re.test(knownText)) {
    knownText = knownText.replace(re, `$1${inputs}$3`)
  }
}

fs.writeFileSync(target, next, "utf8")
fs.writeFileSync(knownPath, knownText, "utf8")
console.log(`\nApplied ${applied} bestseller fixes + known spec overrides`)

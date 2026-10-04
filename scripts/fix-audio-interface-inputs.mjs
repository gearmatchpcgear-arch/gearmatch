/**
 * Sync inputs / card display from AI_SPECS_KNOWN (input terminals only).
 * Usage: node scripts/fix-audio-interface-inputs.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  extractAsinFromUrl,
  normalizeAudioInterfaceInputs,
  resolveKnownInputs,
  shortCardInputs,
} from "./audio-interface-inputs-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const reportPath = path.join(root, "scripts/gadget-inputs-fix-report.json")
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

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const changes = []

let next = text
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue

  const asin = extractAsinFromUrl(block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? "")
  const rawKnown = resolveKnownInputs(asin)
  if (!rawKnown) continue
  const knownInputs = normalizeAudioInterfaceInputs(rawKnown)

  const cardValue = shortCardInputs(knownInputs)
  let updated = block
  updated = replaceField(updated, "inputs", knownInputs)
  updated = updateHighlightInputs(updated, cardValue)
  updated = updateSpecInputsRow(updated, knownInputs)

  if (updated !== block) {
    const beforeField = block.match(/inputs: "([^"]*)"/)?.[1] ?? ""
    changes.push({
      id: block.match(/id: "([^"]+)"/)?.[1],
      name: block.match(/name: "([^"]+)"/)?.[1],
      asin,
      before: beforeField,
      after: knownInputs,
    })

    if (apply) {
      const absStart = start + offset
      const absEnd = end + offset
      next = next.slice(0, absStart) + updated + next.slice(absEnd)
      offset += updated.length - block.length
    }
  }
}

fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      mode: apply ? "apply" : "dry-run",
      changes: changes.length,
      changeList: changes,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(`${apply ? "Applied" : "Dry-run"}: ${changes.length} input updates`)
for (const c of changes.slice(0, 25)) {
  console.log(`${c.id} ${c.asin} | ${c.before} -> ${c.after}`)
}
if (changes.length > 25) console.log(`... and ${changes.length - 25} more`)

if (apply) {
  fs.writeFileSync(target, next, "utf8")
  console.log("\nApplied to lib/audio-interface-bestsellers.ts")
} else {
  console.log("\nDry run. Pass --apply to write.")
}

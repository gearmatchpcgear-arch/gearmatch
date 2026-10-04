/**
 * Sync phantomPower / card display from AI_SPECS_KNOWN and fix missing spec rows.
 * Usage: node scripts/fix-audio-interface-phantom-power.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { AI_SPECS_KNOWN } from "./audio-interface-specs-known.mjs"
import {
  extractAsinFromUrl,
  shortCardPhantom,
  resolveKnownPhantomPower,
} from "./audio-interface-phantom-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const reportPath = path.join(root, "scripts/gadget-phantom-fix-report.json")
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

function parseFields(block) {
  return {
    id: block.match(/id: "([^"]+)"/)?.[1] ?? "",
    name: block.match(/name: "([^"]+)"/)?.[1] ?? "",
    purchaseUrl: block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? "",
    phantomPower: block.match(/phantomPower: "([^"]*)"/)?.[1] ?? "",
    highlightPhantom: block.match(/\{ label: "ファンタム電源", value: "([^"]*)" \}/)?.[1],
    hasSpecPhantom: /label: "ファンタム電源"/.test(block),
  }
}

function replaceField(block, field, value) {
  const re = new RegExp(`(${field}: ")([^"]*)(")`)
  if (re.test(block)) return block.replace(re, `$1${value}$3`)
  return block
}

function updateHighlightPhantom(block, cardValue) {
  if (/\{ label: "ファンタム電源", value: "[^"]*" \}/.test(block)) {
    return block.replace(
      /\{ label: "ファンタム電源", value: "[^"]*" \}/,
      `{ label: "ファンタム電源", value: "${cardValue}" }`,
    )
  }
  return block
}

function ensureSpecPhantomRow(block, phantomValue) {
  if (/          \{ label: "ファンタム電源", value: "[^"]*" \},/.test(block)) {
    return block.replace(
      /          \{ label: "ファンタム電源", value: "[^"]*" \},/,
      `          { label: "ファンタム電源", value: "${phantomValue}" },`,
    )
  }

  const pcRow =
    block.match(/(          \{ label: "PC接続", value: "[^"]*" \},)/)?.[1] ??
    block.match(/(          \{ label: "入力端子[^"]*", value: "[^"]*" \},)/)?.[1]

  if (pcRow) {
    const row = `{ label: "ファンタム電源", value: "${phantomValue}" },`
    return block.replace(pcRow, `${pcRow}\n          ${row}`)
  }

  const rowsStart = block.indexOf("rows: [")
  if (rowsStart < 0) return block
  const insertAt = block.indexOf("          {", rowsStart)
  if (insertAt < 0) return block
  const row = `{ label: "ファンタム電源", value: "${phantomValue}" },\n          `
  return block.slice(0, insertAt) + row + block.slice(insertAt)
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const changes = []

let next = text
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue

  const fields = parseFields(block)
  const asin = extractAsinFromUrl(fields.purchaseUrl)
  const knownPhantom = resolveKnownPhantomPower(asin)
  if (!knownPhantom) continue

  const cardValue = shortCardPhantom(knownPhantom)
  let updated = block
  updated = ensureSpecPhantomRow(updated, knownPhantom)
  updated = updateHighlightPhantom(updated, cardValue)
  updated = replaceField(updated, "phantomPower", knownPhantom)

  const known = AI_SPECS_KNOWN[asin]
  if (known?.inputs) {
    updated = replaceField(updated, "inputs", known.inputs)
    if (/\{ label: "入力端子と数", value: "[^"]*" \}/.test(updated)) {
      const inputCard =
        known.inputs.length > 28 ? `${known.inputs.slice(0, 25)}…` : known.inputs
      updated = updated.replace(
        /\{ label: "入力端子と数", value: "[^"]*" \}/,
        `{ label: "入力端子と数", value: "${inputCard}" }`,
      )
    }
  }

  if (updated !== block) {
    changes.push({
      id: fields.id,
      name: fields.name,
      asin,
      before: {
        phantomPower: fields.phantomPower,
        highlight: fields.highlightPhantom,
        hasSpecRow: fields.hasSpecPhantom,
      },
      after: {
        phantomPower: knownPhantom,
        highlight: cardValue,
      },
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

console.log(`${apply ? "Applied" : "Dry-run"}: ${changes.length} phantom power updates`)
for (const c of changes.slice(0, 25)) {
  console.log(`${c.id} ${c.name} | ${c.before.phantomPower} -> ${c.after.phantomPower}`)
}
if (changes.length > 25) console.log(`... and ${changes.length - 25} more`)

if (apply) {
  fs.writeFileSync(target, next, "utf8")
  console.log("\nApplied to lib/audio-interface-bestsellers.ts")
} else {
  console.log("\nDry run. Pass --apply to write.")
}

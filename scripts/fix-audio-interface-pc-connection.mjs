/**
 * オーディオIFの connection / connectionType / PC接続 を PC 側 USB 端子表記へ一括更新。
 * Usage: node scripts/fix-audio-interface-pc-connection.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { AI_SPECS_KNOWN } from "./audio-interface-specs-known.mjs"
import {
  extractAsinFromUrl,
  normalizeAudioInterfacePcConnection,
  resolvePcConnectionFromSource,
} from "./audio-interface-pc-connection-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const apply = process.argv.includes("--apply")

function resolvePcConnection(gadget) {
  const asin = extractAsinFromUrl(gadget.purchaseUrl)
  const known = asin ? AI_SPECS_KNOWN[asin] : null
  return resolvePcConnectionFromSource({
    asin,
    pcConnection: gadget.pcConnection,
    connectionType: known?.connectionType ?? gadget.connectionType,
    connection: gadget.connection,
  })
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

function parseGadgetFields(block) {
  return {
    id: block.match(/id: "([^"]+)"/)?.[1] ?? "",
    name: block.match(/name: "([^"]+)"/)?.[1] ?? "",
    purchaseUrl: block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? "",
    connection: block.match(/connection: "([^"]*)"/)?.[1] ?? "",
    connectionType: block.match(/connectionType: "([^"]*)"/)?.[1] ?? "",
    pcConnection: block.match(/label: "PC接続", value: "([^"]*)"/)?.[1],
    hasPcRow: /label: "PC接続"/.test(block),
  }
}

function replaceField(block, field, value) {
  const re = new RegExp(`(${field}: ")([^"]*)(")`)
  if (re.test(block)) return block.replace(re, `$1${value}$3`)
  return block
}

function ensurePcRow(block, pcValue) {
  if (/label: "PC接続"/.test(block)) {
    return block.replace(/label: "PC接続", value: "[^"]*"/, `label: "PC接続", value: "${pcValue}"`)
  }

  const inputRow =
    block.match(/(\{ label: "入力端子[^"]*", value: "[^"]*" \},)/)?.[1] ??
    block.match(/(\{ label: "入力端子", value: "[^"]*" \},)/)?.[1]

  if (inputRow) {
    const pcRow = `{ label: "PC接続", value: "${pcValue}" },`
    return block.replace(inputRow, `${inputRow}\n          ${pcRow}`)
  }

  const rowsStart = block.indexOf("rows: [")
  if (rowsStart < 0) return block
  const insertAt = block.indexOf("{", rowsStart)
  if (insertAt < 0) return block
  const pcRow = `{ label: "PC接続", value: "${pcValue}" },\n          `
  return block.slice(0, insertAt) + pcRow + block.slice(insertAt)
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const changes = []

let next = text
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue

  const fields = parseGadgetFields(block)
  const pcValue = resolvePcConnection(fields)
  let updated = block

  updated = replaceField(updated, "connection", pcValue)
  updated = replaceField(updated, "connectionType", pcValue)
  updated = ensurePcRow(updated, pcValue)

  if (updated !== block) {
    changes.push({
      id: fields.id,
      name: fields.name,
      asin: extractAsinFromUrl(fields.purchaseUrl),
      before: {
        connection: fields.connection,
        connectionType: fields.connectionType,
        pc: fields.pcConnection ?? "(missing)",
      },
      after: pcValue,
    })

    if (apply) {
      const absStart = start + offset
      const absEnd = end + offset
      next = next.slice(0, absStart) + updated + next.slice(absEnd)
      offset += updated.length - block.length
    }
  }
}

console.log(`changes: ${changes.length}`)
for (const c of changes.slice(0, 20)) {
  console.log(`${c.id} | ${c.before.pc} -> ${c.after}`)
}
if (changes.length > 20) console.log(`... and ${changes.length - 20} more`)

const typeBRemaining = changes.filter((c) => /type-b/i.test(c.after))
console.log(`\nstill Type-B after: ${typeBRemaining.length}`)

if (apply) {
  fs.writeFileSync(target, next, "utf8")
  console.log("\nApplied to lib/audio-interface-bestsellers.ts")
} else {
  console.log("\nDry run. Pass --apply to write.")
}

export { normalizeAudioInterfacePcConnection, resolvePcConnectionFromSource }

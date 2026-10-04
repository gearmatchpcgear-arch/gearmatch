/**
 * Sync highlight サンプリングレート to samplingRate field (rate only, no bit depth).
 * Usage: node scripts/fix-audio-interface-sampling-highlights.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const apply = process.argv.includes("--apply")

function normalizeKhz(value) {
  const v = (value ?? "").trim()
  if (!v || v === "—") return "—"
  if (/khz/i.test(v)) return v.replace(/\s*khz/i, "kHz")
  if (/^\d+(\.\d+)?$/.test(v)) return `${v}kHz`
  return v
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

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const changes = []
let next = text
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue
  const samplingRate = block.match(/samplingRate: "([^"]*)"/)?.[1]
  if (!samplingRate || samplingRate === "—") continue

  const cardRate = normalizeKhz(samplingRate)
  const highlightRe = /\{ label: "サンプリングレート", value: "([^"]*)" \}/
  const match = block.match(highlightRe)
  if (!match) continue

  const before = match[1]
  if (before === cardRate) continue

  const updated = block.replace(
    highlightRe,
    `{ label: "サンプリングレート", value: "${cardRate}" }`,
  )

  changes.push({
    id: block.match(/id: "([^"]+)"/)?.[1],
    name: block.match(/name: "([^"]+)"/)?.[1],
    before,
    after: cardRate,
  })

  if (apply) {
    const absStart = start + offset
    const absEnd = end + offset
    next = next.slice(0, absStart) + updated + next.slice(absEnd)
    offset += updated.length - block.length
  }
}

console.log(`${apply ? "Applied" : "Dry-run"}: ${changes.length} highlight fixes`)
for (const c of changes.slice(0, 15)) {
  console.log(`  ${c.id} ${c.name}: ${c.before} -> ${c.after}`)
}
if (changes.length > 15) console.log(`  ... and ${changes.length - 15} more`)

if (apply) {
  fs.writeFileSync(target, next, "utf8")
  console.log("\nWrote lib/audio-interface-bestsellers.ts")
} else {
  console.log("\nPass --apply to write.")
}

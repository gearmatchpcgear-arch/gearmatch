/**
 * Detect input-terminal issues in lib/audio-interface-bestsellers.ts
 * Usage: node scripts/detect-audio-interface-input-gaps.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  classifyInputIssue,
  containsOutputTerminal,
  containsChannelIoNotation,
} from "./audio-interface-inputs-lib.mjs"
import { AI_SPECS_KNOWN } from "./audio-interface-specs-known.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const reportPath = path.join(root, "scripts/gadget-inputs-gap-report.json")

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
        gadgets.push({ text: text.slice(start, i + 1) })
        start = -1
      }
    }
  }
  return gadgets
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)

const gadgetIssues = []
const knownIssues = []

for (const { text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue
  const info = classifyInputIssue(block)
  if (info.issues.length) {
    gadgetIssues.push({
      id: block.match(/id: "([^"]+)"/)?.[1],
      name: block.match(/name: "([^"]+)"/)?.[1],
      asin: info.asin,
      field: info.field,
      known: info.known,
      issues: info.issues,
    })
  }
}

for (const [asin, spec] of Object.entries(AI_SPECS_KNOWN)) {
  const inputs = spec.inputs
  if (!inputs || inputs === "—") continue
  const issues = []
  if (containsOutputTerminal(inputs)) issues.push("known_has_output")
  if (containsChannelIoNotation(inputs)) issues.push("known_has_channel_io")
  if (issues.length) knownIssues.push({ asin, name: spec.name, inputs, issues })
}

const summary = {
  totalAudioInterfaces: blocks.filter((b) => /category: "audio-interface"/.test(b.text)).length,
  gadgetIssues: gadgetIssues.length,
  knownSpecIssues: knownIssues.length,
  outputMixed: gadgetIssues.filter((g) =>
    g.issues.some((i) => i.includes("output")),
  ).length,
  channelIoNotation: gadgetIssues.filter((g) =>
    g.issues.some((i) => i.includes("channel_io")),
  ).length,
  missingKnown: gadgetIssues.filter((g) => g.issues.includes("field_missing")).length,
  generatedAt: new Date().toISOString(),
}

fs.writeFileSync(
  reportPath,
  JSON.stringify({ summary, gadgetIssues, knownIssues }, null, 2) + "\n",
)

console.log("Input terminal gap scan")
console.log(JSON.stringify(summary, null, 2))
console.log("\nSample gadget issues:")
for (const g of gadgetIssues.slice(0, 20)) {
  console.log(`  ${g.id} ${g.asin ?? "?"} | ${g.field} | ${g.issues.join(", ")}`)
}
if (gadgetIssues.length > 20) console.log(`  ... and ${gadgetIssues.length - 20} more`)
if (knownIssues.length) {
  console.log("\nKnown spec issues (fix AI_SPECS_KNOWN first):")
  for (const k of knownIssues) console.log(`  ${k.asin} | ${k.inputs}`)
}

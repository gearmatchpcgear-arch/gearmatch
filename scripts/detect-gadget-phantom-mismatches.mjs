/**
 * Detect phantom power filter/display inconsistencies in audio-interface data.
 * Usage: node scripts/detect-gadget-phantom-mismatches.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  extractAsinFromUrl,
  getPhantomDisplayFromBlock,
  isPhantomSupportedBlock,
  resolveKnownPhantomPower,
  resolvePhantomPowerFromField,
} from "./audio-interface-phantom-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const reportPath = path.join(root, "scripts/gadget-phantom-mismatch-report.json")

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
    display: getPhantomDisplayFromBlock(block),
    filterMatch: isPhantomSupportedBlock(block),
  }
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text).filter((b) => /category: "audio-interface"/.test(b.text))

const falsePositiveFilter = []
const falseNegativeFilter = []
const displayFieldMismatch = []
const knownSpecMissing = []

for (const { text: block } of blocks) {
  const f = parseFields(block)
  const asin = extractAsinFromUrl(f.purchaseUrl)
  const knownPhantom = resolveKnownPhantomPower(asin)
  const fieldState = resolvePhantomPowerFromField(f.phantomPower)

  if (f.filterMatch && (f.display === "—" || /非対応/.test(f.display))) {
    falsePositiveFilter.push({ ...f, asin })
  }

  if (!f.filterMatch && fieldState === "supported") {
    falseNegativeFilter.push({ ...f, asin })
  }

  if (fieldState === "supported" && f.display === "—") {
    displayFieldMismatch.push({ ...f, asin, issue: "field-supported-display-dash" })
  }
  if (fieldState === "unsupported" && /\+48|48v|\+24|24v/i.test(f.display)) {
    displayFieldMismatch.push({ ...f, asin, issue: "field-unsupported-display-supported" })
  }
  if (fieldState === "supported" && /非対応/.test(f.display)) {
    displayFieldMismatch.push({ ...f, asin, issue: "field-supported-display-unsupported" })
  }

  if (knownPhantom && f.phantomPower !== knownPhantom) {
    knownSpecMissing.push({
      ...f,
      asin,
      knownPhantom,
      issue: "known-spec-not-applied",
    })
  }
}

const report = {
  scanned: blocks.length,
  falsePositiveFilter: falsePositiveFilter.length,
  falseNegativeFilter: falseNegativeFilter.length,
  displayFieldMismatch: displayFieldMismatch.length,
  knownSpecMissing: knownSpecMissing.length,
  falsePositiveFilterItems: falsePositiveFilter,
  falseNegativeFilterItems: falseNegativeFilter,
  displayFieldMismatchItems: displayFieldMismatch,
  knownSpecMissingItems: knownSpecMissing,
  generatedAt: new Date().toISOString(),
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n")

console.log(`Scanned ${blocks.length} audio-interface entries`)
console.log(`False-positive filter (shows — but matches): ${falsePositiveFilter.length}`)
console.log(`False-negative filter (supported field but no match): ${falseNegativeFilter.length}`)
console.log(`Display/field mismatch: ${displayFieldMismatch.length}`)
console.log(`Known spec not applied: ${knownSpecMissing.length}`)

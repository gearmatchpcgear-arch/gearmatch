import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import {
  extractKeyboardFeatureTextFromPower,
  getKeyboardCardHighlightEntries,
} from "../lib/keyboard-filter-tags.ts"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

const KEYBOARD_MODULES = [
  ["lib/keyboard-bestsellers.ts", "keyboardBestsellers"],
  ["lib/keyboard-bestsellers-page2.ts", "keyboardBestsellersPage2"],
  ["lib/keyboard-tablet-bestsellers.ts", "keyboardTabletBestsellers"],
  ["lib/keyboard-gaming-bestsellers.ts", "keyboardGamingBestsellers"],
  ["lib/keyboard-gaming-bestsellers-page2.ts", "keyboardGamingBestsellersPage2"],
  ["lib/keyboard-gaming-new-releases-page1.ts", "keyboardGamingNewReleasesPage1"],
  ["lib/keyboard-gaming-new-releases-page2.ts", "keyboardGamingNewReleasesPage2"],
  ["lib/keyboard-gaming-most-gifted.ts", "keyboardGamingMostGifted"],
  ["lib/keyboard-gaming-most-gifted-page2.ts", "keyboardGamingMostGiftedPage2"],
  ["lib/keyboard-new-releases.ts", "keyboardNewReleases"],
  ["lib/keyboard-new-releases-page2.ts", "keyboardNewReleasesPage2"],
  ["lib/keyboard-gpro-page3.ts", "keyboardGproPage3"],
]

function escapeTsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function formatHighlightsBlock(entries) {
  const lines = entries.map(
    (entry) => `      { label: "${entry.label}", value: "${escapeTsString(entry.value)}" }`,
  )
  return `highlights: [\n${lines.join(",\n")},\n    ],`
}

function replaceHighlightsInBlock(block, entries) {
  const start = block.indexOf("highlights: [")
  if (start === -1) return block
  const end = block.indexOf("\n    ],", start)
  if (end === -1) return block
  return block.slice(0, start) + formatHighlightsBlock(entries) + block.slice(end + "\n    ],".length)
}

function readPowerHighlightFromBlock(block) {
  const match = block.match(/\{ label: "電源", value: "((?:\\.|[^"\\])*)" \}/)
  if (!match) return ""
  return match[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
}

function insertFeatureRow(block, features) {
  if (!features || block.includes('label: "主な機能"')) return block
  return block.replace(
    /(\{ title: "接続 \/ 電源", rows: \[[\s\S]*?\{ label: "電源", value: "[^"]*" \},)/,
    `$1\n          { label: "主な機能", value: "${escapeTsString(features)}" },`,
  )
}

let updatedGadgets = 0
let featureRowsAdded = 0
let updatedFiles = 0

for (const [relativePath, exportName] of KEYBOARD_MODULES) {
  const filePath = path.join(ROOT, relativePath)
  const mod = await import(pathToFileURL(filePath).href)
  const gadgets = mod[exportName]
  if (!Array.isArray(gadgets)) continue

  let source = fs.readFileSync(filePath, "utf8")
  let fileChanged = false

  for (const gadget of gadgets) {
    if (gadget.category !== "keyboard") continue

    const idMarker = `id: "${gadget.id}"`
    const idIndex = source.indexOf(idMarker)
    if (idIndex === -1) continue

    const nextIdIndex = source.indexOf('\n    id: "', idIndex + idMarker.length)
    const blockEnd = nextIdIndex === -1 ? source.length : nextIdIndex
    let block = source.slice(idIndex, blockEnd)

    const oldPower = readPowerHighlightFromBlock(block)
    const features = extractKeyboardFeatureTextFromPower(oldPower)
    if (features) {
      const withFeature = insertFeatureRow(block, features)
      if (withFeature !== block) {
        block = withFeature
        featureRowsAdded++
      }
    }

    const entries = getKeyboardCardHighlightEntries(gadget)
    const nextBlock = replaceHighlightsInBlock(block, entries)
    if (nextBlock === block) continue

    source = source.slice(0, idIndex) + nextBlock + source.slice(blockEnd)
    updatedGadgets++
    fileChanged = true
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, source, "utf8")
    updatedFiles++
    console.log(`${relativePath}: updated`)
  }
}

console.log(
  `Done. Updated ${updatedGadgets} keyboard card(s), added ${featureRowsAdded} 主な機能 row(s) across ${updatedFiles} file(s).`,
)

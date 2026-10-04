import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { getKeyboardCardHighlightEntries } from "../lib/keyboard-filter-tags.ts"
import {
  getGadgetPowerDisplay,
  powerDisplayNeedsDataCleanup,
  readGadgetPowerRaw,
} from "../lib/power-display.ts"

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

const MOUSE_MODULES = [
  ["lib/mouse-bestsellers.ts", "mouseBestsellers"],
  ["lib/mouse-gaming-bestsellers.ts", "mouseGamingBestsellers"],
  ["lib/mouse-gaming-new-releases.ts", "mouseGamingNewReleases"],
  ["lib/mouse-gaming-new-releases-page2.ts", "mouseGamingNewReleasesPage2"],
  ["lib/mouse-g-pro-search.ts", "mouseGProSearch"],
  ["lib/mouse-gpro-page3.ts", "mouseGproPage3"],
  ["lib/mouse-popular-brands.ts", "mousePopularBrands"],
  ["lib/mouse-new-releases.ts", "mouseNewReleases"],
  ["lib/mouse-new-releases-page2.ts", "mouseNewReleasesPage2"],
]

const ALL_MODULES = [...KEYBOARD_MODULES, ...MOUSE_MODULES]

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

function replaceSpecRowValue(block, label, nextValue) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const spaced = new RegExp(
    `(\\{ label: "${escapedLabel}", value: ")(?:\\\\.|[^"\\\\])*(\" \\})`,
    "g",
  )
  const compact = new RegExp(
    `(\\{"label":"${escapedLabel}","value":")(?:\\\\.|[^"\\\\])*(\"\\})`,
    "g",
  )
  return block
    .replace(spaced, `$1${escapeTsString(nextValue)}$2`)
    .replace(compact, `$1${escapeTsString(nextValue)}$2`)
}

function shouldSyncGadget(gadget) {
  if (!["keyboard", "mouse"].includes(gadget.category)) return false
  const display = getGadgetPowerDisplay(gadget)
  if (display === "—") return false

  const raw = readGadgetPowerRaw(gadget)
  const highlight = gadget.highlights.find((h) => h.label === "電源")?.value

  if (gadget.category === "keyboard" && highlight !== display) return true
  if (raw && (raw !== display || powerDisplayNeedsDataCleanup(raw))) return true
  if (highlight && powerDisplayNeedsDataCleanup(highlight)) return true
  return false
}

function syncGadgetPowerFields(gadget) {
  const display = getGadgetPowerDisplay(gadget)
  if (display === "—") return null

  const powerGroup = gadget.specGroups.find((g) => /接続|電源/i.test(g.title ?? ""))
  const powerRow = powerGroup?.rows.find((r) => r.label === "電源")
  if (powerRow) powerRow.value = display

  if (gadget.category === "keyboard") {
    const highlight = gadget.highlights.find((h) => h.label === "電源")
    if (highlight) highlight.value = display
  }

  return display
}

let updatedGadgets = 0
let updatedFiles = 0

for (const [relativePath, exportName] of ALL_MODULES) {
  const filePath = path.join(ROOT, relativePath)
  const mod = await import(pathToFileURL(filePath).href)
  const gadgets = mod[exportName]
  if (!Array.isArray(gadgets)) continue

  let source = fs.readFileSync(filePath, "utf8")
  let fileChanged = false

  for (const gadget of gadgets) {
    if (!shouldSyncGadget(gadget)) continue

    const idMarker = `id: "${gadget.id}"`
    const idIndex = source.indexOf(idMarker)
    if (idIndex === -1) continue

    const nextIdIndex = source.indexOf('\n    id: "', idIndex + idMarker.length)
    const blockEnd = nextIdIndex === -1 ? source.length : nextIdIndex
    let block = source.slice(idIndex, blockEnd)

    const display = syncGadgetPowerFields(gadget)
    if (!display) continue

    block = replaceSpecRowValue(block, "電源", display)
    if (gadget.category === "keyboard") {
      const entries = getKeyboardCardHighlightEntries(gadget)
      block = replaceHighlightsInBlock(block, entries)
    }

    source = source.slice(0, idIndex) + block + source.slice(blockEnd)
    updatedGadgets++
    fileChanged = true
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, source, "utf8")
    updatedFiles++
    console.log(`${relativePath}: updated`)
  }
}

const gadgetsFilePath = path.join(ROOT, "lib/gadgets.ts")
let gadgetsSource = fs.readFileSync(gadgetsFilePath, "utf8")
const { gadgets: allGadgetsLoaded } = await import(pathToFileURL(gadgetsFilePath).href)
let seedUpdated = 0

for (const gadget of allGadgetsLoaded) {
  if (!["keyboard", "mouse"].includes(gadget.category)) continue
  if (!shouldSyncGadget(gadget)) continue
  const idMarker = `id: "${gadget.id}"`
  const idIndex = gadgetsSource.indexOf(idMarker)
  if (idIndex === -1) continue

  const nextIdIndex = gadgetsSource.indexOf('\n  {\n    id: "', idIndex + idMarker.length)
  const altNext = gadgetsSource.indexOf('\n  },\n  {\n    id: "', idIndex + idMarker.length)
  const blockEnd = [nextIdIndex, altNext].filter((i) => i !== -1).sort((a, b) => a - b)[0] ?? gadgetsSource.length
  let block = gadgetsSource.slice(idIndex, blockEnd)

  const display = syncGadgetPowerFields(gadget)
  if (!display) continue

  block = replaceSpecRowValue(block, "電源", display)
  if (gadget.category === "keyboard") {
    const entries = getKeyboardCardHighlightEntries(gadget)
    block = replaceHighlightsInBlock(block, entries)
  }

  gadgetsSource = gadgetsSource.slice(0, idIndex) + block + gadgetsSource.slice(blockEnd)
  seedUpdated++
}

if (seedUpdated > 0) {
  fs.writeFileSync(gadgetsFilePath, gadgetsSource, "utf8")
  console.log(`lib/gadgets.ts: updated ${seedUpdated} seed gadget(s)`)
}

console.log(`Done. Synced ${updatedGadgets} gadget(s) across ${updatedFiles} file(s).`)

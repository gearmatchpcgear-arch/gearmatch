import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { getKeyboardCardHighlightEntries } from "../lib/keyboard-filter-tags.ts"
import {
  hasExplicitUsbConnectorType,
  resolveStoredUsbConnection,
} from "../lib/usb-connection-display.ts"

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

const AUDIO_MODULES = [["lib/audio-interface-bestsellers.ts", "audioInterfaceBestsellers"]]

const ALL_MODULES = [...KEYBOARD_MODULES, ...MOUSE_MODULES, ...AUDIO_MODULES]

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

function replaceConnectionField(block, nextValue) {
  return block.replace(/connection: "((?:\\.|[^"\\])*)"/, `connection: "${escapeTsString(nextValue)}"`)
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

function shouldProcess(gadget) {
  if (!["keyboard", "mouse", "audio-interface"].includes(gadget.category)) return false
  const next = resolveStoredUsbConnection(gadget)
  const cur = gadget.connection ?? ""
  if (next === cur) {
    const spec = gadget.specGroups.flatMap((g) => g.rows).find((r) => r.label === "接続方式")?.value
    if (spec && spec !== next && hasExplicitUsbConnectorType(spec)) return true
    return false
  }
  return true
}

let updatedGadgets = 0
let updatedFiles = 0
let keptTyped = 0

for (const [relativePath, exportName] of ALL_MODULES) {
  const filePath = path.join(ROOT, relativePath)
  const mod = await import(pathToFileURL(filePath).href)
  const gadgets = mod[exportName]
  if (!Array.isArray(gadgets)) continue

  let source = fs.readFileSync(filePath, "utf8")
  let fileChanged = false

  for (const gadget of gadgets) {
    if (!shouldProcess(gadget)) continue

    const idMarker = `id: "${gadget.id}"`
    const idIndex = source.indexOf(idMarker)
    if (idIndex === -1) continue

    const nextIdIndex = source.indexOf('\n    id: "', idIndex + idMarker.length)
    const blockEnd = nextIdIndex === -1 ? source.length : nextIdIndex
    let block = source.slice(idIndex, blockEnd)

    const nextConnection = resolveStoredUsbConnection(gadget)
    if (hasExplicitUsbConnectorType(nextConnection)) keptTyped++

    gadget.connection = nextConnection
    block = replaceConnectionField(block, nextConnection)
    block = replaceSpecRowValue(block, "接続方式", nextConnection)
    block = replaceSpecRowValue(block, "接続", nextConnection)
    if (gadget.category === "audio-interface") {
      block = replaceSpecRowValue(block, "PC接続", nextConnection)
    }

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
  if (!["keyboard", "mouse", "audio-interface"].includes(gadget.category)) continue
  if (!shouldProcess(gadget)) continue
  const idMarker = `id: "${gadget.id}"`
  const idIndex = gadgetsSource.indexOf(idMarker)
  if (idIndex === -1) continue

  const nextIdIndex = gadgetsSource.indexOf('\n  {\n    id: "', idIndex + idMarker.length)
  const altNext = gadgetsSource.indexOf('\n  },\n  {\n    id: "', idIndex + idMarker.length)
  const blockEnd = [nextIdIndex, altNext].filter((i) => i !== -1).sort((a, b) => a - b)[0] ?? gadgetsSource.length
  let block = gadgetsSource.slice(idIndex, blockEnd)

  const nextConnection = resolveStoredUsbConnection(gadget)
  if (hasExplicitUsbConnectorType(nextConnection)) keptTyped++
  gadget.connection = nextConnection
  block = replaceConnectionField(block, nextConnection)
  block = replaceSpecRowValue(block, "接続方式", nextConnection)

  gadgetsSource = gadgetsSource.slice(0, idIndex) + block + gadgetsSource.slice(blockEnd)
  seedUpdated++
}

if (seedUpdated > 0) {
  fs.writeFileSync(gadgetsFilePath, gadgetsSource, "utf8")
  console.log(`lib/gadgets.ts: updated ${seedUpdated} seed gadget(s)`)
}

console.log(
  `Done. Updated ${updatedGadgets} gadget(s) across ${updatedFiles} file(s). Kept explicit Type: ${keptTyped}.`,
)

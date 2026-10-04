import { audioInterfaceBestsellers } from "../lib/audio-interface-bestsellers.ts"
import {
  audioInterfaceInputFilterId,
  hasStandaloneXlrInputPort,
  matchesAudioInterfaceInputFilterId,
} from "../lib/audio-interface-input-filters.ts"
import { allSourceGadgets, getListableGadgets } from "../lib/gadgets.ts"

const xlrId = audioInterfaceInputFilterId("xlr")
const comboId = audioInterfaceInputFilterId("xlr-trs-combo")

console.log("=== standalone helper ===")
for (const [label, text, expected] of [
  ["XLR", "XLR", true],
  ["XLR, 3.5mm", "XLR, 3.5mm", true],
  ["XLR/TRS combo only", "XLR/TRSコンボ", false],
  ["combo + XLR", "XLR/TRSコンボ, XLR", true],
  ["XLR x1", "XLR×1", true],
  ["XLR、TRS", "XLR、TRS", true],
] ) {
  const got = hasStandaloneXlrInputPort(text)
  console.log(label, got === expected ? "OK" : "FAIL", got)
}

const ai = getListableGadgets(allSourceGadgets.filter((g) => g.category === "audio-interface"))

const comboOnlyFalseXlr = ai.filter((g) => {
  const inputs =
    g.highlights.find((h) => h.label === "入力端子と数")?.value ?? g.inputs ?? ""
  return !hasStandaloneXlrInputPort(inputs) && matchesAudioInterfaceInputFilterId(g, xlrId)
})

const standaloneMissed = ai.filter((g) => {
  const inputs =
    g.highlights.find((h) => h.label === "入力端子と数")?.value ?? g.inputs ?? ""
  return hasStandaloneXlrInputPort(inputs) && !matchesAudioInterfaceInputFilterId(g, xlrId)
})

console.log("\nlistable audio interfaces:", ai.length)
console.log("XLR filter matches:", ai.filter((g) => matchesAudioInterfaceInputFilterId(g, xlrId)).length)
console.log("combo-only false XLR hits:", comboOnlyFalseXlr.length)
console.log("standalone missed:", standaloneMissed.length)

if (comboOnlyFalseXlr.length > 0) {
  console.log("false positives:", comboOnlyFalseXlr.slice(0, 5).map((g) => g.id))
}
if (standaloneMissed.length > 0) {
  console.log("false negatives:", standaloneMissed.slice(0, 5).map((g) => g.id))
}

console.log("\n=== sample rows ===")
for (const g of audioInterfaceBestsellers.slice(0, 8)) {
  const inputs = g.highlights.find((h) => h.label === "入力端子と数")?.value ?? g.inputs
  console.log(
    g.id,
    JSON.stringify(inputs),
    "xlr:",
    matchesAudioInterfaceInputFilterId(g, xlrId),
    "combo:",
    matchesAudioInterfaceInputFilterId(g, comboId),
  )
}

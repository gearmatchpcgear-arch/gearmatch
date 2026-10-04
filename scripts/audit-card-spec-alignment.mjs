import { gadgets } from "../lib/gadgets.ts"
import { getCardHighlights } from "../lib/gadgets.ts"
import {
  KEYBOARD_POWER_FEATURE_KEYWORD,
  isKeyboardFeaturePowerValue,
} from "../lib/keyboard-filter-tags.ts"

function powerHasFeatureContamination(value) {
  if (!value || value === "—") return false
  if (isKeyboardFeaturePowerValue(value)) return true
  if (/\s\/\s/.test(value) && KEYBOARD_POWER_FEATURE_KEYWORD.test(value.split(/\s*\/\s/).slice(1).join(" "))) {
    return true
  }
  return false
}

let contaminated = 0

for (const gadget of gadgets) {
  const card = getCardHighlights(gadget)
  const power = card.find((h) => h.label === "電源")?.value ?? ""

  if (powerHasFeatureContamination(power)) {
    contaminated++
    console.log(`[power] ${gadget.category} ${gadget.id}: ${power}`)
    continue
  }

  if (gadget.category !== "keyboard") {
    for (const group of gadget.specGroups) {
      for (const row of group.rows) {
        if (row.label !== "電源") continue
        if (powerHasFeatureContamination(row.value)) {
          contaminated++
          console.log(`[spec 電源] ${gadget.category} ${gadget.id}: ${row.value}`)
        }
      }
    }
  }
}

console.log(`Power contamination remaining: ${contaminated}`)
console.log(`Checked ${gadgets.length} gadgets`)

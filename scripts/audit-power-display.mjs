import { gadgets } from "../lib/gadgets.ts"
import { getKeyboardPower } from "../lib/keyboard-filter-tags.ts"
import { getMouseCardPowerDisplay } from "../lib/gadgets.ts"
import { getGadgetPowerDisplay, powerDisplayNeedsDataCleanup } from "../lib/power-display.ts"

function powerRow(g) {
  return g.specGroups.flatMap((x) => x.rows).find((r) => r.label === "電源")?.value
}

let kbMismatch = 0
let kbContam = 0
for (const g of gadgets.filter((g) => g.category === "keyboard")) {
  const card = getKeyboardPower(g)
  const unified = getGadgetPowerDisplay(g)
  const row = powerRow(g)
  if (powerDisplayNeedsDataCleanup(row ?? "") || powerDisplayNeedsDataCleanup(card)) kbContam++
  if (card !== unified) {
    kbMismatch++
    if (kbMismatch <= 5) console.log(g.id, "| card:", card, "| unified:", unified)
  }
}
console.log("kb mismatch", kbMismatch, "contaminated", kbContam)

let mouseMismatch = 0
for (const g of gadgets.filter((g) => g.category === "mouse")) {
  const card = getMouseCardPowerDisplay(g)
  const unified = getGadgetPowerDisplay(g)
  if (card !== unified) {
    mouseMismatch++
    if (mouseMismatch <= 5) console.log(g.id, "| card:", card, "| unified:", unified)
  }
}
console.log("mouse mismatch", mouseMismatch)

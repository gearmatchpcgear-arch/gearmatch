import { gadgets } from "../lib/gadgets.ts"
import { matchesKeyboardUsbTypeCConnectionFilter } from "../lib/keyboard-filter-tags.ts"

const keyboards = gadgets.filter((g) => g.category === "keyboard")
const matched = keyboards.filter(matchesKeyboardUsbTypeCConnectionFilter)

console.log("USB Type-C filter matches:", matched.length)

const chargingOnly = keyboards.filter(
  (g) =>
    /type-c\s*充電|type-c充電|usb type-c充電/i.test(`${g.name} ${g.tagline}`) &&
    !/type-c有線|usb-c有線|usb type-c接続|\/usb-c/i.test(`${g.name} ${g.tagline}`),
)
const falsePositives = chargingOnly.filter(matchesKeyboardUsbTypeCConnectionFilter)
console.log("charging-only keyboards wrongly matched:", falsePositives.length)
for (const g of falsePositives.slice(0, 5)) {
  console.log("  FP:", g.id, g.name.slice(0, 50))
}

const yunzii = keyboards.find((g) => g.tagline?.includes("YUNZII X98") && g.tagline?.includes("USB-C"))
console.log("YUNZII X98 matches:", yunzii ? matchesKeyboardUsbTypeCConnectionFilter(yunzii) : "not found")

const huntsman = keyboards.find((g) => g.id === "k-gbs-081")
console.log("Huntsman matches:", huntsman ? matchesKeyboardUsbTypeCConnectionFilter(huntsman) : "n/a")

const iclever = keyboards.find((g) => g.name?.includes("Type-C充電 DK02"))
console.log("iClever DK02 matches:", iclever ? matchesKeyboardUsbTypeCConnectionFilter(iclever) : "n/a")

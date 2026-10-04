import { gadgets } from "../lib/gadgets.ts"
import { hasExplicitUsbConnectorType, isVagueWiredUsb } from "../lib/usb-connection-display.ts"

for (const cat of ["keyboard", "mouse", "audio-interface"]) {
  const items = gadgets.filter((g) => g.category === cat)
  let typed = 0
  let vague = 0
  for (const g of items) {
    const c = g.connection ?? ""
    if (hasExplicitUsbConnectorType(c)) typed++
    else if (isVagueWiredUsb(c) || c === "USB") vague++
  }
  console.log(cat, "| total:", items.length, "| typed:", typed, "| vague USB:", vague)
}

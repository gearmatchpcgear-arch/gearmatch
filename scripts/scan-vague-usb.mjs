import { gadgets } from "../lib/gadgets.ts"
import { isVagueWiredUsb } from "../lib/usb-connection-display.ts"

function hasVagueUsb(g) {
  if (isVagueWiredUsb(g.connection)) return true
  for (const h of g.highlights) if (h.label === "接続方式" && isVagueWiredUsb(h.value)) return true
  for (const group of g.specGroups) {
    for (const row of group.rows) {
      if ((row.label === "接続方式" || row.label === "接続" || row.label === "PC接続") && isVagueWiredUsb(row.value)) {
        return true
      }
    }
  }
  return false
}

const vague = gadgets.filter(hasVagueUsb)
console.log("vague count:", vague.length)
const byCat = {}
for (const g of vague) byCat[g.category] = (byCat[g.category] || 0) + 1
console.log(byCat)

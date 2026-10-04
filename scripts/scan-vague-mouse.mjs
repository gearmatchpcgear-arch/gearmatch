import { gadgets } from "../lib/gadgets.ts"
import { isVagueWiredUsb } from "../lib/usb-connection-display.ts"

const vague = gadgets.filter((g) => {
  if (g.category !== "mouse") return false
  if (isVagueWiredUsb(g.connection)) return true
  for (const group of g.specGroups) {
    for (const row of group.rows) {
      if (row.label === "接続方式" && isVagueWiredUsb(row.value)) return true
    }
  }
  return false
})

console.log("mouse vague:", vague.length)
for (const g of vague.slice(0, 20)) {
  console.log(g.id, "|", g.connection, "|", g.name.slice(0, 60))
}

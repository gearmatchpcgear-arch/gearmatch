import { gadgets } from "../lib/gadgets.ts"
import { hasExplicitUsbConnectorType } from "../lib/usb-connection-display.ts"

let count = 0
const byCat = {}
const samples = []

for (const g of gadgets) {
  const fields = [g.connection, g.connectionType, ...g.specGroups.flatMap((gr) => gr.rows.map((r) => r.value))]
  const hasType = fields.some((f) => f && hasExplicitUsbConnectorType(f))
  if (!hasType) continue
  count++
  byCat[g.category] = (byCat[g.category] || 0) + 1
  if (samples.length < 15 && (g.category === "keyboard" || g.category === "mouse")) {
    samples.push({ id: g.id, connection: g.connection, name: g.name.slice(0, 50) })
  }
}

console.log("stored explicit type:", count, byCat)
for (const s of samples) console.log(s.id, "|", s.connection)

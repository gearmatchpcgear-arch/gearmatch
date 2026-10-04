import { gadgets } from "../lib/gadgets.ts"
import {
  hasExplicitUsbConnectorType,
  inferUsbConnectorSpec,
  resolveStoredUsbConnection,
} from "../lib/usb-connection-display.ts"

const kbMouse = gadgets.filter((g) => g.category === "keyboard" || g.category === "mouse")
const unjustified = []

for (const g of kbMouse) {
  if (!hasExplicitUsbConnectorType(g.connection ?? "")) continue
  const spec = inferUsbConnectorSpec(g)
  const resolved = resolveStoredUsbConnection(g)
  if (!spec && !resolved.includes("Type")) {
    unjustified.push({ id: g.id, connection: g.connection })
  } else if (spec === null && hasExplicitUsbConnectorType(g.connection ?? "")) {
    unjustified.push({ id: g.id, connection: g.connection, reason: "no infer" })
  }
}

console.log("typed without justification:", unjustified.length)
for (const u of unjustified) console.log(u.id, "|", u.connection, u.reason ?? "")

const shouldRevert = kbMouse.filter((g) => {
  if (!hasExplicitUsbConnectorType(g.connection ?? "")) return false
  return inferUsbConnectorSpec(g) === null
})
console.log("must revert:", shouldRevert.length)
for (const g of shouldRevert) console.log(g.id, "|", g.connection)

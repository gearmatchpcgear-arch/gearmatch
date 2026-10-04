import { gadgets } from "../lib/gadgets.ts"
import {
  hasExplicitUsbConnectorType,
  inferUsbConnectorSpec,
  resolveStoredUsbConnection,
  formatWiredUsbConnection,
} from "../lib/usb-connection-display.ts"

const kbMouse = gadgets.filter((g) => g.category === "keyboard" || g.category === "mouse")
let typed = 0
for (const g of kbMouse) {
  if (hasExplicitUsbConnectorType(g.connection ?? "")) {
    typed++
    console.log(g.id, "|", g.connection)
  }
}
console.log("typed kb+mouse:", typed)

const redragon = gadgets.find(
  (g) => g.tagline?.includes("Redragon K524") && g.category === "keyboard",
)
if (redragon) {
  const spec = inferUsbConnectorSpec(redragon)
  console.log(
    "redragon infer:",
    spec ? formatWiredUsbConnection(spec) : null,
    "| resolve:",
    resolveStoredUsbConnection({ ...redragon, connection: "有線 USB" }),
  )
}

const suwira = gadgets.find((g) => g.name?.includes("Suwira") && g.category === "mouse")
if (suwira) {
  console.log("suwira infer:", inferUsbConnectorSpec(suwira))
  console.log("suwira resolve:", resolveStoredUsbConnection(suwira))
}

console.log("k-gbs-081:", gadgets.find((g) => g.id === "k-gbs-081")?.connection)
console.log("k-bs-002:", gadgets.find((g) => g.id === "k-bs-002")?.connection)

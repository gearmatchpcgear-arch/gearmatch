import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { getAudioInterfacePcConnectionFilterTags } from "../lib/audio-interface-pc-connection.ts"
import {
  detectAudioInterfaceInputConnectorKeys,
  matchesAudioInterfaceInputFilterId,
} from "../lib/audio-interface-input-filters.ts"
import { hasAudioInterfaceFilterTag } from "../lib/audio-interface-filter-tags.ts"
import { hasAudioInterfaceBluetoothSupport } from "../lib/audio-interface-pc-connection.ts"

const maono = gadgets.find((g) => g.id === "ai-rank-027")
const list = getListableGadgets(gadgets, false).filter((g) => g.category === "audio-interface")

console.log("Maono listable:", list.some((g) => g.id === "ai-rank-027"))
if (maono) {
  console.log("Maono inputs:", maono.inputs)
  console.log("Maono connection:", maono.connection)
  console.log("PC tags:", getAudioInterfacePcConnectionFilterTags(maono))
  console.log("Input keys:", detectAudioInterfaceInputConnectorKeys(maono))
  console.log("hasAudioInterfaceBluetoothSupport:", hasAudioInterfaceBluetoothSupport(maono))
  console.log("conn-bluetooth:", hasAudioInterfaceFilterTag(maono, "conn-bluetooth"))
  console.log("ai-input-bluetooth:", matchesAudioInterfaceInputFilterId(maono, "ai-input-bluetooth"))
}

const btPc = list.filter((g) => hasAudioInterfaceFilterTag(g, "conn-bluetooth"))
const btInput = list.filter((g) => matchesAudioInterfaceInputFilterId(g, "ai-input-bluetooth"))
console.log("\nPC conn bluetooth:", btPc.length, btPc.map((g) => g.name).join(", "))
console.log("Input bluetooth:", btInput.length, btInput.map((g) => g.name).join(", "))

import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import {
  AI_FILTER_TAG_LABELS,
  hasAudioInterfaceFilterTag,
} from "../lib/audio-interface-filter-tags.ts"
import { getAudioInterfacePcConnectionFilterTags } from "../lib/audio-interface-pc-connection.ts"

const list = getListableGadgets(gadgets, false).filter((g) => g.category === "audio-interface")
const connGroup = getFilterGroupsForCategory("audio-interface", list).find(
  (g) => g.id === "ai-connection",
)

console.log("PC接続方式フィルター項目:")
for (const f of connGroup.filters) {
  console.log(` - ${f.label} (${f.id})`)
}

const tags = [
  "conn-usb-c",
  "conn-usb-b",
  "conn-bluetooth",
  "conn-thunderbolt",
  "conn-35mm",
]

console.log("\n絞り込み件数:")
for (const tag of tags) {
  const count = list.filter((g) => hasAudioInterfaceFilterTag(g, tag)).length
  console.log(`  ${AI_FILTER_TAG_LABELS[tag]}: ${count}`)
}

console.log("\nタグ分布:")
const tagCounts = {}
let noTag = 0
for (const g of list) {
  const gadgetTags = getAudioInterfacePcConnectionFilterTags(g)
  if (gadgetTags.length === 0) noTag++
  for (const t of gadgetTags) tagCounts[t] = (tagCounts[t] ?? 0) + 1
}
for (const [t, c] of Object.entries(tagCounts).sort()) console.log(`  ${t}: ${c}`)
console.log(`  (タグなし): ${noTag}`)
console.log(`  合計: ${list.length}`)

const bt = list.filter((g) =>
  getAudioInterfacePcConnectionFilterTags(g).includes("conn-bluetooth"),
)
console.log("\nBluetooth例:", bt.slice(0, 3).map((g) => g.name).join(", ") || "(なし)")

const mm = list.filter((g) => getAudioInterfacePcConnectionFilterTags(g).includes("conn-35mm"))
console.log("3.5mm例:", mm.map((g) => g.name).join(", ") || "(なし)")

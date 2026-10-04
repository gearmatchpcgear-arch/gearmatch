import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import {
  AI_FILTER_TAG_LABELS,
  hasAudioInterfaceFilterTag,
} from "../lib/audio-interface-filter-tags.ts"

const list = getListableGadgets(gadgets, false).filter((g) => g.category === "audio-interface")
const systemGroup = getFilterGroupsForCategory("audio-interface", list).find(
  (g) => g.id === "ai-system",
)

console.log("システム要件フィルター項目:")
for (const f of systemGroup.filters) {
  console.log(` - ${f.label} (${f.id})`)
}

const tags = ["sys-win", "sys-mac", "sys-ios", "sys-android", "sys-linux"]

console.log("\n絞り込み件数:")
for (const tag of tags) {
  const count = list.filter((g) => hasAudioInterfaceFilterTag(g, tag)).length
  console.log(`  ${AI_FILTER_TAG_LABELS[tag]}: ${count}`)
}

const linux = list.filter((g) => hasAudioInterfaceFilterTag(g, "sys-linux"))
console.log("\nLinux対応例:", linux.map((g) => g.name).join(", ") || "(なし)")
console.log(`合計: ${list.length}`)

import { allSourceGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import {
  hasMonitorArmFilterTag,
  MONITOR_ARM_FILTER_TAG_LABELS,
} from "../lib/monitor-arm-filter-tags.ts"

const arms = allSourceGadgets.filter((g) => g.category === "monitor-arm")
const groups = getFilterGroupsForCategory("monitor-arm", arms)
const loadGroup = groups.find((g) => g.id === "arm-load")

console.log("Load filter labels:", loadGroup?.filters.map((f) => f.label).join(" | "))
console.log("Filter count:", loadGroup?.filters.length)

const loadTags = ["load-up-to-9", "load-10-14", "load-15-plus"]

for (const tag of loadTags) {
  const count = arms.filter((g) => hasMonitorArmFilterTag(g, tag)).length
  console.log(`${MONITOR_ARM_FILTER_TAG_LABELS[tag]}: ${count}`)
}

const multiMatch = arms.filter((g) => {
  const hits = loadTags.filter((tag) => hasMonitorArmFilterTag(g, tag))
  return hits.length > 1
})
console.log("Multi-match arms:", multiMatch.length)

const anyLoad = arms.filter((g) => loadTags.some((tag) => hasMonitorArmFilterTag(g, tag)))
console.log("Any load tag:", anyLoad.length, "/", arms.length)

for (const weight of [9.0, 9.9, 10.0, 14.9, 15.0]) {
  const matches = loadTags.filter((tag) =>
    arms.some((g) => {
      const h = g.highlights.find((x) => x.label === "耐荷重")?.value ?? ""
      if (!new RegExp(String(weight).replace(".", "\\.")).test(h)) return false
      return hasMonitorArmFilterTag(g, tag)
    }),
  )
  console.log(`~${weight}kg boundary tags:`, matches.map((t) => MONITOR_ARM_FILTER_TAG_LABELS[t]).join(", ") || "none")
}

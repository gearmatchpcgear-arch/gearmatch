import { allSourceGadgets } from "../lib/gadgets.ts"
import {
  inferMonitorResolutionTag,
  getMonitorResolutionDisplay,
  hasMonitorFilterTag,
  MONITOR_FILTER_TAG_LABELS,
} from "../lib/monitor-filter-tags.ts"
import { createFilterMatcher, getFilterGroupsForCategory } from "../lib/gadget-filters.ts"

const monitors = allSourceGadgets.filter((g) => g.category === "monitor")
const groups = getFilterGroupsForCategory("monitor", monitors)
const resGroup = groups.find((g) => g.id === "resolution")

const resTags = [
  "res-fhd",
  "res-wqhd",
  "res-uwqhd",
  "res-4k",
  "res-5k2k",
  "res-dqhd",
  "res-6k",
]

console.log("Total monitors:", monitors.length)
console.log("UI order:", resGroup?.filters.map((f) => f.label).join(" | "))

const noTag = monitors.filter((g) => !inferMonitorResolutionTag(g))
console.log("No resolution tag:", noTag.length)

const counts = {}
for (const tag of resTags) {
  counts[tag] = monitors.filter((g) => hasMonitorFilterTag(g, tag)).length
}
console.log("Counts:", counts)

const anyRes = monitors.filter((g) => resTags.some((t) => hasMonitorFilterTag(g, t)))
console.log("Any of 7 tags:", anyRes.length)

const filterIds = [
  "monitor-res-fhd",
  "monitor-res-wqhd",
  "monitor-res-uwqhd",
  "monitor-res-4k",
  "monitor-res-5k2k",
  "monitor-res-dqhd",
  "monitor-res-6k",
]
const allSelected = createFilterMatcher(filterIds, "monitor", monitors, groups)
console.log("All 7 selected:", monitors.filter((g) => allSelected(g)).length)

console.log("\nUnmatched samples (first 20):")
for (const g of noTag.slice(0, 20)) {
  const h = g.highlights.find((x) => x.label === "解像度")?.value ?? "—"
  console.log(g.id, getMonitorResolutionDisplay(g), "| highlight:", h)
}

const byVal = {}
for (const g of noTag) {
  const h = g.highlights.find((x) => x.label === "解像度")?.value ?? "—"
  byVal[h] = (byVal[h] || 0) + 1
}
console.log("\nUnmatched by highlight:")
for (const [v, c] of Object.entries(byVal).sort((a, b) => b[1] - a[1])) {
  console.log(c, v)
}

const unset = noTag.filter((g) => {
  const h = g.highlights.find((x) => x.label === "解像度")?.value
  return !h || h === "—" || h === "-" || !h.trim()
})
const fhdHighlightMiss = monitors.filter((g) => {
  const h = g.highlights.find((x) => x.label === "解像度")?.value ?? ""
  if (!/fhd|1920|1080p|full\s*hd/i.test(h)) return false
  return !hasMonitorFilterTag(g, "res-fhd")
})
console.log("FHD-like highlight but no res-fhd:", fhdHighlightMiss.length)

const fourKMiss = monitors.filter((g) => {
  const h = g.highlights.find((x) => x.label === "解像度")?.value ?? ""
  if (!/3840|4k|uhd/i.test(h)) return false
  return !hasMonitorFilterTag(g, "res-4k")
})
console.log("4K-like highlight but no res-4k:", fourKMiss.length)

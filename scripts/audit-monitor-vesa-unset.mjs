import { allSourceGadgets, getListableGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"
import { getMonitorVesaFilterTags, hasMonitorVesaFilterTag } from "../lib/monitor-vesa-standard.ts"

const monitors = getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor"))

let highlightUnset = 0
let propFilledHighlightUnset = 0
let bothUnset = 0

for (const g of monitors) {
  const h = g.highlights.find((x) => x.label === "VESA")?.value ?? "—"
  const prop = g.vesaStandard ?? "—"
  const hUnset = !h || h === "—" || h === "-"
  const pUnset = !prop || prop === UNSPECIFIED_SPEC || prop === "—" || prop === "-"

  if (hUnset) highlightUnset++
  if (hUnset && !pUnset) propFilledHighlightUnset++
  if (hUnset && pUnset) bothUnset++
}

console.log({
  total: monitors.length,
  highlightUnset,
  propFilledHighlightUnset,
  bothUnset,
  vesa100: monitors.filter((g) => hasMonitorVesaFilterTag(g, "vesa-100")).length,
  noTags: monitors.filter((g) => getMonitorVesaFilterTags(g).length === 0).length,
})

for (const g of monitors.filter((x) => {
  const h = x.highlights.find((h) => h.label === "VESA")?.value ?? "—"
  return h === "—" || h === "-"
}).slice(0, 5)) {
  console.log(g.id, "highlight:", g.highlights.find((h) => h.label === "VESA")?.value, "prop:", g.vesaStandard, "tags:", getMonitorVesaFilterTags(g))
}

import { allSourceGadgets, getListableGadgets } from "../lib/gadgets.ts"
import { hasMonitorVesaFilterTag } from "../lib/monitor-vesa-standard.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"

const monitors = getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor"))
console.log("listable monitors:", monitors.length)

for (const tag of ["vesa-100", "vesa-75", "vesa-200-plus", "vesa-none"]) {
  const n = monitors.filter((g) => hasMonitorVesaFilterTag(g, tag)).length
  console.log(tag, n)
}

const groups = getFilterGroupsForCategory("monitor", monitors)
console.log(
  "groups:",
  groups.map((g) => `${g.id}(${g.filters.length})`).join(", "),
)
const vesa = groups.find((g) => g.id === "vesa")
console.log("vesa group:", vesa ? vesa.filters.map((f) => f.label).join(" | ") : "MISSING")

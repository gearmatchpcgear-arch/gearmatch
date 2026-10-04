import { allSourceGadgets, getListableGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"
import {
  getMonitorVesaStandardDisplay,
  getMonitorVesaFilterTags,
  hasMonitorVesaFilterTag,
} from "../lib/monitor-vesa-standard.ts"

const monitors = getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor"))

const displayUnset = monitors.filter((g) => getMonitorVesaStandardDisplay(g) === UNSPECIFIED_SPEC)
const displayUnsetWithTags = displayUnset.filter((g) => getMonitorVesaFilterTags(g).length > 0)
const displayUnsetMatching100 = displayUnset.filter((g) => hasMonitorVesaFilterTag(g, "vesa-100"))

console.log({
  total: monitors.length,
  displayUnset: displayUnset.length,
  displayUnsetWithTags: displayUnsetWithTags.length,
  displayUnsetMatching100: displayUnsetMatching100.length,
})

for (const g of displayUnset.slice(0, 5)) {
  console.log(g.id, g.vesaStandard, getMonitorVesaFilterTags(g))
}

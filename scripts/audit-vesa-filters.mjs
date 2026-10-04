import { allSourceGadgets } from "../lib/gadgets.ts"
import { hasMonitorVesaFilterTag, getMonitorVesaStandard } from "../lib/monitor-vesa-standard.ts"
import { UNSPECIFIED_SPEC } from "../lib/gadgets.ts"

const monitors = allSourceGadgets.filter((g) => g.category === "monitor")

const vesa100 = monitors.filter((g) => hasMonitorVesaFilterTag(g, "vesa-100"))
const vesa100Unset = vesa100.filter((g) => {
  const std = getMonitorVesaStandard(g)
  const h = g.highlights.find((x) => /vesa|壁掛け/i.test(x.label))?.value
  const prop = g.vesaStandard
  return (
    (!prop || prop === UNSPECIFIED_SPEC) &&
    (!h || h === UNSPECIFIED_SPEC || h === "—") &&
    std === UNSPECIFIED_SPEC
  )
})
console.log("vesa-100 total:", vesa100.length)
console.log("vesa-100 with fully unset structured data:", vesa100Unset.length)

const vesa100NoProp = vesa100.filter((g) => !g.vesaStandard || g.vesaStandard === UNSPECIFIED_SPEC)
console.log("vesa-100 without vesaStandard prop:", vesa100NoProp.length)

for (const g of vesa100NoProp.slice(0, 8)) {
  const h = g.highlights.find((x) => /vesa|壁掛け/i.test(x.label))?.value ?? "—"
  console.log(g.id, "std:", getMonitorVesaStandard(g), "highlight:", h, "inferred from tagline?")
}

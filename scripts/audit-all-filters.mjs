import { allSourceGadgets } from "../lib/gadgets.ts"
import { hasMonitorVesaFilterTag, getMonitorVesaStandard } from "../lib/monitor-vesa-standard.ts"

const monitors = allSourceGadgets.filter((g) => g.category === "monitor")

for (const tag of ["vesa-100", "vesa-75", "vesa-200-plus", "vesa-none"]) {
  const matched = monitors.filter((g) => hasMonitorVesaFilterTag(g, tag))
  const wrong = matched.filter((g) => {
    const std = String(getMonitorVesaStandard(g))
    if (tag === "vesa-none") return std !== "非対応"
    if (tag === "vesa-100") return !/100\s*[x×]\s*100/.test(std)
    if (tag === "vesa-75") return !/75\s*[x×]\s*75/.test(std)
    if (tag === "vesa-200-plus") return !/200\s*[x×]|以上/.test(std)
    return false
  })
  console.log(tag, "matched:", matched.length, "possible wrong:", wrong.length)
  for (const g of wrong.slice(0, 3)) {
    console.log(" ", g.id, g.vesaStandard, getMonitorVesaStandard(g))
  }
}

// Panel filter with unset panel
import { hasMonitorFilterTag } from "../lib/monitor-filter-tags.ts"
const panelIps = monitors.filter((g) => hasMonitorFilterTag(g, "panel-ips"))
const panelUnset = panelIps.filter((g) => {
  const h = g.highlights.find((x) => x.label === "パネル")?.value ?? "—"
  return h === "—" || !h.trim()
})
console.log("panel-ips:", panelIps.length, "unset panel highlight:", panelUnset.length)

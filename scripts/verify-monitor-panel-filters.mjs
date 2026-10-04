import { allSourceGadgets, getListableGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import {
  getMonitorPanelDisplay,
  hasMonitorFilterTag,
} from "../lib/monitor-filter-tags.ts"

const monitors = getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor"))

const panelGroups = getFilterGroupsForCategory("monitor", monitors).find((g) => g.id === "panel-type")
console.log("Panel UI:", panelGroups?.filters.map((f) => f.label).join(" | "))

const counts = {}
for (const f of panelGroups?.filters ?? []) {
  counts[f.label] = monitors.filter((g) =>
    hasMonitorFilterTag(g, f.id.replace("monitor-", "")),
  ).length
}
console.log("Counts:", counts)

const ips = monitors.filter((g) => hasMonitorFilterTag(g, "panel-ips"))
const fastIpsInIps = ips.filter((g) => /fast\s*ips/i.test(getMonitorPanelDisplay(g)))
console.log("IPS filter total:", ips.length, "Fast IPS leaked:", fastIpsInIps.length)

const tn = monitors.filter((g) => hasMonitorFilterTag(g, "panel-tn"))
const tnMatte = tn.filter((g) => /非光沢/i.test(getMonitorPanelDisplay(g) + (g.highlights.find(h => h.label === "パネル")?.value ?? "")))
console.log("TN filter total:", tn.length, "includes TN非光沢 raw:", tnMatte.length)

const oled = monitors.filter((g) => hasMonitorFilterTag(g, "panel-oled"))
console.log("有機EL filter total:", oled.length)

const unset = monitors.filter((g) => getMonitorPanelDisplay(g) === "—")
const unsetWhenIpsFilter = unset.filter((g) => hasMonitorFilterTag(g, "panel-ips"))
console.log("Unset panel cards:", unset.length, "incorrectly match IPS:", unsetWhenIpsFilter.length)

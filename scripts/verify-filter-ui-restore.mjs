import { allSourceGadgets, getListableGadgets } from "../lib/gadgets.ts"
import { hasMonitorVesaFilterTag } from "../lib/monitor-vesa-standard.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import { hasMicFeatureTag } from "../lib/mic-feature-tags.ts"
import { matchesKeyboardInternalStructureFilterLabel } from "../lib/keyboard-filter-tags.ts"
import { hasMonitorArmFilterTag } from "../lib/monitor-arm-filter-tags.ts"

const monitors = getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor"))
const mics = getListableGadgets(allSourceGadgets.filter((g) => g.category === "mic"))
const keyboards = getListableGadgets(allSourceGadgets.filter((g) => g.category === "keyboard"))
const arms = getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor-arm"))

console.log("=== Monitor VESA ===")
for (const tag of ["vesa-100", "vesa-75", "vesa-none"]) {
  console.log(tag, monitors.filter((g) => hasMonitorVesaFilterTag(g, tag)).length)
}
const monitorGroups = getFilterGroupsForCategory("monitor", monitors)
console.log(
  "VESA UI:",
  monitorGroups.find((g) => g.id === "vesa")?.filters.map((f) => f.label).join(" | ") ?? "MISSING",
)

console.log("\n=== Mic features ===")
console.log(
  "ノイズキャンセリング",
  mics.filter((g) => hasMicFeatureTag(g, "ノイズキャンセリング")).length,
)
console.log("ASMR", mics.filter((g) => hasMicFeatureTag(g, "ASMR")).length)
const micGroups = getFilterGroupsForCategory("mic", mics)
console.log(
  "機能 UI:",
  micGroups.find((g) => g.id === "mic-feature")?.filters.map((f) => f.label).join(" | ") ?? "MISSING",
)

console.log("\n=== Keyboard internal structure ===")
console.log(
  "メカニカル",
  keyboards.filter((g) => matchesKeyboardInternalStructureFilterLabel(g, "メカニカル")).length,
)
const kbGroups = getFilterGroupsForCategory("keyboard", keyboards)
console.log(
  "内部構造 UI:",
  kbGroups
    .find((g) => g.id === "internal-structure")
    ?.filters.map((f) => f.label)
    .join(" | ") ?? "MISSING",
)

console.log("\n=== Monitor arm load ===")
for (const [tag, label] of [
  ["load-up-to-9", "9kg以下"],
  ["load-10-14", "10〜14kg"],
  ["load-15-plus", "15kg以上"],
]) {
  console.log(label, arms.filter((g) => hasMonitorArmFilterTag(g, tag)).length)
}
const armGroups = getFilterGroupsForCategory("monitor-arm", arms)
console.log(
  "耐荷重 UI:",
  armGroups.find((g) => g.id === "arm-load")?.filters.map((f) => f.label).join(" | ") ?? "MISSING",
)

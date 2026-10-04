/**
 * Verify monitor page2 catalog + filter tags
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath, pathToFileURL } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const { monitorBestsellers } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-bestsellers.ts")).href
)
const { monitorBestsellersPage2 } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-bestsellers-page2.ts")).href
)
const { hasMonitorFilterTag } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-filter-tags.ts")).href
)

const page2Asins = new Set(monitorBestsellersPage2.map((g) => g.purchaseUrl))
const page1Overlap = monitorBestsellers.filter((g) => page2Asins.has(g.purchaseUrl))

const merged = [
  ...monitorBestsellers,
  ...monitorBestsellersPage2.filter(
    (g) => !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
]

const checks = [
  { label: "4K", tag: "res-4k", expect: ["EV2740S-AMZBK", "27U711B-B", "27M2U", "EW2880U", "MD271UL", "32UN880-B"] },
  { label: "WQHD", tag: "res-wqhd", expect: ["EX-GDQ271UA", "PG27AQDM", "PX277 PRO", "27GP850-B", "PA278QV"] },
  { label: "240Hz+", tag: "refresh-240-plus", expect: ["EX-GD251UH", "H27F7", "EX-GD254U", "XL2546K", "MFG25X1"] },
  { label: "USB-C", tag: "port-usb-c", expect: ["EV2740S-AMZBK", "DP-FF164S-B", "27M2U", "PX277 PRO"] },
]

console.log("Page2 count:", monitorBestsellersPage2.length)
console.log("Page1+Page2 merged monitors:", merged.length)
console.log("Page1 URL overlaps:", page1Overlap.length, page1Overlap.map((g) => g.name))
console.log("#51:", monitorBestsellersPage2[0]?.name, monitorBestsellersPage2[0]?.specGroups[0]?.rows.find((r) => r.label === "Amazon売れ筋")?.value)
console.log("#100:", monitorBestsellersPage2.at(-1)?.name, monitorBestsellersPage2.at(-1)?.specGroups[0]?.rows.find((r) => r.label === "Amazon売れ筋")?.value)

for (const { label, tag, expect } of checks) {
  const hits = merged.filter((g) => hasMonitorFilterTag(g, tag))
  const missing = expect.filter((name) => !hits.some((g) => g.name.includes(name.split("-")[0]) || g.name === name))
  console.log(`Filter ${label} (${tag}): ${hits.length} items, sample missing:`, missing.slice(0, 3))
}

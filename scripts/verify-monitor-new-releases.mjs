/**
 * Verify monitor new releases catalog + merge + filter tags
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
const { monitorPremiumGaming } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-premium-gaming.ts")).href
)
const { monitorNewReleases } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-new-releases.ts")).href
)
const { hasMonitorFilterTag } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-filter-tags.ts")).href
)

const existingUrls = new Set([
  ...monitorBestsellers,
  ...monitorBestsellersPage2,
  ...monitorPremiumGaming,
].map((g) => g.purchaseUrl))

const mergedNew = monitorNewReleases.filter((g) => !existingUrls.has(g.purchaseUrl))
const overlap = monitorNewReleases.filter((g) => existingUrls.has(g.purchaseUrl))

const allMonitors = [
  ...monitorBestsellers,
  ...monitorBestsellersPage2.filter(
    (g) => !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorPremiumGaming.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mergedNew,
]

console.log("New releases raw:", monitorNewReleases.length)
console.log("Overlap with bestsellers/premium:", overlap.length, overlap.map((g) => g.name).slice(0, 5))
console.log("Merged new (unique):", mergedNew.length)
console.log("Total monitors after merge:", allMonitors.length)
console.log("#1:", monitorNewReleases[0]?.name, monitorNewReleases[0]?.specGroups[0]?.rows.find((r) => r.label === "Amazon新着")?.value)
console.log("#80:", monitorNewReleases.at(-1)?.name)

const checks = [
  { label: "4K", tag: "res-4k" },
  { label: "WQHD", tag: "res-wqhd" },
  { label: "240Hz+", tag: "refresh-240-plus" },
  { label: "USB-C", tag: "port-usb-c" },
]

for (const { label, tag } of checks) {
  const nrHits = mergedNew.filter((g) => hasMonitorFilterTag(g, tag))
  const allHits = allMonitors.filter((g) => hasMonitorFilterTag(g, tag))
  console.log(`Filter ${label} (${tag}): new=${nrHits.length}, total=${allHits.length}`)
}

const noTags = mergedNew.filter((g) => !g.monitorFilterTags?.length)
console.log("New items without filter tags:", noTags.length, noTags.map((g) => g.name).slice(0, 5))

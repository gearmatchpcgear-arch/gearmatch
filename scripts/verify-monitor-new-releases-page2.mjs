/**
 * Verify monitor new releases page1 + page2 merge + filter tags
 */
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
const { monitorNewReleasesPage2 } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-new-releases-page2.ts")).href
)
const { hasMonitorFilterTag } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-filter-tags.ts")).href
)

const existingUrls = new Set([
  ...monitorBestsellers,
  ...monitorBestsellersPage2,
  ...monitorPremiumGaming,
].map((g) => g.purchaseUrl))

const mergedPage1 = monitorNewReleases.filter((g) => !existingUrls.has(g.purchaseUrl))
const mergedPage2 = monitorNewReleasesPage2.filter(
  (g) =>
    !existingUrls.has(g.purchaseUrl) &&
    !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl),
)

console.log("New releases pg1:", monitorNewReleases.length, "merged:", mergedPage1.length)
console.log("New releases pg2:", monitorNewReleasesPage2.length, "merged:", mergedPage2.length)
console.log(
  "#51:",
  monitorNewReleasesPage2[0]?.name,
  monitorNewReleasesPage2[0]?.specGroups[0]?.rows.find((r) => r.label === "Amazon新着")?.value,
)
console.log(
  "#80:",
  monitorNewReleasesPage2.at(-1)?.name,
  monitorNewReleasesPage2.at(-1)?.specGroups[0]?.rows.find((r) => r.label === "Amazon新着")?.value,
)

const samples = [
  { label: "EVICIV #51", match: (g) => g.name.includes("EVC-160U") },
  { label: "KOORUI Mini LED #52", match: (g) => g.brand === "KOORUI" && g.tagline.includes("Mini LED") },
  { label: "JAPANNEXT 34\" #53", match: (g) => g.name.includes("JN-IPS34G165UQ2") },
  { label: "ASUS ZenScreen #54", match: (g) => g.name.includes("MB16FC-J") },
  { label: "VisionOwl #55", match: (g) => g.brand === "VisionOwl" },
]

for (const { label, match } of samples) {
  const hit = monitorNewReleasesPage2.find(match)
  console.log(`${label}:`, hit ? `OK ¥${hit.price} tags=${hit.monitorFilterTags?.length}` : "MISSING")
}

const checks = [
  { label: "4K", tag: "res-4k" },
  { label: "WQHD", tag: "res-wqhd" },
  { label: "240Hz+", tag: "refresh-240-plus" },
  { label: "USB-C", tag: "port-usb-c" },
]

for (const { label, tag } of checks) {
  const pg2 = mergedPage2.filter((g) => hasMonitorFilterTag(g, tag))
  console.log(`Filter ${label} pg2: ${pg2.length} items`)
}

const noTags = mergedPage2.filter((g) => !g.monitorFilterTags?.length)
console.log("Pg2 without filter tags:", noTags.length)

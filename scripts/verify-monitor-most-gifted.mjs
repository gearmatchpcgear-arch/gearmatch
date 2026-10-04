/**
 * Verify monitor most-gifted catalog + merge + filter tags
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
const { monitorMostGifted } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-most-gifted.ts")).href
)
const { hasMonitorFilterTag } = await import(
  pathToFileURL(join(ROOT, "lib", "monitor-filter-tags.ts")).href
)

const existingUrls = new Set([
  ...monitorBestsellers,
  ...monitorBestsellersPage2,
  ...monitorPremiumGaming,
  ...monitorNewReleases,
  ...monitorNewReleasesPage2,
].map((g) => g.purchaseUrl))

const merged = monitorMostGifted.filter((g) => !existingUrls.has(g.purchaseUrl))
const overlap = monitorMostGifted.filter((g) => existingUrls.has(g.purchaseUrl))

console.log("Most gifted raw:", monitorMostGifted.length)
console.log("Overlap with existing:", overlap.length, overlap.map((g) => g.name).slice(0, 8))
console.log("Merged unique:", merged.length)
console.log(
  "#1:",
  monitorMostGifted[0]?.name,
  monitorMostGifted[0]?.specGroups[0]?.rows.find((r) => r.label === "Amazonギフト")?.value,
)
console.log(
  "#12 Dell:",
  monitorMostGifted.find((g) => g.name === "S2725DC")?.price,
  monitorMostGifted.find((g) => g.name === "S2725DC")?.specGroups[0]?.rows.find((r) => r.label === "Amazonギフト")?.value,
)

const samples = [
  { label: "KEEPTIME #23", match: (g) => g.brand === "KEEPTIME" },
  { label: "Pixio #3", match: (g) => g.name.includes("PX248Wave") },
  { label: "BenQ EX251 #28", match: (g) => g.name === "EX251" },
  { label: "cocopar 240Hz", match: (g) => g.brand === "cocopar" },
]

for (const { label, match } of samples) {
  const hit = monitorMostGifted.find(match)
  console.log(`${label}:`, hit ? `OK ¥${hit.price} tags=${hit.monitorFilterTags?.length}` : "MISSING")
}

const checks = [
  { label: "4K", tag: "res-4k" },
  { label: "WQHD", tag: "res-wqhd" },
  { label: "240Hz+", tag: "refresh-240-plus" },
  { label: "USB-C", tag: "port-usb-c" },
]

for (const { label, tag } of checks) {
  const hits = monitorMostGifted.filter((g) => hasMonitorFilterTag(g, tag))
  console.log(`Filter ${label}: ${hits.length} gifted items`)
}

const noTags = monitorMostGifted.filter((g) => !g.monitorFilterTags?.length)
console.log("Without filter tags:", noTags.length)

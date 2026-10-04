/**
 * Audit monitor resolution consistency (stored vs inferred from name/tagline/Amazon title).
 *
 * Usage: npx tsx scripts/audit-monitor-resolution.ts
 */
import { writeFileSync } from "fs"
import {
  allSourceGadgets,
  getCardHighlights,
} from "../lib/gadgets.ts"
import type { Gadget } from "../lib/gadgets.ts"
import {
  getMonitorResolutionDisplay,
  inferMonitorResolutionTag,
} from "../lib/monitor-filter-tags.ts"

const RES_TAGS = ["res-fhd", "res-wqhd", "res-uwqhd", "res-4k", "res-6k", "res-5k2k", "res-dqhd"]

function haystack(g: Gadget) {
  return `${g.name} ${g.tagline} ${g.highlights.find((h) => h.label === "解像度")?.value ?? ""}`
}

function inferExpectedTag(g: Gadget) {
  const hay = haystack(g).toLowerCase()
  if (/6016\s*[x×]\s*3384|\b6k\b/i.test(hay)) return "res-6k"
  if (/5120\s*[x×]\s*2160|5k2k/i.test(hay)) return "res-5k2k"
  if (/5120\s*[x×]\s*1440|5k\s*dqhd|\bdqhd\b/i.test(hay)) return "res-dqhd"
  if (/3840\s*[x×]\s*2160|\b4k\b|４Ｋ/i.test(hay)) return "res-4k"
  if (/3440\s*[x×]\s*1440|uwqhd|ultrawide\s*qhd/i.test(hay)) return "res-uwqhd"
  if (/2560\s*[x×]\s*1440|2\.5k|wqhd|1440p|(?<![uw-])qhd\b/i.test(hay)) return "res-wqhd"
  if (/1920\s*[x×]\s*1080|\bfhd\b|1080p|フル\s*hd|フルhd|1080\s*p/i.test(hay)) return "res-fhd"
  return null
}

const monitors = allSourceGadgets.filter((g) => g.category === "monitor")
const mismatches = []

for (const g of monitors) {
  const storedTag =
    g.monitorFilterTags?.find((t) => RES_TAGS.includes(t)) ?? inferMonitorResolutionTag(g)
  const expectedTag = inferExpectedTag(g)
  const display = getMonitorResolutionDisplay(g)
  const hl = getCardHighlights(g).find((h) => h.label === "解像度")?.value

  if (!expectedTag) continue
  if (storedTag === expectedTag) continue

  const specVal =
    g.specGroups.flatMap((sg) => sg.rows).find((r) => r.label === "解像度")?.value ?? "—"

  mismatches.push({
    id: g.id,
    asin: g.purchaseUrl?.match(/\/dp\/([A-Z0-9]{10})/)?.[1],
    name: g.name.slice(0, 60),
    storedTag,
    expectedTag,
    display,
    highlight: hl,
    spec: specVal,
    hay: haystack(g).slice(0, 120),
  })
}

writeFileSync(
  "scripts/_monitor-resolution-audit.json",
  JSON.stringify({ total: monitors.length, mismatchCount: mismatches.length, mismatches }, null, 2),
)
console.log(`Monitors: ${monitors.length}, resolution mismatches: ${mismatches.length}`)

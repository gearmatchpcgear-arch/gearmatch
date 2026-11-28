/**
 * Mouse max DPI parse + filter bucket distribution.
 * Usage: npx tsx scripts/audit-mouse-dpi-ranges.mjs
 */
import { allSourceGadgets } from "../lib/gadgets.ts"
import {
  parseMouseMaxDpiFromText,
  parseMouseMaxDpiNumber,
  readMouseSensitivityRaw,
} from "../lib/mouse-sensitivity-display.ts"
import { inferMouseDpiTags } from "../lib/mouse-card-filter-tags.ts"

const mice = allSourceGadgets.filter((g) => g.category === "mouse")

const samples = [
  ["18,000 DPI", 18000],
  ["30000DPI", 30000],
  ["45K", 45000],
  ["26K DPI", 26000],
  ["800/1200/1600", 1600],
  ["8,000", 8000],
  ["—", null],
]

console.log("parseMouseMaxDpiFromText samples:")
for (const [text, expected] of samples) {
  const got = parseMouseMaxDpiFromText(text)
  const ok = got === expected ? "ok" : `expected ${expected}`
  console.log(`  ${JSON.stringify(text)} → ${got} (${ok})`)
}

const buckets = {
  "dpi-up-to-4000": 0,
  "dpi-4001-16000": 0,
  "dpi-16001-26000": 0,
  "dpi-26001-plus": 0,
  unset: 0,
}

const unsetIds = []
for (const g of mice) {
  const tags = inferMouseDpiTags(g)
  if (tags.length === 0) {
    buckets.unset++
    const raw = readMouseSensitivityRaw(g)
    if (raw) unsetIds.push({ id: g.id, raw })
    continue
  }
  buckets[tags[0]]++
}

console.log(`\n${mice.length} mice:`)
console.log(buckets)
if (unsetIds.length > 0 && unsetIds.length <= 15) {
  console.log("unset but raw present:", unsetIds)
} else if (unsetIds.length > 15) {
  console.log(`unset with raw present: ${unsetIds.length} (first 5)`, unsetIds.slice(0, 5))
}

const high = mice
  .map((g) => ({ id: g.id, dpi: parseMouseMaxDpiNumber(g) }))
  .filter((x) => x.dpi != null)
  .sort((a, b) => b.dpi - a.dpi)
  .slice(0, 5)
console.log("\nTop DPI:", high)
import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { isGamingChairListedInCsv } from "../lib/gaming-chairs-csv-data.ts"
import {
  GAMING_CHAIR_SHAPE_FILTER_OPTIONS,
  getGamingChairFilterShape,
  gamingChairMatchesShapeFilterOption,
  hasGamingChairFilterTag,
} from "../lib/gaming-chair-filter-tags.ts"

const chairs = getListableGadgets(gadgets, false).filter(
  (g) => g.category === "gaming-chair" && isGamingChairListedInCsv(g),
)

const counts = Object.fromEntries(GAMING_CHAIR_SHAPE_FILTER_OPTIONS.map((o) => [o, 0]))
for (const c of chairs) {
  const shape = getGamingChairFilterShape(c)
  for (const opt of GAMING_CHAIR_SHAPE_FILTER_OPTIONS) {
    if (gamingChairMatchesShapeFilterOption(shape, opt)) counts[opt]++
  }
}

const tagIds = ["style-bucket", "style-queen", "style-floor", "style-other"]
const tagCounts = Object.fromEntries(
  tagIds.map((t) => [t, chairs.filter((c) => hasGamingChairFilterTag(c, t)).length]),
)

console.log(JSON.stringify({ listed: chairs.length, optionCounts: counts, tagCounts }, null, 2))

let mismatch = 0
for (const c of chairs) {
  const shape = getGamingChairFilterShape(c)
  for (let i = 0; i < GAMING_CHAIR_SHAPE_FILTER_OPTIONS.length; i++) {
    const opt = GAMING_CHAIR_SHAPE_FILTER_OPTIONS[i]
    const tag = tagIds[i]
    const byOpt = gamingChairMatchesShapeFilterOption(shape, opt)
    const byTag = hasGamingChairFilterTag(c, tag)
    if (byOpt !== byTag) mismatch++
  }
}
console.log("tag vs option mismatches", mismatch)
process.exit(mismatch > 0 ? 1 : 0)

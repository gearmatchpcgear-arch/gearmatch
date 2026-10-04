import {
  filterGadgetsByCategory,
  gadgets,
  getListableGadgets,
} from "../lib/gadgets.ts"
import {
  getCanonicalGamingChairMaterialTag,
  inferGamingChairFilterTagsMerged,
} from "../lib/gaming-chair-filter-tags.ts"

const MATERIAL_TAGS = ["mat-pu", "mat-mesh", "mat-fabric", "mat-leather"]

const chairs = filterGadgetsByCategory(getListableGadgets(gadgets, false), "gaming-chair")
let mismatches = 0

for (const g of chairs) {
  const canonical = getCanonicalGamingChairMaterialTag(g)
  const merged = inferGamingChairFilterTagsMerged(g)
  const matTags = merged.filter((t) => MATERIAL_TAGS.includes(t))
  const ok =
    canonical == null
      ? matTags.length === 0
      : matTags.length === 1 && matTags[0] === canonical
  if (!ok) {
    mismatches++
    console.log(g.id, "material tag(s)", matTags, "expected", canonical)
  }
}

console.log("chairs", chairs.length, "mismatches", mismatches)

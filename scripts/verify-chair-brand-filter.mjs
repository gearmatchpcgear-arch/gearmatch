import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { matchesAllFilters } from "../lib/gadget-filters.ts"
import { matchesGamingChairBrandFilterId } from "../lib/gaming-chair-brand-filters.ts"

const list = getListableGadgets(gadgets, false).filter((g) => g.category === "gaming-chair")
const akr = list.filter((g) => matchesGamingChairBrandFilterId(g, "chair-brand-akracing"))
const filtered = list.filter((g) => matchesAllFilters(g, ["chair-brand-akracing"], "gaming-chair"))
console.log({ total: list.length, akr: akr.length, filtered: filtered.length })

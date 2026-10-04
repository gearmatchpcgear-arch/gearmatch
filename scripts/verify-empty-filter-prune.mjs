/**
 * Verify filter groups hide zero-match options.
 */
import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"

const listable = getListableGadgets(gadgets, false)
const categories = [
  "mic",
  "mouse",
  "keyboard",
  "camera",
  "monitor",
  "monitor-arm",
  "gaming-chair",
  "audio-interface",
]

for (const category of categories) {
  const pool = listable.filter((g) => g.category === category)
  const groups = getFilterGroupsForCategory(category, listable)
  let zeroFound = 0
  for (const group of groups) {
    for (const filter of group.filters) {
      const count = pool.filter((g) => filter.match(g)).length
      if (count === 0) {
        zeroFound++
        console.log(`ZERO ${category}/${group.id}/${filter.id} (${filter.label})`)
      }
    }
  }
  const micHeadset = groups
    .flatMap((g) => g.filters)
    .find((f) => f.id === "mic-type-headset")
  if (category === "mic") {
    console.log(
      `mic: pool=${pool.length} groups=${groups.length} zero=${zeroFound} headsetVisible=${Boolean(micHeadset)}`,
    )
  }
}

const allGroups = getFilterGroupsForCategory("all", listable)
console.log(`all: groups=${allGroups.length} filters=${allGroups.flatMap((g) => g.filters).length}`)

import { writeFileSync } from "fs"
import { gadgets, allSourceGadgets, getCardHighlights, isCardSpecValueFilled, countCardHighlightsFilled } from "../lib/gadgets.ts"

function auditList(list) {
  const monitors = list.filter((g) => g.category === "monitor")
  const bad = monitors
    .filter((g) => countCardHighlightsFilled(g) <= 2)
    .map((g) => {
      const hl = getCardHighlights(g)
      return {
        id: g.id,
        missing: hl.filter((h) => !isCardSpecValueFilled(h.value)).map((h) => h.label),
      }
    })
  return { total: monitors.length, badCount: bad.length, bad }
}

const source = auditList(allSourceGadgets)
const listed = auditList(gadgets)
writeFileSync("scripts/_monitor-card-audit-live.json", JSON.stringify({ source, listed }, null, 2))
console.log(`source: ${source.total} monitors, ${source.badCount} with 2+ missing`)
console.log(`listed: ${listed.total} monitors, ${listed.badCount} with 2+ missing`)

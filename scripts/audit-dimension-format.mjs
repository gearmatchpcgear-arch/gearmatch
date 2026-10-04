import { formatDimensions } from "../lib/gaming-chair-dimension-display.ts"
import { GAMING_CHAIRS_CSV_BY_ID } from "../lib/gaming-chairs-csv-data.generated.ts"

const all = Object.values(GAMING_CHAIRS_CSV_BY_ID).filter((r) => r.dimensions?.trim())
const bad = all.filter((r) => {
  const out = formatDimensions(r.dimensions)
  return out !== "-" && !/^W:\s*.+ × D:\s*.+ × H:\s*.+$/i.test(out)
})

console.log("with dimensions", all.length, "not W/D/H format", bad.length)
for (const r of bad.slice(0, 20)) {
  console.log(r.id, "|", r.dimensions, "->", formatDimensions(r.dimensions))
}

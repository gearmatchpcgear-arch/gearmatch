import { gadgets, getListableGadgets } from "../lib/gadgets.ts"
import { formatGamingChairCsvOttoman, isGamingChairListedInCsv } from "../lib/gaming-chairs-csv-data.ts"
import { getGamingChairCsvRow } from "../lib/gaming-chairs-csv-data.ts"
import {
  getGamingChairOttomanFilterValue,
  hasGamingChairFilterTag,
} from "../lib/gaming-chair-filter-tags.ts"

const chairs = getListableGadgets(gadgets, false).filter(
  (g) => g.category === "gaming-chair" && isGamingChairListedInCsv(g),
)

let csvYes = 0
let filterYes = 0
let falsePositive = 0
let falseNegative = 0

for (const c of chairs) {
  const row = getGamingChairCsvRow(c.id)
  const csvVal = row?.ottoman ? formatGamingChairCsvOttoman(row.ottoman) : ""
  const expectYes =
    c.hasOttoman === true ||
    csvVal === "あり" ||
    (typeof c.hasOttoman !== "boolean" && csvVal === "あり")

  const strictYes =
    getGamingChairOttomanFilterValue(c) === "あり"
  const tagYes = hasGamingChairFilterTag(c, "ottoman-yes")

  if (csvVal === "あり" || c.hasOttoman === true) csvYes++
  if (tagYes) filterYes++

  if (tagYes && getGamingChairOttomanFilterValue(c) !== "あり") falsePositive++
  if (!tagYes && getGamingChairOttomanFilterValue(c) === "あり") falseNegative++
}

console.log(
  JSON.stringify(
    {
      listed: chairs.length,
      filterOttomanYes: filterYes,
      csvOrFlagYes: csvYes,
      falsePositive,
      falseNegative,
    },
    null,
    2,
  ),
)

process.exit(falsePositive > 0 || falseNegative > 0 ? 1 : 0)

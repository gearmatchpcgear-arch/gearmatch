import { createRequire } from "node:module"
import { allSourceGadgets, getListableGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"

const require = createRequire(import.meta.url)
const XLSX = require("xlsx")

const wb = XLSX.readFile("D:/ダウンロード/monitors.xlsx")
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" })

function isMissing(v) {
  if (v == null) return true
  const t = String(v).trim()
  return !t || t === "-" || t === "—"
}

const sheet = new Map()
for (const cols of rows.slice(1)) {
  const id = String(cols[0] ?? "").trim()
  if (!id) continue
  sheet.set(id, cols[8])
}

const ids = [
  "mon-bs-044",
  "mon-pg-019",
  "mon-pg-023",
  "mon-nr-004",
  "mon-nr-006",
  "mon-nr2-011",
  "mon-gift-008",
  "mon-gift-009",
  "mon-lenovo-045",
]

const listable = new Set(
  getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor")).map((g) => g.id),
)

for (const id of ids) {
  const g = allSourceGadgets.find((x) => x.id === id)
  console.log(id, {
    listable: listable.has(id),
    sheet: sheet.get(id),
    sheetMissing: isMissing(sheet.get(id)),
    prop: g?.vesaStandard,
  })
}

import { createRequire } from "node:module"
import { allSourceGadgets, getListableGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"
import {
  getMonitorVesaStandardDisplay,
  getMonitorVesaFilterTags,
  hasMonitorVesaFilterTag,
} from "../lib/monitor-vesa-standard.ts"

const require = createRequire(import.meta.url)
const XLSX = require("xlsx")

const wb = XLSX.readFile("D:/ダウンロード/monitors.xlsx")
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

function isMissing(v) {
  if (v == null) return true
  const t = String(v).trim()
  return !t || t === "-" || t === "—"
}

const sheetVesa = new Map()
for (const cols of rows.slice(1)) {
  const id = String(cols[0] ?? "").trim()
  if (!id) continue
  sheetVesa.set(id, cols[8])
}

const g = allSourceGadgets.find((x) => x.id === "mon-bs-050")
console.log("mon-bs-050", {
  sheet: sheetVesa.get("mon-bs-050"),
  sheetMissing: isMissing(sheetVesa.get("mon-bs-050")),
  prop: g?.vesaStandard,
})

const monitors = getListableGadgets(allSourceGadgets.filter((x) => x.category === "monitor"))
const bad = monitors.filter((g) => {
  const displayUnset = getMonitorVesaStandardDisplay(g) === UNSPECIFIED_SPEC
  const tags = getMonitorVesaFilterTags(g)
  return displayUnset && tags.length > 0
})

console.log(
  "displayUnsetWithTags",
  bad.map((g) => ({
    id: g.id,
    prop: g.vesaStandard,
    tags: getMonitorVesaFilterTags(g),
    v100: hasMonitorVesaFilterTag(g, "vesa-100"),
  })),
)

const stillFilled = monitors.filter((g) => {
  const sheet = sheetVesa.get(g.id)
  return isMissing(sheet) && g.vesaStandard !== UNSPECIFIED_SPEC
})
console.log("stillFilledWhenSheetMissing", stillFilled.length, stillFilled.map((g) => g.id))

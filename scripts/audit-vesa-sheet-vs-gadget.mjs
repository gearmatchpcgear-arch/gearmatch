import { createRequire } from "node:module"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, getListableGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"

const require = createRequire(import.meta.url)
const XLSX = require("xlsx")

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const wb = XLSX.readFile("D:/ダウンロード/monitors.xlsx")
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

function isMissing(v) {
  if (v == null) return true
  const t = String(v).trim()
  return !t || t === "-" || t === "—"
}

const existingIds = new Set()
for (const file of fs.readdirSync(path.join(root, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = fs.readFileSync(path.join(root, "lib", file), "utf8")
  if (!src.includes('category: "monitor"')) continue
  for (const m of src.matchAll(/id: "(mon-[^"]+)"/g)) existingIds.add(m[1])
}

const listable = new Set(getListableGadgets(allSourceGadgets.filter((g) => g.category === "monitor")).map((g) => g.id))
const gadgetById = new Map(allSourceGadgets.filter((g) => g.category === "monitor").map((g) => [g.id, g]))

const missingInSheet = []
for (const cols of rows.slice(1)) {
  const id = String(cols[0] ?? "").trim()
  if (!id || !existingIds.has(id)) continue
  if (isMissing(cols[8])) missingInSheet.push(id)
}

const listableMissing = missingInSheet.filter((id) => listable.has(id))
const propNotDash = listableMissing.filter((id) => gadgetById.get(id)?.vesaStandard !== UNSPECIFIED_SPEC)

console.log({
  missingInSheet: missingInSheet.length,
  listableMissing: listableMissing.length,
  propNotDash: propNotDash.length,
  sample: propNotDash.slice(0, 10).map((id) => ({
    id,
    prop: gadgetById.get(id)?.vesaStandard,
  })),
})

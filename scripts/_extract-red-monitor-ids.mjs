import { createRequire } from "node:module"
import fs from "node:fs"

const require = createRequire(import.meta.url)
const XLSX = require("xlsx")

const path = "D:/ダウンロード/monitors.xlsx"
const wb = XLSX.readFile(path, { cellStyles: true, bookVBA: true })
console.log("sheets", wb.SheetNames)

const sheetName = wb.SheetNames[0]
const sheet = wb.Sheets[sheetName]
const ref = sheet["!ref"]
console.log("ref", ref)

const range = XLSX.utils.decode_range(ref)
const redIds = []
const sampleCells = []

for (let r = range.s.r + 1; r <= range.e.r; r++) {
  const addr = XLSX.utils.encode_cell({ r, c: 0 })
  const cell = sheet[addr]
  if (!cell) continue
  const id = String(cell.v ?? "").trim()
  if (!id) continue

  const style = cell.s ?? cell.style
  if (sampleCells.length < 5) sampleCells.push({ addr, id, style, keys: Object.keys(cell) })

  const fill = style?.fgColor ?? style?.fill?.fgColor ?? style?.patternFill?.fgColor
  const rgb = fill?.rgb ?? fill?.ARGB ?? fill?.argb
  const theme = fill?.theme
  const indexed = fill?.indexed

  const isRed =
    (typeof rgb === "string" && /FF0000/i.test(rgb.replace(/^FF/i, ""))) ||
    rgb === "FFFF0000" ||
    rgb === "FF0000"

  if (isRed) redIds.push(id)
}

console.log("sampleCells", JSON.stringify(sampleCells, null, 2))
console.log("redIds from xlsx styles", redIds.length, redIds)

// verify with exceljs
try {
  const ExcelJS = require("exceljs")
  const wb2 = new ExcelJS.Workbook()
  await wb2.xlsx.readFile(path)
  const ws = wb2.worksheets[0]
  const red2 = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const cell = row.getCell(1)
    const id = String(cell.value ?? "").trim()
    if (!id) return
    const fill = cell.fill
    const argb = fill?.type === "pattern" ? fill.fgColor?.argb : undefined
    if (argb && /FF0000$/i.test(argb)) red2.push(id)
  })
  console.log("redIds exceljs", red2.length, red2)
  fs.writeFileSync(
    path.join("scripts", "monitor-red-delete-ids.json"),
    JSON.stringify(red2, null, 2),
  )
} catch (e) {
  console.log("exceljs error", e.message)
}

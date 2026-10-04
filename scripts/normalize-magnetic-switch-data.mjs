/**
 * Normalize magnetic switch internal structure values in keyboard data + CSV.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

function normalizeStoredInternalStructure(value) {
  const trimmed = String(value ?? "").trim()
  if (!trimmed || trimmed === "—") return trimmed
  if (trimmed === "磁器スイッチ") return "磁気スイッチ"
  if (/^メカニカル[（(]磁気スイッチ/u.test(trimmed)) return "磁気スイッチ"
  if (/^静電容量無接点方式[（(]\s*\d+\s*g\s*[）)]?\s*$/iu.test(trimmed)) return "静電容量無接点方式"
  if (/^メカニカル\s*[（(]\s*GX\s*Red\b/i.test(trimmed)) return "メカニカル（赤軸）"
  if (/^メカニカル\s*[（(]\s*イエロー軸\s*[）)]/u.test(trimmed)) return "メカニカル（黄軸）"
  if (trimmed === "イエロー軸") return "メカニカル（黄軸）"
  return trimmed
}

function normalizeInternalStructureFieldInSource(src) {
  return src.replace(
    /(\{ label: "内部構造", value: ")([^"]*)(" \})/g,
    (full, pre, value, post) => {
      const next = normalizeStoredInternalStructure(value)
      return next === value ? full : `${pre}${next}${post}`
    },
  )
}

let tsUpdated = 0
for (const file of fs.readdirSync(path.join(ROOT, "lib"))) {
  if (!file.startsWith("keyboard-") || !file.endsWith(".ts")) continue
  const filePath = path.join(ROOT, "lib", file)
  const src = fs.readFileSync(filePath, "utf8")
  const next = normalizeInternalStructureFieldInSource(src)
  if (next !== src) {
    fs.writeFileSync(filePath, next)
    tsUpdated++
  }
}

const csvPaths = [
  path.join(ROOT, "keyboard_gadgets.csv"),
  path.join(ROOT, "..", "keyboard_gadgets.csv"),
]
let csvUpdated = 0
for (const csvPath of csvPaths) {
  if (!fs.existsSync(csvPath)) continue
  const lines = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)
  let fileUpdated = 0
  const out = lines.map((line, index) => {
    if (index === 0 || !line.trim()) return line
    const cols = []
    let cur = ""
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"'
          i++
        } else if (c === '"') inQ = false
        else cur += c
      } else if (c === ",") {
        cols.push(cur)
        cur = ""
      } else if (c === '"') inQ = true
      else cur += c
    }
    cols.push(cur)
    if (cols.length < 6) return line
    const normalized = normalizeStoredInternalStructure(cols[5])
    if (normalized === cols[5]) return line
    cols[5] = normalized
    fileUpdated++
    return cols
      .map((cell) => (/[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell))
      .join(",")
  })
  if (fileUpdated > 0) {
    fs.writeFileSync(csvPath, `\uFEFF${out.join("\n")}\n`, "utf8")
  }
  csvUpdated += fileUpdated
  console.log(`Updated ${fileUpdated} rows in ${csvPath}`)
}

console.log(`Updated ${tsUpdated} keyboard lib files`)
console.log(`Updated ${csvUpdated} CSV rows total`)

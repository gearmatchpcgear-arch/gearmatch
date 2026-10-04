/**
 * lib/*.ts からガジェットブロックを削除し、chair-* は gaming_chairs.csv からも除去
 */
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { parseGadgetBlocks } from "./used-refurbished-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const csvPath = path.join(root, "gaming_chairs.csv")

function cleanupCommas(text) {
  return text
    .replace(/,\s*,/g, ",")
    .replace(/\[\s*,/g, "[")
    .replace(/,\s*\]/g, "]")
}

function removeBlockRange(content, start, end) {
  let sliceStart = start
  let sliceEnd = end

  while (sliceEnd < content.length && /\s/.test(content[sliceEnd])) sliceEnd++
  if (content[sliceEnd] === ",") {
    sliceEnd++
    while (sliceEnd < content.length && /\s/.test(content[sliceEnd])) sliceEnd++
  } else {
    while (sliceStart > 0 && /\s/.test(content[sliceStart - 1])) sliceStart--
    if (sliceStart > 0 && content[sliceStart - 1] === ",") {
      sliceStart--
      while (sliceStart > 0 && /\s/.test(content[sliceStart - 1])) sliceStart--
    }
  }

  return content.slice(0, sliceStart) + content.slice(sliceEnd)
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
      continue
    }
    if (c === '"') {
      inQuotes = true
      continue
    }
    if (c === ",") {
      row.push(field)
      field = ""
      continue
    }
    if (c === "\r") continue
    if (c === "\n") {
      row.push(field)
      if (row.some((cell) => cell.trim() !== "")) rows.push(row)
      row = []
      field = ""
      continue
    }
    field += c
  }
  row.push(field)
  if (row.some((cell) => cell.trim() !== "")) rows.push(row)
  return rows
}

function writeCsv(table) {
  const lines = table.map((row) =>
    row
      .map((cell) => {
        const text = String(cell ?? "")
        if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
        return text
      })
      .join(","),
  )
  fs.writeFileSync(csvPath, `\uFEFF${lines.join("\n")}\n`, "utf8")
}

function removeChairIdsFromCsv(chairIds) {
  if (!fs.existsSync(csvPath) || chairIds.size === 0) return 0
  const table = parseCsv(fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, ""))
  if (table.length < 2) return 0
  const kept = [table[0]]
  let removed = 0
  for (const row of table.slice(1)) {
    const id = (row[0] ?? "").trim()
    if (chairIds.has(id)) {
      removed++
      continue
    }
    kept.push(row)
  }
  if (removed > 0) writeCsv(kept)
  return removed
}

/**
 * @param {Iterable<string>} purgeIds
 * @param {{ apply?: boolean }} options
 */
export function purgeGadgetIdsFromLib(purgeIds, options = {}) {
  const apply = options.apply !== false
  const idSet = new Set(purgeIds)
  if (idSet.size === 0) {
    return { removedBlocks: 0, removedCsvRows: 0, byFile: [] }
  }

  let removedBlocks = 0
  const byFile = []

  for (const file of fs
    .readdirSync(libDir)
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".d.ts"))
    .sort()) {
    const filePath = path.join(libDir, file)
    const original = fs.readFileSync(filePath, "utf8")
    if (!original.includes("category:")) continue

    const blocks = parseGadgetBlocks(original)
    const toRemove = []

    for (const block of blocks) {
      if (!/category: "/.test(block.text)) continue
      const id = block.text.match(/id: "([^"]+)"/)?.[1]
      if (!id || !idSet.has(id)) continue
      toRemove.push(block)
    }

    if (toRemove.length === 0) continue
    removedBlocks += toRemove.length
    byFile.push({ file, count: toRemove.length })

    if (apply) {
      let next = original
      for (const block of toRemove.sort((a, b) => b.start - a.start)) {
        next = removeBlockRange(next, block.start, block.end)
      }
      next = cleanupCommas(next)
      next = next.replace(/\}\{\s*\n(\s*)id:/g, (_, indent) => `},\n${indent}{\n${indent}id:`)
      fs.writeFileSync(filePath, next, "utf8")
    }
  }

  const chairIds = new Set([...idSet].filter((id) => id.startsWith("chair-")))
  const removedCsvRows = apply ? removeChairIdsFromCsv(chairIds) : 0

  if (apply && removedCsvRows > 0) {
    spawnSync("npx", ["tsx", "scripts/import-gaming-chairs-csv.mjs"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    })
  }

  return { removedBlocks, removedCsvRows, byFile }
}

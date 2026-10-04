/**
 * Sync gadget.connection from 接続端子 spec data when connection is empty.
 * Usage: node scripts/sync-connection-from-terminals.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseGadgetBlocks } from "./used-refurbished-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const reportPath = path.join(root, "scripts/sync-connection-from-terminals-report.json")
const apply = process.argv.includes("--apply")

function isEmptyConnection(value) {
  if (!value) return true
  const t = value.trim()
  return t === "" || t === "—" || t === "-" || t === "―"
}

function getField(block, field) {
  return block.match(new RegExp(`${field}: "([^"]*)"`))?.[1]
}

function replaceField(block, field, value) {
  const re = new RegExp(`(${field}: ")(?:[^"\\\\]|\\\\.)*(")`)
  const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  if (re.test(block)) return block.replace(re, `$1${escapedValue}$2`)
  return block
}

function getConnectionTerminalRow(block) {
  return block.match(/label: "接続端子", value: "([^"]*)"/)?.[1] ?? null
}

function summarizePortGroup(block) {
  const groupMatch = block.match(/\{ title: "接続端子", rows: \[([\s\S]*?)\] \},/)
  if (!groupMatch) return null

  const rows = [...groupMatch[1].matchAll(/\{ label: "([^"]+)", value: "([^"]+)" \}/g)]
  const terminalRow = rows.find(([_, label]) => label === "接続端子")
  if (terminalRow && !isEmptyConnection(terminalRow[2])) return terminalRow[2]

  const ports = rows
    .filter(([_, label, value]) => label !== "接続端子" && !isEmptyConnection(value))
    .filter(([_, __, value]) => value === "対応" || /×\d+/.test(value) || /\d/.test(value))
    .map(([_, label]) => label)

  return ports.length ? ports.join(" / ") : null
}

function resolveConnectionFromBlock(block) {
  const connection = getField(block, "connection")
  if (!isEmptyConnection(connection)) return null

  const fromRow = getConnectionTerminalRow(block)
  if (fromRow && !isEmptyConnection(fromRow)) return fromRow

  return summarizePortGroup(block)
}

const report = { mode: apply ? "apply" : "dry-run", changes: [] }

for (const file of fs.readdirSync(libDir).filter((f) => f.endsWith(".ts"))) {
  const filePath = path.join(libDir, file)
  const src = fs.readFileSync(filePath, "utf8")
  if (!src.includes("category:")) continue

  const blocks = parseGadgetBlocks(src)
  let next = src
  let offset = 0

  for (const { start, end, text: block } of blocks) {
    if (!/category: "/.test(block)) continue
    const resolved = resolveConnectionFromBlock(block)
    if (!resolved) continue

    const updated = replaceField(block, "connection", resolved)
    if (updated === block) continue

    report.changes.push({
      file,
      id: getField(block, "id"),
      name: getField(block, "name"),
      before: getField(block, "connection") ?? "",
      after: resolved,
    })

    if (apply) {
      const absStart = start + offset
      const absEnd = end + offset
      next = next.slice(0, absStart) + updated + next.slice(absEnd)
      offset += updated.length - block.length
    }
  }

  if (apply && next !== src) {
    fs.writeFileSync(filePath, next, "utf8")
  }
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`${apply ? "Applied" : "Dry-run"}: ${report.changes.length} connection updates`)
for (const c of report.changes.slice(0, 25)) {
  console.log(`${c.id} | ${c.before || "—"} -> ${c.after}`)
}
if (report.changes.length > 25) console.log(`... and ${report.changes.length - 25} more`)
if (!apply) console.log("\nDry run. Pass --apply to write.")

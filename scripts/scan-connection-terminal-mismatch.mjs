/**
 * Scan monitors/keyboards with empty connection but port data in spec groups.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseGadgetBlocks } from "./used-refurbished-lib.mjs"

const libDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib")

function isEmptyConnection(value) {
  if (!value) return true
  const t = value.trim()
  return t === "" || t === "—" || t === "-" || t === "―"
}

function getField(block, field) {
  return block.match(new RegExp(`${field}: "([^"]*)"`))?.[1]
}

function summarizePortGroup(block) {
  const groupMatch = block.match(
    /\{ title: "接続端子", rows: \[([\s\S]*?)\] \},/,
  )
  if (!groupMatch) return null
  const rows = [...groupMatch[1].matchAll(/\{ label: "([^"]+)", value: "([^"]+)" \}/g)]
  const ports = rows
    .filter(([, label, value]) => value === "対応" || value === "1" || /×\d+/.test(value))
    .map(([_, label]) => label)
  return ports.length ? ports.join(" / ") : null
}

let n = 0
for (const file of fs.readdirSync(libDir).filter((f) => f.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(libDir, file), "utf8")
  if (!src.includes("category:")) continue
  for (const { text: block } of parseGadgetBlocks(src)) {
    if (!/category: "/.test(block)) continue
    const connection = getField(block, "connection")
    if (!isEmptyConnection(connection)) continue
    const summary = summarizePortGroup(block)
    const terminal = block.match(/label: "接続端子", value: "([^"]*)"/)?.[1]
    const value = terminal && !isEmptyConnection(terminal) ? terminal : summary
    if (!value) continue
    console.log(getField(block, "id"), getField(block, "category"), value.slice(0, 60))
    n++
  }
}
console.log("total", n)

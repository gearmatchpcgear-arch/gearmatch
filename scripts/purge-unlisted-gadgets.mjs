/**
 * Remove gadget blocks from lib/*.ts that are not shown in the default listing.
 * Visible IDs = getListableGadgets(gadgets, false)
 *
 * Usage:
 *   npx tsx scripts/purge-unlisted-gadgets.mjs           # dry-run
 *   npx tsx scripts/purge-unlisted-gadgets.mjs --apply   # write files
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  allSourceGadgets,
  gadgets,
  getListableGadgets,
} from "../lib/gadgets.ts"
import { parseGadgetBlocks } from "./used-refurbished-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const apply = process.argv.includes("--apply")
const reportPath = path.join(root, "scripts/purge-unlisted-gadgets-report.json")

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

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

function countByCategory(list) {
  const counts = {}
  for (const gadget of list) {
    counts[gadget.category] = (counts[gadget.category] ?? 0) + 1
  }
  return counts
}

const keepIds = new Set(getListableGadgets(gadgets, false).map((g) => g.id))
const purgeFromSource = allSourceGadgets.filter((g) => !keepIds.has(g.id))

console.log(`Source gadgets: ${allSourceGadgets.length}`)
console.log(`Export gadgets: ${gadgets.length}`)
console.log(`Default listing: ${keepIds.size}`)
console.log(`Purge (source not listed): ${purgeFromSource.length}`)
console.log("Purge by category:", countByCategory(purgeFromSource))

const report = {
  mode: apply ? "apply" : "dry-run",
  keepCount: keepIds.size,
  purgeCount: 0,
  files: [],
}

for (const file of fs
  .readdirSync(libDir)
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".d.ts"))
  .sort()) {
  const filePath = path.join(libDir, file)
  const original = fs.readFileSync(filePath, "utf8")
  if (!original.includes("category:")) continue

  const blocks = parseGadgetBlocks(original)
  const removed = []
  const toRemove = []

  for (const block of blocks) {
    if (!/category: "/.test(block.text)) continue
    const id = block.text.match(/id: "([^"]+)"/)?.[1]
    if (!id || keepIds.has(id)) continue

    toRemove.push(block)
    removed.push({
      id,
      name: block.text.match(/name: "([^"]*)"/)?.[1] ?? "",
      category: block.text.match(/category: "([^"]+)"/)?.[1] ?? "",
    })
  }

  if (removed.length === 0) continue

  report.purgeCount += removed.length
  report.files.push({ file, removed })

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

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`\n${apply ? "Applied" : "Dry-run"}: removed ${report.purgeCount} blocks in ${report.files.length} files`)
for (const { file, removed } of report.files) {
  console.log(`  ${file}: ${removed.length}`)
  for (const item of removed.slice(0, 5)) {
    console.log(`    - ${item.id} (${item.category}) ${item.name.slice(0, 50)}`)
  }
  if (removed.length > 5) console.log(`    ... and ${removed.length - 5} more`)
}

if (!apply) {
  console.log("\nDry run. Pass --apply to write.")
}

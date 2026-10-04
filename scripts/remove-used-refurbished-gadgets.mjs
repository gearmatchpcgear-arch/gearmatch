/**
 * Remove used/refurbished gadget blocks from all lib/*.ts data files.
 * Usage: node scripts/remove-used-refurbished-gadgets.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  isUsedOrRefurbishedGadgetBlock,
  parseGadgetBlocks,
} from "./used-refurbished-lib.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const reportPath = path.join(root, "scripts/remove-used-refurbished-report.json")
const apply = process.argv.includes("--apply")

const report = { mode: apply ? "apply" : "dry-run", files: [], totalRemoved: 0 }

for (const file of fs.readdirSync(libDir).filter((f) => f.endsWith(".ts"))) {
  const filePath = path.join(libDir, file)
  const src = fs.readFileSync(filePath, "utf8")
  if (!src.includes("category:")) continue

  const blocks = parseGadgetBlocks(src)
  const removed = []
  let next = src
  let offset = 0

  for (const { start, end, text: block } of blocks) {
    if (!/category: "/.test(block)) continue
    if (!isUsedOrRefurbishedGadgetBlock(block)) continue

    removed.push({
      id: block.match(/id: "([^"]+)"/)?.[1] ?? "",
      name: block.match(/name: "([^"]*)"/)?.[1] ?? "",
    })

    if (apply) {
      const absStart = start + offset
      const absEnd = end + offset
      let slice = next.slice(0, absStart) + next.slice(absEnd)
      // Remove orphan comma left after block deletion
      slice = slice.replace(/,\s*,/g, ",").replace(/\[\s*,/g, "[").replace(/,\s*\]/g, "]")
      next = slice
      offset -= end - start
    }
  }

  if (removed.length === 0) continue

  report.files.push({ file, removed })
  report.totalRemoved += removed.length

  if (apply) {
    fs.writeFileSync(filePath, next, "utf8")
  }
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`${apply ? "Applied" : "Dry-run"}: removed ${report.totalRemoved} blocks`)
for (const { file, removed } of report.files) {
  console.log(`  ${file}: ${removed.length}`)
  for (const r of removed.slice(0, 8)) {
    console.log(`    - ${r.id} | ${r.name.slice(0, 60)}`)
  }
  if (removed.length > 8) console.log(`    ... and ${removed.length - 8} more`)
}

if (!apply) console.log("\nDry run. Pass --apply to write.")

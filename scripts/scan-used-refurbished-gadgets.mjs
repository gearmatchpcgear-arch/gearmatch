/**
 * Scan lib/*.ts for used/refurbished gadget blocks.
 * Usage: node scripts/scan-used-refurbished-gadgets.mjs
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

let total = 0
for (const file of fs.readdirSync(libDir).filter((f) => f.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(libDir, file), "utf8")
  if (!src.includes("category:")) continue

  const hits = []
  for (const { text: block } of parseGadgetBlocks(src)) {
    if (!/category: "/.test(block)) continue
    if (!isUsedOrRefurbishedGadgetBlock(block)) continue
    hits.push({
      id: block.match(/id: "([^"]+)"/)?.[1] ?? "",
      name: block.match(/name: "([^"]*)"/)?.[1] ?? "",
    })
  }

  if (hits.length) {
    console.log(`=== ${file} (${hits.length}) ===`)
    for (const h of hits) {
      console.log(`  ${h.id} | ${h.name.slice(0, 70)}`)
    }
    total += hits.length
  }
}

console.log(`\nTotal: ${total}`)

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  parseGadgetBlocks,
  USED_OR_REFURBISHED_PATTERNS,
} from "./used-refurbished-lib.mjs"

const libDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib")
let total = 0
for (const file of fs.readdirSync(libDir).filter((f) => f.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(libDir, file), "utf8")
  if (!src.includes("category:")) continue
  for (const { text: block } of parseGadgetBlocks(src)) {
    if (!/category:/.test(block)) continue
    if (!USED_OR_REFURBISHED_PATTERNS.some((p) => p.test(block))) continue
    console.log(file, block.match(/id: "([^"]+)"/)?.[1])
    total++
  }
}
console.log("total", total)

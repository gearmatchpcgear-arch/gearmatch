/**
 * Remove mic entries where 3+ of 4 card specs are unknown (— or -).
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const FIELDS = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

function countMissing(block) {
  const hlStart = block.indexOf("highlights:")
  const hlEnd = hlStart === -1 ? -1 : block.indexOf("],", hlStart)
  if (hlStart === -1 || hlEnd === -1) return 4
  const hl = block.slice(hlStart, hlEnd + 2)
  let miss = 0
  for (const label of FIELDS) {
    const m = hl.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
    const val = m?.[1] ?? "MISSING"
    if (val === DASH || val === "-" || val === "MISSING" || val === "") miss++
  }
  return miss
}

let totalRemoved = 0
const removedByFile = {}

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue

  const blockRe =
    /\{\n    id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?\n  \},?\n/g

  let removed = 0
  const out = src.replace(blockRe, (block, id) => {
    if (countMissing(block) >= 3) {
      removed++
      return ""
    }
    return block
  })

  if (removed > 0) {
    writeFileSync(path, out)
    removedByFile[file] = removed
    totalRemoved += removed
  }
}

console.log(JSON.stringify({ totalRemoved, removedByFile }, null, 2))

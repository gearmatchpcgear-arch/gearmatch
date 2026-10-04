/**
 * Replace PBT double-shot keycap labels with "PBT" in lib/*.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "lib")
const REPLACEMENTS = [
  ["PBT ダブルショット", "PBT"],
  ["PBTダブルショット", "PBT"],
  ["PBT（ダブルショット）", "PBT"],
]

let filesChanged = 0
let totalReplacements = 0

for (const file of readdirSync(ROOT)) {
  if (!file.endsWith(".ts")) continue
  let src = readFileSync(join(ROOT, file), "utf8")
  let changed = 0
  for (const [from, to] of REPLACEMENTS) {
    const parts = src.split(from)
    if (parts.length > 1) {
      changed += parts.length - 1
      src = parts.join(to)
    }
  }
  if (changed > 0) {
    writeFileSync(join(ROOT, file), src)
    filesChanged++
    totalReplacements += changed
    console.log(`${file}: ${changed}`)
  }
}

console.log(`Done. ${filesChanged} files, ${totalReplacements} replacements`)

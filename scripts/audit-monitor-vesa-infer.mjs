/**
 * ブロック内テキストから VESA を推論できる件数を集計
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMonitorVesaStandardFromBlock } from "./monitor-vesa-standard.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const DASH = "—"

const SKIP = new Set(["monitor-filter-tags.ts", "monitor-detail-specs.ts", "monitor-arm-filter-tags.ts"])

let inferable = 0
let stillDash = 0

for (const file of readdirSync(LIB).filter(
  (f) => f.startsWith("monitor") && f.endsWith(".ts") && !SKIP.has(f) && !f.startsWith("monitor-arm"),
)) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src))) {
    if (!m[1].includes('category: "monitor"')) continue
    if (!/vesaStandard: "—"/.test(m[1])) continue
    const inferred = inferMonitorVesaStandardFromBlock(m[1])
    if (inferred !== DASH) inferable++
    else stillDash++
  }
}

console.log({ inferable, stillDash })

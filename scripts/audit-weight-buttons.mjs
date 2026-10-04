/** Audit missing weight/button count in generated gadget files. */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"

function auditFile(rel) {
  const src = readFileSync(join(ROOT, rel), "utf8")
  const blocks = [...src.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]+)"[\s\S]*?(?=purchaseUrl:|^\];)/gm)]
  let total = 0
  let missW = 0
  let missB = 0
  for (const b of blocks) {
    total++
    const block = b[0]
    const w =
      block.match(/label: "重量", value: "([^"]*)"/)?.[1] ??
      block.match(/"label":"重量","value":"([^"]*)"/)?.[1]
    if (!w || w === DASH || w === "-") missW++
    const btn =
      block.match(/label: "ボタン数", value: "([^"]*)"/) ??
      block.match(/"label":"ボタン数","value":"([^"]*)"/)
    if (!btn || btn[1] === DASH || btn[1] === "-") missB++
  }
  return { total, missW, missB }
}

let total = 0
let missW = 0
let missB = 0
for (const f of ["lib/mouse-bestsellers.ts", "lib/mouse-popular-brands.ts", "lib/gadgets.ts"]) {
  const r = auditFile(f)
  console.log(`${f}: total=${r.total} missW=${r.missW} missB=${r.missB}`)
  total += r.total
  missW += r.missW
  missB += r.missB
}
console.log(`ALL: total=${total} missW=${missW} missB=${missB} filledW=${total - missW} filledB=${total - missB}`)

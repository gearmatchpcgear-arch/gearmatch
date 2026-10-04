import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DASH = "—"
const fields = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

let total = 0
let threePlus = 0
let complete = 0
const byFile = {}

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  const re =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  let fc = 0
  let f3 = 0
  let f0 = 0
  while ((m = re.exec(src))) {
    total++
    fc++
    const hl = m[2]
    let miss = 0
    for (const label of fields) {
      const hm = hl.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
      const val = hm?.[1] ?? "MISSING"
      if (val === DASH || val === "-" || val === "MISSING" || val === "") miss++
    }
    if (miss >= 3) {
      threePlus++
      f3++
    } else if (miss === 0) {
      complete++
      f0++
    }
  }
  if (fc) byFile[file] = { total: fc, threePlus: f3, complete: f0 }
}

console.log(JSON.stringify({ total, complete, threePlus, twoMissing: total - complete - threePlus, byFile }, null, 2))

import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

let total = 0
let dash = 0
let filled = 0

for (const f of readdirSync(LIB).filter((x) => x.startsWith("gaming-chair") && x.endsWith(".ts"))) {
  const s = readFileSync(join(LIB, f), "utf8")
  total += (s.match(/category: "gaming-chair"/g) ?? []).length
  dash += (s.match(/最大リクライニング角度", value: "—"/g) ?? []).length
  filled += (s.match(/maxRecliningAngle: "/g) ?? []).length
}

console.log({ total, dashHighlight: dash, maxRecliningAngleProp: filled, filledRate: `${Math.round((1 - dash / total) * 100)}%` })

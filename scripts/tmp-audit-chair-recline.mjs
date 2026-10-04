import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMaxRecliningAngle, DASH } from "./amazon-gaming-chair-specs.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

let dash = 0
let inferable = 0
let knownOnly = 0

for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src))) {
    const block = m[1]
    if (!/最大リクライニング角度", value: "—"/.test(block)) continue
    dash++
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    const resolved = resolveGamingChairReclineAngle(asin, block)
    if (resolved !== DASH) {
      inferable++
      if (asin && resolved) knownOnly++
    }
  }
}

console.log({ dashRemaining: dash, stillInferable: inferable })

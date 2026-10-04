import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_RECLINE_KNOWN } from "./gaming-chair-recline-known.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"
import { DASH } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const remaining = []
for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src))) {
    const block = m[1]
    if (!/最大リクライニング角度", value: "—"/.test(block)) continue
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    remaining.push({ asin, name: name.slice(0, 55), inKnown: !!(asin && GAMING_CHAIR_RECLINE_KNOWN[asin]) })
  }
}

console.log("remaining", remaining.length)
console.log("inKnown but still dash", remaining.filter((r) => r.inKnown).length)
console.log(remaining.slice(0, 20))

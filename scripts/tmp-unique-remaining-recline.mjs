import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_RECLINE_KNOWN } from "./gaming-chair-recline-known.mjs"
import { resolveGamingChairReclineAngle } from "./gaming-chair-recline-known.mjs"
import { DASH } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const byAsin = new Map()
for (const file of readdirSync(LIB).filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src))) {
    const block = m[1]
    if (!/最大リクライニング角度", value: "—"/.test(block)) continue
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
    if (!asin) continue
    const brand = block.match(/brand: "([^"]*)"/)?.[1] ?? "—"
    const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
    const title = block.match(/title: "([^"]*)"/)?.[1] ?? name
    const resolved = resolveGamingChairReclineAngle(asin, block.replace(/\\"/g, '"'))
    if (!byAsin.has(asin)) {
      byAsin.set(asin, { asin, brand, name, title, resolved, inKnown: !!GAMING_CHAIR_RECLINE_KNOWN[asin] })
    }
  }
}

const list = [...byAsin.values()].sort((a, b) => a.asin.localeCompare(b.asin))
writeFileSync(join(__dirname, "remaining-recline-unique.json"), JSON.stringify(list, null, 2))
console.log("unique ASINs with dash:", list.length)
console.log("resolvable now:", list.filter((x) => x.resolved !== DASH).length)
console.log("inKnown but dash:", list.filter((x) => x.inKnown).map((x) => x.asin))
console.log(list.map((x) => `${x.asin} ${x.brand} ${x.resolved}`).join("\n"))

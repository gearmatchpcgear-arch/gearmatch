import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMaxRecliningAngle } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const SCRIPTS = __dirname

const titles = {}
for (const file of readdirSync(SCRIPTS).filter((f) => /^gaming-chair.*-raw\.json$/i.test(f))) {
  const data = JSON.parse(readFileSync(join(SCRIPTS, file), "utf8"))
  for (const item of data.gamingChairs ?? data.items ?? []) {
    if (item.asin && item.title) titles[item.asin] = item.title
  }
}

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
    const brand = block.match(/brand: "([^"]*)"/)?.[1] ?? ""
    const title = titles[asin] ?? ""
    const inferred = title ? inferMaxRecliningAngle(title) : "—"
    remaining.push({ asin, brand, name, title, inferred })
  }
}

writeFileSync(join(SCRIPTS, "remaining-recline.json"), JSON.stringify(remaining, null, 2))
console.log("total", remaining.length)
console.log("inferrable from raw title", remaining.filter((r) => r.inferred !== "—").length)
remaining.filter((r) => r.inferred !== "—").slice(0, 15).forEach((r) =>
  console.log(r.asin, r.inferred, r.title.slice(0, 80)),
)

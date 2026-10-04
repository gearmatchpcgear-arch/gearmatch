import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const dash = new Map()
for (const file of readdirSync(LIB).filter(
  (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.includes("arm"),
)) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src))) {
    const block = m[1]
    if (!block.includes('category: "monitor"')) continue
    if (!/vesaStandard: "—"/.test(block)) continue
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
    const name = block.match(/^\s*name: "([^"]*)"/m)?.[1] ?? ""
    const brand = block.match(/^\s*brand: "([^"]*)"/m)?.[1] ?? ""
    if (asin && !dash.has(asin)) dash.set(asin, { name, brand, file })
  }
}

console.log("remaining unique", dash.size)
for (const [asin, v] of [...dash.entries()].slice(0, 40)) {
  console.log(`${asin} | ${v.brand} | ${v.name.slice(0, 50)}`)
}

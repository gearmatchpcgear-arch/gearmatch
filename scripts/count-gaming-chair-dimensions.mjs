import { readFileSync, readdirSync } from "fs"
import { join } from "path"

let total = 0
let withDim = 0
for (const f of readdirSync("lib")) {
  if (!f.startsWith("gaming-chair") || !f.endsWith(".ts")) continue
  const t = readFileSync(join("lib", f), "utf8")
  total += (t.match(/category: "gaming-chair"/g) ?? []).length
  withDim += (t.match(/dimensions: "/g) ?? []).length
}
console.log({ total, withDim, without: total - withDim })

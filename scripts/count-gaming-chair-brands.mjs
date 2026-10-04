import { readFileSync, readdirSync } from "fs"
import { join } from "path"

const brands = new Map()
for (const f of readdirSync("lib").filter((x) => x.startsWith("gaming-chair") && x.endsWith(".ts"))) {
  const s = readFileSync(join("lib", f), "utf8")
  for (const m of s.matchAll(/brand:\s*"([^"]+)"/g)) {
    const b = m[1]
    if (b && b !== "—") brands.set(b, (brands.get(b) || 0) + 1)
  }
}
console.log([...brands.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20))

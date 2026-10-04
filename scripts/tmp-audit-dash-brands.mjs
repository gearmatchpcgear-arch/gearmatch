import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const brands = new Map()
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
    const brand = block.match(/^\s*brand: "([^"]*)"/m)?.[1] ?? "(none)"
    brands.set(brand, (brands.get(brand) ?? 0) + 1)
  }
}

console.log([...brands.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30))

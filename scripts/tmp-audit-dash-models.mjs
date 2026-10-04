import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const asins = new Map()
for (const file of readdirSync(LIB).filter(
  (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.includes("arm"),
)) {
  const src = readFileSync(join(LIB, file), "utf8")
  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let m
  while ((m = blockRe.exec(src))) {
    const block = m[1]
    if (!block.includes('category: "monitor"')) continue
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    const vesa = block.match(/vesaStandard: "([^"]*)"/)?.[1]
    const name = block.match(/^\s*name: "([^"]*)"/m)?.[1] ?? ""
    if (vesa !== "—" || !asin || asins.has(asin)) continue
    asins.set(asin, name)
  }
}

console.log("dash unique", asins.size)

const byPrefix = new Map()
for (const name of asins.values()) {
  const model =
    name.match(/\b(JN-[A-Z0-9-]+|PTF[A-Z0-9-]+|27[A-Z0-9]+|24[A-Z0-9]+|ThinkVision[^\s"]+|VA\d+[A-Z]*|VG\d+[A-Z]*)/)?.[1] ??
    name.slice(0, 24)
  byPrefix.set(model, (byPrefix.get(model) ?? 0) + 1)
}

console.log([...byPrefix.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40))

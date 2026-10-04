import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const asins = new Set()
for (const f of readdirSync(join(ROOT, "lib"))) {
  if (!f.startsWith("gaming-chair") || !f.endsWith(".ts")) continue
  const t = readFileSync(join(ROOT, "lib", f), "utf8")
  for (const m of t.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g)) {
    asins.add(m[1])
  }
}
console.log("unique ASINs:", asins.size)

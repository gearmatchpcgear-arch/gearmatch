import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const search = JSON.parse(
  readFileSync(join(ROOT, "scripts/popular-brand-search.json"), "utf8"),
)
const byAsin = Object.fromEntries(search.items.map((i) => [i.asin, i.price]))
const files = ["lib/mouse-bestsellers.ts", "lib/mouse-popular-brands.ts"]
const nullAsins = new Set()
for (const f of files) {
  const src = readFileSync(join(ROOT, f), "utf8")
  const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = re.exec(src)) !== null) {
    const asin = m[1]
    const idx = m.index
    const start = src.lastIndexOf("\n  {", idx)
    const end = src.indexOf("\n  },", idx)
    if (start >= 0 && end >= 0 && /price: null/.test(src.slice(start, end))) {
      nullAsins.add(asin)
    }
  }
}
let hit = 0
for (const a of nullAsins) {
  const p = byAsin[a]
  if (p > 0) {
    console.log(`${a}\t${p}`)
    hit++
  }
}
console.log(`hit ${hit} / ${nullAsins.size}`)

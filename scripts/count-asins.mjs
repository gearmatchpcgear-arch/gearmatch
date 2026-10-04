import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const cache = JSON.parse(readFileSync(join(ROOT, "scripts/mouse-specs-cache.json"), "utf8"))
const asins = new Set()
for (const f of ["lib/mouse-bestsellers.ts", "lib/mouse-popular-brands.ts", "lib/gadgets.ts"]) {
  for (const m of readFileSync(join(ROOT, f), "utf8").matchAll(
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g,
  )) {
    asins.add(m[1])
  }
}
const missing = [...asins].filter((a) => !cache[a])
console.log(JSON.stringify({ asins: asins.size, cached: Object.keys(cache).length, missing: missing.length, sample: missing.slice(0, 10) }))

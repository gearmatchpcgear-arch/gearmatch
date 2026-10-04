import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const html = readFileSync(join(__dirname, "page3.html"), "utf8")
const raw = JSON.parse(readFileSync(join(__dirname, "gaming-chair-search-page3-raw.json"), "utf8"))

const organic = new Set()
const re = /data-component-type="s-search-result"[\s\S]*?data-asin="([A-Z0-9]{10})"/g
let m
while ((m = re.exec(html)) !== null) {
  if (m[1] !== "0000000000") organic.add(m[1])
}

const rawAsins = new Set(raw.gamingChairs.map((x) => x.asin))
console.log("organic", organic.size, "raw kept", rawAsins.size)
const missing = [...organic].filter((a) => !rawAsins.has(a))
const extra = [...rawAsins].filter((a) => !organic.has(a))
console.log("missing from raw:", missing)
console.log("extra in raw not organic:", extra)

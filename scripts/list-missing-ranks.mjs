/**
 * Extract rank→ASIN from existing mouse-bestsellers.ts and list missing ranks.
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(__dirname, "..", "lib", "mouse-bestsellers.ts"), "utf8")
const re =
  /id: "m-bs-(\d{3})"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
const map = {}
let m
while ((m = re.exec(src)) !== null) {
  map[Number(m[1])] = m[2]
}
console.log("existing ranks:", Object.keys(map).length)
const missing = []
for (let r = 2; r <= 100; r++) {
  if (r === 1) continue
  if (!map[r]) missing.push(r)
}
console.log("missing:", missing.join(","))

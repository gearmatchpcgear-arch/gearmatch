/**
 * モニター VESA 未設定 ASIN を集計
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const asins = new Map()
for (const file of readdirSync(LIB).filter((f) => f.startsWith("monitor") && f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  for (const m of src.matchAll(
    /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?vesaStandard: "([^"]*)"/g,
  )) {
    asins.set(m[1], m[2])
  }
}
let dash = 0
let filled = 0
for (const v of asins.values()) {
  if (v === "—") dash++
  else filled++
}
console.log({ uniqueAsins: asins.size, dash, filled })

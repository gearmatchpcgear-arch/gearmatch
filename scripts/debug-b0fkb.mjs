import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const html = readFileSync(join(__dirname, "page3.html"), "utf8")

for (const asin of ["B0FKB5X4XZ", "B0FKB684TV", "B0GKYMP82J"]) {
  const idx = html.indexOf(asin)
  console.log("\n===", asin, "idx", idx)
  if (idx < 0) continue
  const sn = html.slice(idx - 500, idx + 6000)
  const alts = [...sn.matchAll(/alt="([^"]{10,250})"/g)].map((m) => m[1])
  for (const a of alts.slice(0, 8)) console.log(" ", a.slice(0, 120))
  const price = sn.match(/a-price-whole">([\d,]+)/)?.[1]
  const img = sn.match(/images\/I\/([^"]+)/)?.[1]
  console.log(" price", price, " img", img?.slice(0, 40))
}

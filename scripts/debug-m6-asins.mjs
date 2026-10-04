import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const html = readFileSync(join(__dirname, "page3.html"), "utf8")

for (const asin of ["B0FKB5X4XZ", "B0DXPBGBPH", "B0FKB873SR", "B0H448HXD7"]) {
  const idx = html.indexOf(asin)
  const sn = html.slice(Math.max(0, idx - 500), idx + 4000)
  const title =
    sn.match(/alt="([^"]{30,200})"/)?.[1] ??
    sn.match(/p13n-sc-css-line-clamp[^>]*>([^<]{30,200})/)?.[1]
  console.log(asin, title?.slice(0, 120))
}

// Also parse ALL data-asin blocks with M6/G7 in nearby text
const re = /data-asin="([A-Z0-9]{10})"/g
let m
while ((m = re.exec(html)) !== null) {
  const asin = m[1]
  if (asin === "0000000000") continue
  const sn = html.slice(m.index, m.index + 5000)
  if (/AutoFull.*M6|M6 Gaming|G7 Mesh|AutoFull.*G7/i.test(sn)) {
    const title = sn.match(/alt="([^"]{20,200})"/)?.[1]
    console.log("MATCH", asin, title?.slice(0, 100))
  }
}

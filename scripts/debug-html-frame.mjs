import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferFrameMaterial, DASH, extractAmazonChairSpecHaystack } from "./amazon-gaming-chair-specs.mjs"

const HTML_DIR = join(dirname(fileURLToPath(import.meta.url)), "gaming-chair-html")

for (const file of readdirSync(HTML_DIR).filter((f) => f.endsWith(".html"))) {
  const asin = file.replace(".html", "")
  const html = readFileSync(join(HTML_DIR, file), "utf8")
  const haystack = extractAmazonChairSpecHaystack(html)
  const material = inferFrameMaterial(haystack)
  if (material !== DASH) console.log(`${asin}: ${material}`)
}

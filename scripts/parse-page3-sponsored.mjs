import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const html = readFileSync(join(__dirname, "page3.html"), "utf8")

// Find all /dp/ASIN links near AutoFull M6/G7
for (const kw of ["M6", "G7", "AutoFull"]) {
  let idx = 0
  let n = 0
  while ((idx = html.indexOf(kw, idx + 1)) !== -1 && n++ < 5) {
    const sn = html.slice(Math.max(0, idx - 800), idx + 1200)
    const asins = [...sn.matchAll(/\/dp\/([A-Z0-9]{10})/g)].map((m) => m[1])
    const unique = [...new Set(asins)]
    if (unique.length) console.log(kw, "near", unique.join(", "))
  }
}

// Parse sparkle card JSON blobs for asin + title
const cardRe = /data-asin="([A-Z0-9]{10})"/g
const seen = new Map()
let m
while ((m = cardRe.exec(html)) !== null) {
  const asin = m[1]
  if (asin === "0000000000") continue
  const sn = html.slice(m.index, m.index + 8000)
  if (!/AutoFull|M6|G7|ゲーミングチェア/i.test(sn)) continue
  const title =
    sn.match(/alt="([^"]{20,220})"/)?.[1] ??
    sn.match(/"title"\s*:\s*"([^"]{20,220})"/)?.[1]
  if (title && !seen.has(asin)) seen.set(asin, title.replace(/\\u[\dA-Fa-f]{4}/g, ""))
}

console.log("\nSponsored/card ASINs:")
for (const [asin, title] of seen) {
  if (/AutoFull|M6|G7/i.test(title)) console.log(asin, title.slice(0, 120))
}

// Also extract from sparkle widget inline JSON
for (const m of html.matchAll(/"asin"\s*:\s*"([A-Z0-9]{10})"[\s\S]{0,500}?"title"\s*:\s*"([^"]{10,200})"/g)) {
  if (/AutoFull|M6|G7|ゲーミング/i.test(m[2])) console.log("JSON", m[1], m[2].slice(0, 100))
}

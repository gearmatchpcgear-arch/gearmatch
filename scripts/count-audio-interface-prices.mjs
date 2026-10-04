import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "audio-interface-bestsellers.ts"), "utf8")
const blocks = src.match(/\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},?/g) ?? []
const missing = []

for (const b of blocks) {
  const id = b.match(/id: "([^"]+)"/)?.[1]
  const name = b.match(/name: "([^"]{0,80})/)?.[1]
  const asin = b.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
  const priceMatch = b.match(/^\s*price: ([^\n]+)/m)
  const listMatch = b.match(/^\s*listPrice: ([^\n]+)/m)
  const priceRaw = priceMatch?.[1]?.trim()
  const listRaw = listMatch?.[1]?.trim()
  const price = priceRaw === "null" || !priceRaw ? null : Number(priceRaw.replace(/,/g, ""))
  const listPrice = listRaw ? Number(listRaw.replace(/,/g, "")) : null
  const display = listPrice ?? price
  if (display == null || display === 0 || Number.isNaN(display)) {
    missing.push({ id, name, asin, priceRaw, listRaw })
  }
}

console.log("Total:", blocks.length)
console.log("Missing/zero:", missing.length)
for (const x of missing) {
  console.log(`${x.asin ?? "?"} | ${x.name} | price=${x.priceRaw ?? "MISSING"}`)
}

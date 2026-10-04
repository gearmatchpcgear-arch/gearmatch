/** Apply prices from null-price-fetched.json to TS files */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonPrice } from "./amazon-price.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT = join(__dirname, "null-price-fetched.json")
const DELAY_MS = 3500

const USER_PRICES = {
  B0FG2N6QYX: 2399,
  B09C13PZX7: 9305,
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const FILES = [
  "lib/gadgets.ts",
  "lib/mouse-bestsellers.ts",
  "lib/mouse-gaming-bestsellers.ts",
  "lib/mouse-popular-brands.ts",
]

function collectNullAsins() {
  const asins = new Set()
  for (const rel of FILES) {
    const src = readFileSync(join(ROOT, rel), "utf8")
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(src)) !== null) {
      const asin = m[1]
      const idx = m.index
      const start = src.lastIndexOf("\n  {", idx)
      const end = src.indexOf("\n  },", idx)
      if (start < 0 || end < 0) continue
      if (/price: null/.test(src.slice(start, end))) asins.add(asin)
    }
  }
  return [...asins]
}

async function fetchOne(asin) {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
  const html = await res.text()
  return parseAmazonPrice(html)
}

function patchAsin(asin, price) {
  let patched = 0
  for (const rel of FILES) {
    const path = join(ROOT, rel)
    let src = readFileSync(path, "utf8")
    let searchFrom = 0
    while (true) {
      const idx = src.indexOf(`/dp/${asin}"`, searchFrom)
      if (idx < 0) break
      const start = src.lastIndexOf("\n  {", idx)
      const end = src.indexOf("\n  },", idx)
      if (start < 0 || end < 0) break
      const block = src.slice(start, end + "\n  },".length)
      if (/price: null/.test(block)) {
        const newBlock = block.replace(/price: null/, `price: ${price}`)
        src = src.slice(0, start) + newBlock + src.slice(end + "\n  },".length)
        patched++
        searchFrom = start + newBlock.length
      } else {
        searchFrom = end + 1
      }
    }
    if (patched) writeFileSync(path, src)
  }
  return patched
}

async function main() {
  const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {}
  const asins = collectNullAsins().filter((a) => !existing[a] && USER_PRICES[a] == null)
  console.log(`fetch ${asins.length} ASINs (${Object.keys(existing).length} cached)`)

  for (const asin of asins) {
    await new Promise((r) => setTimeout(r, DELAY_MS))
    process.stdout.write(`${asin}... `)
    const price = await fetchOne(asin)
    if (price) {
      existing[asin] = price
      writeFileSync(OUT, JSON.stringify(existing, null, 2) + "\n")
      console.log(price)
    } else {
      console.log("fail")
    }
  }

  const all = { ...existing, ...USER_PRICES }
  let patched = 0
  for (const [asin, price] of Object.entries(all)) {
    patched += patchAsin(asin, price)
  }
  console.log(`patched ${patched}, remaining null ${collectNullAsins().length}`)
}

main().catch(console.error)

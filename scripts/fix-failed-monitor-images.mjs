import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { cacheAmazonImageFromHtml, normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

/** dead ASIN -> search query */
const TARGETS = [
  { asin: "B07Y5VJ8XG", query: "ASUS VP229HE" },
  { asin: "B0C7B8YQ8K", query: "IRIS OHYAMA RLD-27FHD-B" },
  { asin: "B088BH4X5W", query: "ASUS ProArt PA278QV" },
  { asin: "B087612T9B", query: "AOC CU34G2X" },
]

async function searchFirstImage(query) {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) return null
  const html = await res.text()
  const asins = [...new Set([...html.matchAll(/\/dp\/([A-Z0-9]{10})/g)].map((m) => m[1]))]
  for (const asin of asins.slice(0, 5)) {
    await new Promise((r) => setTimeout(r, 700))
    const pres = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!pres.ok) continue
    const phtml = await pres.text()
    const cache = {}
    const image = cacheAmazonImageFromHtml(cache, asin, phtml)
    const title =
      phtml.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ?? ""
    if (image && title.toLowerCase().includes(query.split(" ").pop().toLowerCase().slice(0, 6))) {
      return { asin, image: normalizeAmazonImageUrl(image), title }
    }
    if (image) return { asin, image: normalizeAmazonImageUrl(image), title }
  }
  return null
}

function patchAsinImage(deadAsin, image) {
  for (const rel of ["lib/monitor-bestsellers.ts", "lib/monitor-bestsellers-page2.ts"]) {
    const file = join(ROOT, rel)
    let src = readFileSync(file, "utf8")
    const marker = `purchaseUrl: "https://www.amazon.co.jp/dp/${deadAsin}"`
    const idx = src.indexOf(marker)
    if (idx === -1) continue
    const start = Math.max(0, idx - 700)
    const end = Math.min(src.length, idx + 200)
    const chunk = src.slice(start, end)
    const placeholder =
      'image: "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"'
    if (!chunk.includes(placeholder)) continue
    const newChunk = chunk.replace(placeholder, `image: "${image}"`)
    writeFileSync(file, src.slice(0, start) + newChunk + src.slice(end))
    console.log(`Patched ${deadAsin} in ${rel}`)
  }
}

for (const target of TARGETS) {
  console.log(`Searching: ${target.query}`)
  const hit = await searchFirstImage(target.query)
  if (hit) {
    console.log(`  -> ${hit.asin} ${hit.title.slice(0, 80)}`)
    console.log(`  -> ${hit.image}`)
    patchAsinImage(target.asin, hit.image)
  } else {
    console.log("  -> not found")
  }
  await new Promise((r) => setTimeout(r, 1000))
}

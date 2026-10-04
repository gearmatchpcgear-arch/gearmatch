/**
 * Search Amazon.co.jp for monitor ASINs and print top matches.
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const catalog = JSON.parse(
  readFileSync(join(__dirname, "monitor-bestsellers-page1-catalog.json"), "utf8"),
)

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

async function searchAmazon(query) {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&i=computers`
  const html = await fetch(url, { headers: HEADERS }).then((r) => r.text())
  const results = []
  const re =
    /data-asin="([A-Z0-9]{10})"[\s\S]{0,4000}?<h2[\s\S]*?>([\s\S]*?)<\/h2>/g
  let m
  while ((m = re.exec(html)) !== null) {
    const asin = m[1]
    if (asin === "0000000000" || results.some((x) => x.asin === asin)) continue
    const title = decodeHtml(m[2].replace(/<[^>]+>/g, "").trim())
    if (title.length < 10) continue
    results.push({ asin, title: title.slice(0, 120) })
    if (results.length >= 5) break
  }
  return results
}

async function main() {
  const targets = catalog.filter((x) => !x.asin || x.rank >= 8)
  for (const item of targets) {
    const q = item.search ?? `${item.brand} ${item.name}`
    console.log(`\n#${item.rank} ${q}`)
    try {
      const hits = await searchAmazon(q)
      for (const h of hits) console.log(`  ${h.asin} | ${h.title}`)
      if (!hits.length) console.log("  (no results)")
    } catch (e) {
      console.log(`  ERR ${e.message}`)
    }
    await new Promise((r) => setTimeout(r, 1200))
  }
}

main().catch(console.error)

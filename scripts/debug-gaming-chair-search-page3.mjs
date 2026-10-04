import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isGamingChairAccessory } from "./gaming-chair-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const URL =
  "https://www.amazon.co.jp/s?k=%E3%82%B2%E3%83%BC%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%81%E3%82%A7%E3%82%A2+amazon&page=3"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
  Referer: "https://www.amazon.co.jp/",
}

function parsePage(html) {
  const items = []
  const seen = new Set()
  const blockRe =
    /data-component-type="s-search-result"[\s\S]*?data-asin="([A-Z0-9]{10})"([\s\S]*?)(?=data-component-type="s-search-result"|$)/g
  let match
  while ((match = blockRe.exec(html)) !== null) {
    const asin = match[1].toUpperCase()
    if (asin === "0000000000" || seen.has(asin)) continue
    seen.add(asin)
    const block = match[0]
    const titleRaw =
      block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/h2>/)?.[1] ??
      block.match(/<img[^>]+alt="([^"]{12,})"/)?.[1]
    const title = titleRaw ? titleRaw.replace(/<[^>]+>/g, "").trim() : asin
    items.push({ asin, title })
  }
  return items
}

const html = await fetch(URL, { headers: HEADERS }).then((r) => r.text())
console.log("html len", html.length, "has s-search-result", html.includes("s-search-result"), "captcha", html.includes("captcha"))
const page3 = parsePage(html)
const kept = page3.filter((x) => !isGamingChairAccessory(x.title))
const excluded = page3.filter((x) => isGamingChairAccessory(x.title))

const existing = JSON.parse(
  readFileSync(join(__dirname, "gaming-chair-search-raw.json"), "utf8"),
)
const existingAsins = new Set(existing.gamingChairs.map((x) => x.asin))
const missing = kept.filter((x) => !existingAsins.has(x.asin))

console.log(`page3 raw=${page3.length} kept=${kept.length} excluded=${excluded.length}`)
console.log(`missing from current search data: ${missing.length}`)
for (const x of missing) console.log(`  NEW ${x.asin} ${x.title.slice(0, 90)}`)
console.log("\nAutoFull/M6/G7/C3/velour on page3:")
for (const x of kept.filter((i) => /AutoFull|M6|G7|\bC3\b|ベロア|GT829/i.test(i.title))) {
  console.log(`  ${x.asin} ${x.title.slice(0, 100)}`)
}

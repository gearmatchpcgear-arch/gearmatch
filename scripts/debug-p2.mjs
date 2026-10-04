import { readFileSync, writeFileSync } from "fs"

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const url =
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_2?pg=2"
const html = await (await fetch(url, { headers })).text()

const parts = html.split(/zg-bdg-text">#(\d+)</)
console.log("parts", parts.length)
for (let i = 1; i < Math.min(parts.length, 5); i += 2) {
  const rank = parts[i]
  const block = parts[i + 1]?.slice(0, 500)
  const asin = block?.match(/data-asin="([A-Z0-9]{10})"/)?.[1]
  console.log("rank", rank, "asin", asin, "block len", parts[i + 1]?.length)
}

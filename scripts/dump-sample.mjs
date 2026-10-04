import { writeFileSync } from "fs"

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const html = await (
  await fetch("https://www.amazon.co.jp/gp/bestsellers/computers/2151978051", {
    headers,
  })
).text()

const idx = html.indexOf('data-asin="B0956X785M"')
writeFileSync("scripts/sample-item.html", html.slice(idx, idx + 4000))
console.log("wrote sample")

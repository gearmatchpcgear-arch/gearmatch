const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const html = await (
  await fetch(
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_2?pg=2",
    { headers },
  )
).text()
const idx = html.indexOf('zg-bdg-text">#51')
import { writeFileSync } from "fs"
writeFileSync("scripts/sample-p2.html", html.slice(idx - 200, idx + 3500))
console.log("written", idx)

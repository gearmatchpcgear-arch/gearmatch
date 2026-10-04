import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const url =
  "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130076051/ref=zg_bs_pg_2_musical-instruments?ie=UTF8&pg=2"

const h = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
  },
}).then((r) => r.text())

writeFileSync(join(__dirname, "mic-condenser-page2-debug.html"), h)
const rankRe = /data-asin="([A-Z0-9]{10})"[\s\S]*?zg-bdg-text">#(\d+)</g
let m
let c = 0
while ((m = rankRe.exec(h)) !== null) c++
console.log("len", h.length, "matches", c, "ranks", (h.match(/zg-bdg-text/g) || []).length)

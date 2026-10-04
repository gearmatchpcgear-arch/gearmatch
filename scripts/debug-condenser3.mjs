const URL = "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130076051"
const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
const html = await fetch(URL, { headers: H }).then((r) => r.text())
const rankRe = /data-asin="([A-Z0-9]{10})"[\s\S]*?zg-bdg-text">#(\d+)</g
let m, c = 0
while ((m = rankRe.exec(html)) !== null) {
  c++
  if (c <= 5) console.log(m[1], m[2])
}
console.log("count", c)

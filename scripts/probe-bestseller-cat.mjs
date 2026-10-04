const urls = [
  "https://www.amazon.co.jp/gp/bestsellers/computers/5595709051",
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151982051",
  "https://www.amazon.co.jp/gp/bestsellers/pc/5595709051",
]
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
for (const url of urls) {
  try {
    const res = await fetch(url, { headers: HEADERS })
    const h = await res.text()
    const ranks = [...h.matchAll(/zg-bdg-text">#(\d+)</g)]
    const lg = h.includes("27UD58")
    console.log(url, "status", res.status, "len", h.length, "ranks", ranks.length, "27UD58", lg)
    if (ranks.length) {
      const re = /data-asin="([A-Z0-9]{10})"[\s\S]*?zg-bdg-text">#(\d+)</g
      let m
      let n = 0
      while ((m = re.exec(h)) && n < 3) {
        console.log(" ", m[2], m[1])
        n++
      }
    }
  } catch (e) {
    console.log(url, "ERR", e.message)
  }
}

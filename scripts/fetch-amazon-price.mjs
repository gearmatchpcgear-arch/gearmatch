const asin = process.argv[2] || "B0FBKVC1RY"
const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
    "Accept-Language": "ja-JP,ja;q=0.9",
  },
})
const html = await res.text()
console.log("status", res.status, "len", html.length)

const patterns = [
  [/class="a-offscreen">¥([\d,]+)/, "a-offscreen yen"],
  [/class="a-offscreen">\s*￥([\d,]+)/, "a-offscreen fullwidth yen"],
  [/"priceAmount":([\d.]+)/, "priceAmount json"],
  [/"price":\s*"([\d.]+)"/, "price json"],
  [/a-price-whole[^>]*>([\d,]+)/, "a-price-whole"],
  [/￥([\d,]+)/, "any yen"],
]

for (const [re, name] of patterns) {
  const m = html.match(re)
  if (m) console.log(name, m[1])
}

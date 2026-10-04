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
console.log("div data-asin splits", html.split(/<div data-asin="/).length - 1)
console.log("data-asin count", [...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].length)
const blocks = html.split(/<div data-asin="/)
const b = blocks[1]
console.log("first block start", b?.slice(0, 200))
console.log("rank in first", b?.match(/zg-bdg-text">#(\d+)</)?.[1])

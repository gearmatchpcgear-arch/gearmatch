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

const parts = html.split(/zg-bdg-text">#(\d+)</)
for (let i = 1; i < parts.length; i += 2) {
  const rank = parts[i]
  const block = parts[i + 1].slice(0, 2500)
  const asin = block.match(/data-asin="([A-Z0-9]{10})"/)?.[1]
  const title =
    block.match(/p13n-sc-css-line-clamp-2[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
    block.match(/alt="([^"]{20,})"/)?.[1]
  if (!title) {
    console.log("NO TITLE rank", rank, "asin", asin)
    console.log(block.slice(0, 400))
    console.log("---")
  }
}

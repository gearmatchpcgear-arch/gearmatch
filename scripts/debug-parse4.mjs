import { readFileSync } from "fs"

function parsePage(html) {
  const items = []
  const blocks = html.split(/<div data-asin="/)
  for (const block of blocks.slice(1)) {
    const asin = block.match(/^([A-Z0-9]{10})/i)?.[1]?.toUpperCase()
    const rankStr = block.match(/zg-bdg-text">#(\d+)</)?.[1]
    if (!asin || !rankStr) {
      if (blocks.indexOf(block) <= 2) console.log("skip", { asin, rankStr, start: block.slice(0, 30) })
      continue
    }
    items.push({ rank: Number(rankStr), asin })
  }
  return items
}

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}
const html = await (
  await fetch("https://www.amazon.co.jp/gp/bestsellers/computers/2151978051", { headers })
).text()
console.log("splits", html.split(/<div data-asin="/).length - 1)
console.log("items", parsePage(html).length)

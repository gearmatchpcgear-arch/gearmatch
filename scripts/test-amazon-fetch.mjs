const asin = process.argv[2] || "B09XHJKRVZ"
const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9",
  },
})
console.log("status", res.status)
const html = await res.text()
console.log("len", html.length)
console.log("title", html.includes("productTitle"))
console.log("captcha", /Robot Check|captcha/i.test(html))
const mat = html.match(/po-material[\s\S]*?po-break-word">([\s\S]*?)<\/span>/i)
console.log("po-material", mat?.[1]?.replace(/<[^>]+>/g, " ").trim())
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
const map = parseDetailTable(html)
for (const [k, v] of Object.entries(map)) {
  if (/材|material|張|leather|mesh|レザー/i.test(`${k} ${v}`)) console.log(k, "=>", v)
}

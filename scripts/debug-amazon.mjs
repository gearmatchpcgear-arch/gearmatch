const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const url = "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051"
const html = await (await fetch(url, { headers })).text()
console.log("length", html.length)
const asins = [...html.matchAll(/data-asin="([A-Z0-9]{10})"/gi)].map((m) => m[1])
console.log("asins", asins.length, asins.slice(0, 8))
const dps = [...new Set([...html.matchAll(/\/dp\/([A-Z0-9]{10})/gi)].map((m) => m[1]))]
console.log("dps unique", dps.length, dps.slice(0, 8))
if (html.includes("captcha")) console.log("CAPTCHA detected")
console.log("title snippet", html.match(/<title>([^<]+)/)?.[1])

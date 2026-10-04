const URL = "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130076051"
const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
const html = await fetch(URL, { headers: HEADERS }).then((r) => r.text())

const idx = html.indexOf('data-asin="B0CL9BTQRF"')
console.log(html.slice(idx, idx + 2000).replace(/></g, ">\n<"))

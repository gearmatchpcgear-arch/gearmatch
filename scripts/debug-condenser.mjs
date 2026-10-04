const URL = "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130076051"
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const html = await fetch(URL, { headers: HEADERS }).then((r) => r.text())
console.log("length:", html.length)
console.log("ranks:", (html.match(/zg-bdg-text">#\d+</g) || []).length)
console.log("asins:", (html.match(/data-asin="[A-Z0-9]{10}"/g) || []).slice(0, 5))
console.log("title sample:", html.match(/p13n-sc-css-line-clamp-2[^>]*>([\s\S]{0,100})/)?.[0]?.slice(0, 120))
// alt pattern
console.log("alt ranks:", (html.match(/#(\d+)/g) || []).slice(0, 10))
// search user products
for (const q of ["Amazonベーシック", "ZealSound", "AT2020", "QuadCast"]) {
  console.log(q, html.includes(q))
}

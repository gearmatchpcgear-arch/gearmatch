const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const q = process.argv.slice(2).join(" ") || "Minifire MF27X3A 27インチ"
const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}&i=computers`
const html = await fetch(url, { headers: H }).then((r) => r.text())
const results = []
for (const m of html.matchAll(/data-asin="([A-Z0-9]{10})"[\s\S]{0,3000}?a-size-medium-plus[^>]*>([\s\S]{0,200}?)</g)) {
  const title = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  if (title && !results.some((r) => r.asin === m[1])) {
    results.push({ asin: m[1], title: title.slice(0, 120) })
  }
}
console.log(JSON.stringify(results.slice(0, 5), null, 2))

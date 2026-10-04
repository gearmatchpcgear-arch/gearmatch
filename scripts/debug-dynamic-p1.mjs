const url = "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130075051"
const h = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
  },
}).then((r) => r.text())
const ranks = [...h.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => m[1])
console.log("pg1 count", ranks.length, "min", ranks[0], "max", ranks[ranks.length - 1])
console.log(ranks.join(","))
for (const q of ["400-MC002", "e835", "V7", "ANM-865", "サンワ"]) {
  console.log(q, h.includes(q))
}

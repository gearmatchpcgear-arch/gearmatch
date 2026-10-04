const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }

const queries = [
  "USB ミニ ピンマイク クリップ 1280",
  "FIFINE クリップ ピンマイク C1 1699",
  "サンワサプライ MM-MCU01BK クリップマイク",
  "SoundPEATS クリップマイク USB 2180",
  "eMeet M0 USB スタンドマイク 3999",
  "EMEET M0 スピーカーフォン 会議用",
]

async function search(q) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: HEADERS }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]).filter((a) => a !== ""))]
  console.log("\nQ:", q)
  for (const asin of asins.slice(0, 3)) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
    const title = p.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 100)
    const price = p.match(/￥([\d,]+)/)?.[1]
    const rating = p.match(/5つ星のうち([\d.]+)/)?.[1]
    const img = p.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1]
    console.log(JSON.stringify({ asin, title, price, rating, img }))
  }
}

for (const q of queries) await search(q)

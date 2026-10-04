const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }

async function detail(asin) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const title = html.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 130)
  const price = html.match(/￥([\d,]+)/)?.[1]
  const rating = html.match(/5つ星のうち([\d.]+)/)?.[1]
  const img = html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1]
  return { asin, title, price, rating, img }
}

const queries = [
  "FIFINE ピンマイク C1 3.5mm 1699",
  "FIFINE C1A クリップ",
  "eMeet M0 3999 USB スピーカーフォン",
  "EMEET M0 会議用 3999",
  "SoundPEATS クリップマイク USB",
  "TKGOU 2180 全指向性",
  "MM-MCU01BK 2180",
]
for (const q of queries) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: HEADERS }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]).filter(Boolean))].slice(0, 4)
  console.log("\nQ:", q)
  for (const a of asins) {
    const d = await detail(a)
    if (/C1|M0[^P]|2180|1699|1280|MCU01|SoundPEATS|TKGOU/i.test(d.title + q)) console.log(JSON.stringify(d))
  }
}

// known candidates
for (const a of ["B01HGGWB7K", "B08HRW6V6N", "B0CHV2QZX7", "B08DD66Q9R", "B013SYV6P2", "B0777BNPLP"]) {
  console.log(JSON.stringify(await detail(a)))
}

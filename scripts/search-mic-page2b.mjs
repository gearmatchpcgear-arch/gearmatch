const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }

async function detail(asin) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const title = html.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 120)
  const price = html.match(/￥([\d,]+)/)?.[1]
  const rating = html.match(/5つ星のうち([\d.]+)/)?.[1]
  const img = html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1]
  return { asin, title, price, rating, img }
}

const page2Candidates = [
  "B0F2DSX6BN", // #53 Cubilux clip
  "B0BXWPGFP9", // #54 e-Better 1480 omnidirectional
  "B0DM2GF8MW", // #66 Freell pin mic 980
  "B077Y974JF", // #52 FIFINE USB pin
  "B0DFGMHM4B", // #64 wired pin mic
  "B0FP5534M6", // #70 USB-C mini 1769
  "B08DD66Q9R", // TKGOU 2180 from search
  "B013SYV6P2", // Sanwa MM-MCU01BK
  "B0C9DNN3BJ", // Sanwa MM-MC24N clip
]

for (const asin of page2Candidates) console.log(JSON.stringify(await detail(asin)))

const queries = [
  "FIFINE C1 クリップ 1699",
  "MM-MC35 サンワ",
  "eMeet M0 3999 会議",
  "USB ピンマイク 1280 全指向性",
  "MillSO ピンマイク usb",
]
for (const q of queries) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: HEADERS }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]).filter(Boolean))].slice(0, 3)
  console.log("\nQ:", q)
  for (const a of asins) console.log(JSON.stringify(await detail(a)))
}

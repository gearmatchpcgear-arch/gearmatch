const asins = ["B0FMR8HZP1", "B0DNY1Y1R2"]
for (const asin of asins) {
  const r = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  })
  const t = await r.text()
  const m =
    t.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[^"'\\]+_AC_SL1500_\.jpg/) ??
    t.match(/"hiRes":"https:\\\/\\\/m\.media-amazon\.com\\\/images\\\/I\\\/[^"]+/) ??
    t.match(/images\/I\/[A-Za-z0-9+\-_]+\._AC_SL1500_\.jpg/)
  console.log(asin, r.status, m?.[0]?.replace(/\\u002F/g, "/").replace(/\\\//g, "/") ?? "no image")
}

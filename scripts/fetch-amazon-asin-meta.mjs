const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const asins = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["B0HCND3M61", "B0H28F8CWD", "B09TGZCV4N", "B0FSR8RKDF"]

for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then(
    (r) => r.text(),
  )
  const title =
    html
      .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ?? ""
  const image =
    html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
    html.match(/"large":"(https:[^"]+)"/)?.[1] ||
    ""
  console.log(`\n${asin}`)
  console.log(` title: ${title.slice(0, 120)}`)
  console.log(` image: ${image}`)
  await new Promise((r) => setTimeout(r, 1200))
}

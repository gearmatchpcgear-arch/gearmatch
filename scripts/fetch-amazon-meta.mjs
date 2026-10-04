const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

async function meta(asin) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) =>
    r.text(),
  )
  const title =
    html
      .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  const image =
    html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
    html.match(/"large":"(https:[^"]+)"/)?.[1] ||
    html.match(/data-old-hires="(https:[^"]+)"/)?.[1] ||
    ""
  console.log(JSON.stringify({ asin, title: title.slice(0, 100), image }))
}

for (const asin of process.argv.slice(2)) {
  await meta(asin)
  await new Promise((r) => setTimeout(r, 1500))
}

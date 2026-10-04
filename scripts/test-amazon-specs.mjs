const asins = ["B06WRN4VGJ", "B0B1Q6VB16", "B0BKPL1VKW"]
const H = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function stripTags(s) {
  return decodeHtml(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

for (const asin of asins) {
  await new Promise((r) => setTimeout(r, 1500))
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: H })
  const html = await res.text()
  console.log(`\n=== ${asin} ${res.status} ===`)

  const detailRows = [
    ...html.matchAll(
      /<th[^>]*class="[^"]*prodDetSectionEntry[^"]*"[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*class="[^"]*prodDetAttrValue[^"]*"[^>]*>([\s\S]*?)<\/td>/gi,
    ),
  ]
  console.log("prodDet rows:", detailRows.length)
  for (const m of detailRows.slice(0, 20)) {
    console.log(" ", stripTags(m[1]), "->", stripTags(m[2]).slice(0, 100))
  }

  const genericRows = [
    ...html.matchAll(/<th[^>]*>([^<]{2,80})<\/th>\s*<td[^>]*>([\s\S]{0,300}?)<\/td>/gi),
  ]
  console.log("generic th/td:", genericRows.length)
  for (const m of genericRows.slice(0, 10)) {
    const k = stripTags(m[1])
    const v = stripTags(m[2]).slice(0, 100)
    if (/重量|サイズ|dpi|ボタン|寸法|電池|バッテリー|接続|方式/i.test(k + v))
      console.log(" ", k, "->", v)
  }

  const bullets = [
    ...html.matchAll(
      /<li[^>]*><span class="a-list-item">([\s\S]*?)<\/span><\/li>/gi,
    ),
  ]
  console.log("bullets:", bullets.length)
  for (const m of detailRows) {
    console.log(stripTags(m[1]), "|", stripTags(m[2]))
  }
}

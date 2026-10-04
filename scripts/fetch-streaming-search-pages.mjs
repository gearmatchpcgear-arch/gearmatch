/**
 * Amazon.co.jp 「配信 オーディオインターフェース」検索結果 fetch（HTML parse）
 * ブラウザ抽出の補助用
 */
const BASE =
  "https://www.amazon.co.jp/s?k=%E9%85%8D%E4%BF%A1+%E3%82%AA%E3%83%BC%E3%83%87%E3%82%A3%E3%82%AA%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9&i=mi&rh=n%3A2130084051"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
  Referer: "https://www.amazon.co.jp/",
}

function parsePage(html, page) {
  const items = []
  const seen = new Set()
  const blockRe =
    /data-component-type="s-search-result"[\s\S]*?data-asin="([A-Z0-9]{10})"([\s\S]*?)(?=data-component-type="s-search-result"|$)/g
  let m
  while ((m = blockRe.exec(html))) {
    const asin = m[1]
    if (asin === "0000000000" || seen.has(asin)) continue
    seen.add(asin)
    const block = m[0]
    const title = (
      block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/)?.[1] || ""
    )
      .replace(/<[^>]+>/g, "")
      .trim()
    const priceMatch = block.match(/a-price-whole">([\d,]+)/)
    const price = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null
    const img =
      block.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/)?.[1] || ""
    const ratingText =
      block.match(/aria-label="([^"]*(?:5つ星|out of 5)[^"]*)"/)?.[1] || ""
    const rating = ratingText.match(/([\d.]+)/)?.[1]
      ? parseFloat(ratingText.match(/([\d.]+)/)[1])
      : null
    const reviewsText = block.match(/customerReviews[^>]*>[\s\S]*?>([\d,]+)/)?.[1] || "0"
    const reviews = parseInt(reviewsText.replace(/,/g, ""), 10) || 0
    items.push({ searchRank: items.length + 1, asin, title, price, rating, reviews, image: img, searchPage: page })
  }
  return items
}

async function fetchPage(page) {
  const url = page === 1 ? BASE : `${BASE}&page=${page}`
  const res = await fetch(url, { headers: HEADERS })
  const html = await res.text()
  if (/captcha|Robot Check/i.test(html)) {
    throw new Error(`Captcha on page ${page}`)
  }
  return parsePage(html, page)
}

const startPage = Number(process.argv[2] || 2)
const endPage = Number(process.argv[3] || 12)
const all = []
for (let p = startPage; p <= endPage; p++) {
  try {
    const items = await fetchPage(p)
    console.error(`page ${p}: ${items.length} items`)
    all.push(...items)
    await new Promise((r) => setTimeout(r, 800))
  } catch (e) {
    console.error(`page ${p} failed:`, e.message)
  }
}
console.log(JSON.stringify(all, null, 0))

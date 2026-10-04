/**
 * Amazon 一覧 HTML / 生データから rating・reviews を安全に正規化する。
 * レビュー0件のとき rating を捨て、未取得時の 4.0 / 4.3 等のダミー値を入れない。
 */

function parseCount(value) {
  if (value == null) return 0
  const n = Number(String(value).replace(/,/g, ""))
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
}

function parseRatingValue(value) {
  if (value == null) return 0
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && n <= 5 ? n : 0
}

/** レビュー件数と評価をセットで正規化（reviews <= 0 なら rating も 0） */
export function sanitizeAmazonListingRatingReviews(rating, reviews) {
  const reviewCount = parseCount(reviews)
  if (reviewCount <= 0) {
    return { rating: 0, reviews: 0 }
  }
  return {
    rating: parseRatingValue(rating),
    reviews: reviewCount,
  }
}

/** Amazon 新着/ランキング一覧の HTML 断片から rating / reviews を抽出 */
export function parseListingRatingReviews(block) {
  const reviewPatterns = [
    /id="acrCustomerReviewText"[^>]*>\s*\(?([\d,]+)/,
    /acrCustomerReviewText[^>]*aria-label="([\d,]+)\s*(?:global ratings|件の評価|レビュー)/i,
    /([\d,]+)\s*(?:global ratings|件の評価|customer reviews)/i,
    /"reviewCount"\s*:\s*"?([\d,]+)"?/,
  ]

  let reviews = 0
  for (const pattern of reviewPatterns) {
    const match = block.match(pattern)
    if (match) {
      reviews = parseCount(match[1])
      break
    }
  }

  if (reviews <= 0) {
    return { rating: 0, reviews: 0 }
  }

  const ratingMatch =
    block.match(/5つ星のうち([\d.]+)/) || block.match(/([\d.]+)\s*out of 5 stars/i)
  const rating = ratingMatch ? parseRatingValue(ratingMatch[1]) : 0

  return sanitizeAmazonListingRatingReviews(rating, reviews)
}

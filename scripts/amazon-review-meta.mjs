/**
 * Extract rating / review count from Amazon.co.jp product HTML.
 */
function parseCount(value) {
  if (value == null) return null
  const n = Number(String(value).replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function parseRating(value) {
  if (value == null) return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && n <= 5 ? n : null
}

function buildResult(rating, reviews, ok, source) {
  return { rating, reviews, ok, source }
}

function tryPair(ratingRaw, reviewsRaw, source) {
  const reviews = parseCount(reviewsRaw)
  if (reviews == null || reviews < 0) return null
  if (reviews === 0) return buildResult(0, 0, true, source)
  const rating = parseRating(ratingRaw)
  if (rating == null) return null
  return buildResult(rating, reviews, true, source)
}

function decodeHtmlEntities(text) {
  return text
    .replace(/\\&quot;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/\\"/g, '"')
}

function extractEmbeddedAverageReviews(html, asin) {
  const decoded = decodeHtmlEntities(html)
  const patterns = [
    /averageCustomerReviews"\s*:\s*\{\s*"reviewCount"\s*:\s*(\d+)[\s\S]{0,220}?"value"\s*:\s*([\d.]+)/gi,
    /averageCustomerReviews\\":\\"\{\\"reviewCount\\":(\d+)[\s\S]{0,220}?\\"value\\":([\d.]+)/gi,
  ]

  for (const pattern of patterns) {
    for (const match of decoded.matchAll(pattern)) {
      const start = Math.max(0, match.index - 2500)
      const end = Math.min(decoded.length, match.index + 2500)
      const context = decoded.slice(start, end)
      if (asin && !context.includes(asin)) continue
      const pair = tryPair(match[2], match[1], "embedded-average-reviews")
      if (pair) return pair
    }
  }

  if (asin) {
    const asinFirst = new RegExp(
      `"asin"\\s*:\\s*"${asin}"[\\s\\S]{0,3000}?averageCustomerReviews"\\s*:\\s*\\{[^}]*"reviewCount"\\s*:\\s*(\\d+)[^}]*"value"\\s*:\\s*([\\d.]+)`,
      "i",
    )
    const match = decoded.match(asinFirst)
    if (match) {
      const pair = tryPair(match[2], match[1], "asin-json-blob")
      if (pair) return pair
    }
  }

  return null
}

function extractFromTitleWindow(html) {
  const titleIdx = html.search(/id="productTitle"/)
  if (titleIdx < 0) return null

  let window = html.slice(titleIdx, titleIdx + 22000)
  const cutMarkers = [
    'id="similarities"',
    'id="sponsoredProducts"',
    "sp_detail",
    "sponsoredProducts",
    "carouselData",
  ]
  for (const marker of cutMarkers) {
    const cut = window.indexOf(marker)
    if (cut > 0) {
      window = window.slice(0, cut)
      break
    }
  }

  const rating =
    window.match(/5つ星のうち([\d.]+)/)?.[1] ??
    window.match(/data-hook="rating-out-of-text"[^>]*>[\s\S]*?([\d.]+)\s*(?:out of 5|つ星のうち)/i)?.[1] ??
    window.match(/([\d.]+)\s*out of 5 stars/i)?.[1] ??
    window.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/)?.[1]

  const reviews =
    window.match(/id="acrCustomerReviewText"[^>]*>\s*\(?([\d,]+)/)?.[1] ??
    window.match(/acrCustomerReviewText[^>]*aria-label="([\d,]+)\s*(?:global ratings|件の評価|レビュー)/i)?.[1] ??
    window.match(/([\d,]+)\s*(?:global ratings|ratings|件の評価|customer reviews)/i)?.[1] ??
    window.match(/"reviewCount"\s*:\s*"?([\d,]+)"?/)?.[1]

  const pair = tryPair(rating, reviews, "title-window")
  if (!pair) return null
  if (pair.reviews >= 100 && pair.rating <= 1.5) return null
  return pair
}

function extractFromAsinReviewDiv(html, asin) {
  if (!asin) return null
  const divMatch = html.match(
    new RegExp(
      `id="averageCustomerReviews_feature_div"[^>]*data-csa-c-asin="${asin}"[\\s\\S]{0,5000}`,
      "i",
    ),
  )
  if (!divMatch) return null

  const block = divMatch[0]
  const rating =
    block.match(/5つ星のうち([\d.]+)/)?.[1] ??
    block.match(/([\d.]+)\s*out of 5 stars/i)?.[1]
  const reviews =
    block.match(/acrCustomerReviewText[^>]*>\s*\(?([\d,]+)/)?.[1] ??
    block.match(/([\d,]+)\s*(?:global ratings|ratings|件の評価)/i)?.[1]

  return tryPair(rating, reviews, "asin-review-div")
}

export function extractAmazonRatingAndReviews(html, asin) {
  if (!html || typeof html !== "string") {
    return buildResult(null, null, false, null)
  }

  const blocked =
    !html.includes("productTitle") &&
    !html.includes("acrCustomerReviewText") &&
    !html.includes("averageCustomerReviews")

  const strategies = [
    () => extractFromAsinReviewDiv(html, asin),
    () => extractFromTitleWindow(html),
    () => extractEmbeddedAverageReviews(html, asin),
  ]

  for (const strategy of strategies) {
    const parsed = strategy()
    if (parsed?.rating != null && parsed.reviews != null) {
      return {
        ...parsed,
        ok: !blocked && parsed.reviews >= 0,
      }
    }
  }

  return buildResult(null, null, false, null)
}

export const AMAZON_FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

export async function fetchAmazonProductHtml(asin, headers = AMAZON_FETCH_HEADERS) {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}?language=ja_JP`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

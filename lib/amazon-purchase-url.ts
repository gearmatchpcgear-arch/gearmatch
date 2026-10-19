const AMAZON_ASIN_PATH =
  /(?:^|\/)(?:dp|gp\/product|product|exec\/obidos\/ASIN)\/([A-Z0-9]{10})(?:[/?]|$)/i

/** Amazon 商品 URL から ASIN を抽出（見つからなければ null） */
export function extractAmazonAsin(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, "")
    if (host !== "amazon.co.jp" && host !== "amazon.com") return null
    const m = parsed.pathname.match(AMAZON_ASIN_PATH)
    return m ? m[1].toUpperCase() : null
  } catch {
    const m = trimmed.match(AMAZON_ASIN_PATH)
    return m ? m[1].toUpperCase() : null
  }
}

/** Amazon 商品 URL を https://www.amazon.co.jp/dp/ASIN 形式へ正規化（非 Amazon はそのまま） */
export function cleanAmazonPurchaseUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  const asin = extractAmazonAsin(trimmed)
  if (!asin) return trimmed
  return `https://www.amazon.co.jp/dp/${asin}`
}

import { cleanAmazonPurchaseUrl, extractAmazonAsin } from "@/lib/amazon-purchase-url"
import {
  buildMoshimoAmazonClickUrl,
  getDefaultMoshimoAmazonAffiliateParams,
} from "@/lib/moshimo-affiliate-defaults"

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

/** かんたんリンク等、すでにトラッキング付きのURLか */
export function isTrackedAffiliatePurchaseUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false

  const parsed = tryParseUrl(trimmed)
  if (!parsed) return false

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase()

  if (host === "af.moshimo.com" && parsed.pathname.includes("/af/")) {
    return Boolean(parsed.searchParams.get("a_id"))
  }
  if (host === "px.a8.net" || host.endsWith(".valuecommerce.com")) {
    return true
  }
  if (host === "amzn.to" || host === "amzn.asia") {
    return true
  }
  if (host === "amazon.co.jp" || host === "amazon.com") {
    if (parsed.searchParams.has("tag")) return true
    if (parsed.searchParams.has("linkCode")) return true
  }

  return false
}

function appendAmazonAssociateTag(amazonProductUrl: string, tag: string): string {
  const parsed = tryParseUrl(amazonProductUrl)
  if (!parsed) return amazonProductUrl
  parsed.searchParams.set("tag", tag)
  return parsed.toString()
}

/**
 * 商品ページURLをアフィリエイト用に解決する。
 * - トラッキング済み URL はそのまま
 * - Amazon は data/moshimo-affiliate-config.json のもしも計測 URL（デフォルト a_id 5842375）
 * - 無効時のみ Amazon アソシエイト tag（環境変数）
 */
export function buildAffiliatePurchaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (!trimmed) return trimmed

  if (isTrackedAffiliatePurchaseUrl(trimmed)) {
    return trimmed
  }

  const cleaned = cleanAmazonPurchaseUrl(trimmed)
  const asin = extractAmazonAsin(cleaned)

  if (asin) {
    const moshimoParams = getDefaultMoshimoAmazonAffiliateParams()
    if (moshimoParams) {
      return buildMoshimoAmazonClickUrl(cleaned, moshimoParams)
    }

    const associateTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim()
    if (associateTag) {
      return appendAmazonAssociateTag(cleaned, associateTag)
    }
  }

  return cleaned || trimmed
}

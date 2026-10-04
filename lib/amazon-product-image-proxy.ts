const ALLOWED_AMAZON_IMAGE =
  /^https:\/\/(?:m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\/images\/I\//i

export function isAllowedAmazonProductImageUrl(url: string): boolean {
  return ALLOWED_AMAZON_IMAGE.test(url)
}

/** Amazon CDN URL のパス内 `+` をエンコード（保存データは変更しない） */
export function normalizeAmazonProductImageUrl(url: string): string {
  if (!isAllowedAmazonProductImageUrl(url)) {
    return url
  }
  return url.replace(/(\/images\/I\/)([^?#]+)/, (_, prefix: string, path: string) => {
    return prefix + path.replace(/\+/g, "%2B")
  })
}

/**
 * 商品画像の表示 URL。
 * - 静的ホスト（Cloudflare Pages 等）: Amazon CDN を直接参照（referrerPolicy で配信）
 * - `NEXT_PUBLIC_USE_PRODUCT_IMAGE_PROXY=true` かつ Node サーバーあり: `/api/product-image` プロキシ
 */
export function toProxiedProductImageSrc(url: string): string {
  const normalized = normalizeAmazonProductImageUrl(url)
  if (!isAllowedAmazonProductImageUrl(normalized)) {
    return normalized
  }
  if (process.env.NEXT_PUBLIC_USE_PRODUCT_IMAGE_PROXY === "true") {
    return `/api/product-image?url=${encodeURIComponent(normalized)}`
  }
  return normalized
}

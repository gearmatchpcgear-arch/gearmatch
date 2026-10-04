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

/** ブラウザの直リンク制限を避けるため同一 URL を自サイト経由で配信 */
export function toProxiedProductImageSrc(url: string): string {
  const normalized = normalizeAmazonProductImageUrl(url)
  if (!isAllowedAmazonProductImageUrl(normalized)) {
    return normalized
  }
  return `/api/product-image?url=${encodeURIComponent(normalized)}`
}

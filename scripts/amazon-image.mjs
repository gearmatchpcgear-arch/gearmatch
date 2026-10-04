/**
 * Extract Amazon.co.jp main product image URL from product page HTML.
 */
import { readFileSync, existsSync } from "fs"
import { join } from "path"

/** Amazon 画像 ID から SL1500 URL を生成（既存サフィックスを除去） */
export function normalizeAmazonImageUrl(url) {
  if (!url) return ""
  const m = String(url).match(/\/images\/I\/([A-Za-z0-9+\-]+)/)
  if (!m) {
    return String(url).replace("images-fe.ssl-images-amazon.com", "m.media-amazon.com")
  }
  return `https://m.media-amazon.com/images/I/${m[1]}._AC_SL1500_.jpg`
}

export function toHighResImage(url) {
  return normalizeAmazonImageUrl(url)
}

export function extractAmazonMainImage(html) {
  const patterns = [
    /"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /data-old-hires="(https:\/\/[^"]+images\/I\/[^"]+)"/,
    /"landingImageUrl"\s*:\s*"(https:\/\/[^"]+images\/I\/[^"]+)"/,
    /id="landingImage"[^>]+data-a-dynamic-image="\{[^"]*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /src="(https:\/\/[^"]+images\/I\/[^"]+)"/,
  ]

  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1] && !m[1].includes("placeholder")) return normalizeAmazonImageUrl(m[1])
  }
  return null
}

export function isPlaceholderImage(url) {
  return (
    !url ||
    /placeholder/i.test(url) ||
    /\/images\/I\/61placeholder\b/i.test(url)
  )
}

export function isValidAmazonProductImage(url) {
  return Boolean(
    url &&
      !isPlaceholderImage(url) &&
      /media-amazon\.com\/images\/I\//i.test(url),
  )
}

/** lib/*.ts 内の ASIN → 現在の image フィールド */
export function collectGadgetAsinImages(root) {
  const asins = new Map()
  const files = [
    join(root, "lib", "mouse-bestsellers.ts"),
    join(root, "lib", "mouse-popular-brands.ts"),
    join(root, "lib", "gadgets.ts"),
  ]
  for (const file of files) {
    if (!existsSync(file)) continue
    const src = readFileSync(file, "utf8")
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(src)) !== null) {
      const asin = m[1]
      const chunk = src.slice(Math.max(0, m.index - 600), m.index + 100)
      const images = [...chunk.matchAll(/image: "([^"]*)"/g)]
      asins.set(asin, images.at(-1)?.[1] ?? "")
    }
  }
  return asins
}

/**
 * Merge 時・インポート時に imageUrl を決定する共通ロジック。
 * プレースホルダー URL は返さず空文字（UI がカテゴリ SVG にフォールバック）。
 */
export function resolveGadgetImage(asin, image, imageCache = {}, overrides = {}) {
  const overrideImage = overrides[asin]?.image
  if (isValidAmazonProductImage(overrideImage)) {
    return normalizeAmazonImageUrl(overrideImage)
  }

  const cached = imageCache[asin]?.image
  if (isValidAmazonProductImage(cached)) {
    return normalizeAmazonImageUrl(cached)
  }

  if (isValidAmazonProductImage(image)) {
    return normalizeAmazonImageUrl(image)
  }

  return ""
}

export function needsImageFetch(asin, image, imageCache = {}, overrides = {}) {
  const resolved = resolveGadgetImage(asin, image, imageCache, overrides)
  return !resolved
}

export function cacheAmazonImage(imageCache, asin, url, source = "fetch") {
  const normalized = normalizeAmazonImageUrl(url)
  if (!isValidAmazonProductImage(normalized)) return false
  imageCache[asin] = {
    asin,
    image: normalized,
    fetchedAt: new Date().toISOString(),
    source,
  }
  return true
}

/** HTML から画像を抽出してキャッシュへ保存 */
export function cacheAmazonImageFromHtml(imageCache, asin, html, source = "html") {
  const image = extractAmazonMainImage(html)
  if (!image) return null
  cacheAmazonImage(imageCache, asin, image, source)
  return image
}

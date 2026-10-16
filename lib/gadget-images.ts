import type { CategoryId } from "@/lib/gadgets"

/** カテゴリ別フォールバック（画像読み込み失敗時） */
export const CATEGORY_PLACEHOLDER: Record<CategoryId, string> = {
  mouse: "/placeholders/mouse.svg",
  keyboard: "/placeholders/keyboard.svg",
  mic: "/placeholders/mic.svg",
  camera: "/placeholders/camera.svg",
  "monitor-arm": "/placeholders/monitor.svg",
  monitor: "/placeholders/monitor.svg",
  "gaming-chair": "/placeholders/desk.svg",
  "audio-interface": "/placeholders/audio-interface.svg",
}

export function getCategoryPlaceholder(category: CategoryId) {
  return CATEGORY_PLACEHOLDER[category]
}

/** `public/` 配下のルート相対パスに正規化（`images/foo.jpg` → `/images/foo.jpg`） */
export function normalizeProductImageSrc(src: string): string {
  const trimmed = src.trim()
  if (!trimmed) return trimmed
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed
  }
  if (
    trimmed.startsWith("images/") ||
    trimmed.startsWith("placeholders/") ||
    trimmed.startsWith("products/")
  ) {
    return `/${trimmed}`
  }
  return trimmed
}

/** ローカル主画像 → Amazon 代替 URL（`public/images/` に実体がある商品） */
export const LOCAL_PRODUCT_IMAGE_AMAZON_FALLBACK: Record<string, string> = {
  "/images/mice/m-gbs-005.jpg":
    "https://m.media-amazon.com/images/I/61eElLlfVDL._AC_SL1500_.jpg",
  "/images/keyboards/vk720a.jpg":
    "https://m.media-amazon.com/images/I/71ZXroF8jAL._AC_SL1500_.jpg",
  "/images/cameras/insta360-link-2.jpg":
    "https://m.media-amazon.com/images/I/51R6zRz7EVL._AC_SL1500_.jpg",
}

export function getCategoryImageLabel(category: CategoryId) {
  const labels: Record<CategoryId, string> = {
    mouse: "マウス",
    keyboard: "キーボード",
    mic: "マイク",
    camera: "カメラ",
    "monitor-arm": "モニターアーム",
    monitor: "モニター",
    "gaming-chair": "ゲーミングチェア",
    "audio-interface": "オーディオインターフェイス",
  }
  return labels[category]
}

/** 商品画像として有効な URL / ローカルパスか */
export function isValidProductImage(src: string | null | undefined): boolean {
  const normalized = src ? normalizeProductImageSrc(src) : src
  if (!normalized || /placeholder/i.test(normalized) || /\/images\/I\/61placeholder\b/i.test(normalized)) {
    return false
  }
  if (normalized.startsWith("/images/") || normalized.startsWith("/placeholders/")) {
    return true
  }
  return /(?:media-amazon|images-na\.ssl-images-amazon)\.com\/images\/I\//i.test(normalized)
}

function isLocalProductImage(src: string): boolean {
  const normalized = normalizeProductImageSrc(src)
  return normalized.startsWith("/images/") || normalized.startsWith("/placeholders/")
}

/** Amazon 画像 ID から代替ホスト URL を生成 */
export function getAmazonImageFallbacks(src: string): string[] {
  const candidates: string[] = []
  if (isValidProductImage(src)) candidates.push(src)

  const match = src.match(/\/images\/I\/([^/?]+)/i)
  if (!match) return [...new Set(candidates)]

  const pathPart = match[1]
  const idMatch = pathPart.match(/^([A-Za-z0-9+\-]+)/)
  const imageId = idMatch?.[1]
  if (!imageId) return [...new Set(candidates)]

  const cdnVariants = [
    `https://m.media-amazon.com/images/I/${imageId}._AC_SL1500_.jpg`,
    `https://m.media-amazon.com/images/I/${imageId}._AC_SX679_.jpg`,
    `https://m.media-amazon.com/images/I/${imageId}._AC_SX569_.jpg`,
    `https://m.media-amazon.com/images/I/${imageId}.jpg`,
  ]
  for (const url of cdnVariants) {
    candidates.push(url)
  }

  return [...new Set(candidates)]
}

/** 商品画像の読み込み候補（ローカル / Amazon 代替 URL → カテゴリ SVG） */
export function getProductImageCandidates(
  src: string | undefined,
  category: CategoryId,
  extraFallbacks: string[] = [],
): string[] {
  const candidates: string[] = []

  if (src && isValidProductImage(src)) {
    const normalized = normalizeProductImageSrc(src)
    if (isLocalProductImage(normalized)) {
      candidates.push(normalized)
      const amazonMirror = LOCAL_PRODUCT_IMAGE_AMAZON_FALLBACK[normalized]
      if (amazonMirror) {
        candidates.push(...getAmazonImageFallbacks(amazonMirror))
      }
    } else {
      candidates.push(...getAmazonImageFallbacks(normalized))
    }
  }

  for (const fallback of extraFallbacks) {
    if (!fallback) continue
    if (isLocalProductImage(fallback)) {
      candidates.push(fallback)
    } else if (isValidProductImage(fallback)) {
      candidates.push(...getAmazonImageFallbacks(fallback))
    }
  }

  candidates.push(getCategoryPlaceholder(category))
  return [...new Set(candidates)]
}

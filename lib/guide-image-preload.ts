import { toProxiedProductImageSrc } from "@/lib/amazon-product-image-proxy"
import {
  INSTA360_LINK_2_AMAZON_IMAGES,
  INSTA360_LINK_2_IMAGE_URL,
  isInsta360Link2ProductRef,
} from "@/lib/camera-insta360-link-2-images"
import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import { GUIDE_CAMERA_RECOMMENDATIONS } from "@/lib/guide-camera-recommendations"
import { GUIDE_MIC_RECOMMENDATIONS } from "@/lib/guide-mic-recommendations"
import { GUIDE_MONITOR_ARM_RECOMMENDATIONS } from "@/lib/guide-monitor-arm-recommendations"
import { isValidProductImage } from "@/lib/gadget-images"
import type { CategoryId, Gadget } from "@/lib/gadgets"

/** おすすめカード用の画像 URL を収集（gadget.image / Insta360 特例を含む） */
export function collectGuideRecommendationImageUrls(
  picks: readonly GuideCategoryRecommendation[],
  resolveGadget?: (gadgetId: string) => Gadget | undefined,
): string[] {
  const urls: string[] = []

  for (const pick of picks) {
    if (pick.imageUrl && isValidProductImage(pick.imageUrl)) {
      urls.push(pick.imageUrl)
    }
    for (const fallback of pick.imageFallbackUrls ?? []) {
      if (isValidProductImage(fallback)) urls.push(fallback)
    }
    const gadget = pick.gadgetId ? resolveGadget?.(pick.gadgetId) : undefined
    if (gadget?.image && isValidProductImage(gadget.image)) {
      urls.push(gadget.image)
    }
    if (isInsta360Link2ProductRef(pick.id, gadget?.id)) {
      urls.push(INSTA360_LINK_2_IMAGE_URL, ...INSTA360_LINK_2_AMAZON_IMAGES)
    }
  }

  return urls
}

/** ガイドのカテゴリ別おすすめ画像 URL（マイク・カメラ・モニターアーム等） */
export function getGuideCategoryRecommendationImageUrls(
  category: CategoryId,
  pool: Gadget[],
): string[] {
  const resolveGadget = (gadgetId: string) =>
    pool.find((g) => g.id === gadgetId)

  switch (category) {
    case "mic":
      return collectGuideRecommendationImageUrls(
        [...GUIDE_MIC_RECOMMENDATIONS.dynamic, ...GUIDE_MIC_RECOMMENDATIONS.condenser],
        resolveGadget,
      )
    case "camera":
      return collectGuideRecommendationImageUrls(GUIDE_CAMERA_RECOMMENDATIONS, resolveGadget)
    case "monitor-arm":
      return collectGuideRecommendationImageUrls(GUIDE_MONITOR_ARM_RECOMMENDATIONS, resolveGadget)
    default:
      return []
  }
}

const GUIDE_PRELOAD_ON_MOUNT: CategoryId[] = ["mic", "camera", "monitor-arm"]

/** ガイド初回表示時に遅延しやすいカテゴリの画像をまとめて先読み */
export function preloadGuideSlowCategoryImages(pool: Gadget[], limit = 16): () => void {
  const urls = GUIDE_PRELOAD_ON_MOUNT.flatMap((category) =>
    getGuideCategoryRecommendationImageUrls(category, pool),
  )
  return preloadGuideProductImages(urls, limit)
}

/** ガイドのおすすめカード画像を `<link rel="preload">` で先読み（同一 URL は重複しない） */
export function preloadGuideProductImages(
  urls: (string | null | undefined)[],
  limit = 4,
): () => void {
  if (typeof document === "undefined") return () => {}

  const links: HTMLLinkElement[] = []
  const seen = new Set<string>()

  for (const url of urls) {
    if (links.length >= limit) break
    if (!url || !isValidProductImage(url)) continue

    const href = toProxiedProductImageSrc(url)
    if (seen.has(href)) continue
    seen.add(href)

    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = href
    document.head.appendChild(link)
    links.push(link)

    const img = new window.Image()
    img.referrerPolicy = "no-referrer"
    img.src = href
  }

  return () => {
    for (const link of links) {
      link.remove()
    }
  }
}

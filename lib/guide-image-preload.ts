import { toProxiedProductImageSrc } from "@/lib/amazon-product-image-proxy"
import { isValidProductImage } from "@/lib/gadget-images"

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
  }

  return () => {
    for (const link of links) {
      link.remove()
    }
  }
}

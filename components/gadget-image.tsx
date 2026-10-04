"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"
import { getProductImageCandidates, isValidProductImage } from "@/lib/gadget-images"
import {
  KEYBOARD_ELECOM_VK720A_AMAZON_IMAGE,
  KEYBOARD_ELECOM_VK720A_LOCAL_IMAGE,
} from "@/lib/keyboard-elecom-vk720a"
import {
  KEYBOARD_REALFORCE_GX1PLUS_IMAGE,
  KEYBOARD_REALFORCE_GX1PLUS_IMAGE_FALLBACK,
} from "@/lib/keyboard-realforce-gx1plus"
import {
  INSTA360_LINK_2_AMAZON_IMAGES,
  INSTA360_LINK_2_LOCAL_IMAGE,
  isInsta360Link2ImageSource,
} from "@/lib/camera-insta360-link-2-images"
import type { CategoryId } from "@/lib/gadgets"

type GadgetImageProps = {
  src: string
  alt: string
  category: CategoryId
  sizes: string
  className?: string
  priority?: boolean
}

export function GadgetImage({
  src,
  alt,
  category,
  sizes: _sizes,
  className,
  priority,
}: GadgetImageProps) {
  const candidates = useMemo(() => {
    const extraFallbacks =
      src === KEYBOARD_ELECOM_VK720A_LOCAL_IMAGE
        ? [KEYBOARD_ELECOM_VK720A_AMAZON_IMAGE]
        : src === KEYBOARD_REALFORCE_GX1PLUS_IMAGE
          ? [KEYBOARD_REALFORCE_GX1PLUS_IMAGE_FALLBACK]
          : isInsta360Link2ImageSource(src)
            ? [...INSTA360_LINK_2_AMAZON_IMAGES]
            : []

    if (!isValidProductImage(src)) {
      return getProductImageCandidates(undefined, category, extraFallbacks)
    }
    return getProductImageCandidates(src, category, extraFallbacks)
  }, [src, category])

  return (
    <ProductImageWithFallback
      candidates={candidates}
      alt={alt}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes={_sizes}
      referrerPolicy="no-referrer"
      className={cn("h-full w-full object-contain p-4", className)}
    />
  )
}

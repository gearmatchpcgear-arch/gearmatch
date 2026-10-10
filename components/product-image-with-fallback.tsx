"use client"

import Image from "next/image"
import { useEffect, useMemo, useState, type ImgHTMLAttributes } from "react"
import { toProxiedProductImageSrc } from "@/lib/amazon-product-image-proxy"
import { cn } from "@/lib/utils"
import { GUIDE_RECOMMENDATION_IMAGE_SIZES } from "@/lib/guide-image-config"

type ProductImageWithFallbackProps = {
  candidates: string[]
  alt: string
  className?: string
  loading?: "lazy" | "eager"
  priority?: boolean
  sizes?: string
  width?: number
  height?: number
  /** 全候補が失敗したときの代替表示（未指定時は alt テキスト） */
  exhaustedLabel?: string
  /** 外部CDN（Amazon等）のリファラーブロック回避 */
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"]
}

const DEFAULT_GUIDE_IMAGE_SIZE = 400

export function ProductImageWithFallback({
  candidates,
  alt,
  className,
  loading = "lazy",
  priority = false,
  sizes = GUIDE_RECOMMENDATION_IMAGE_SIZES,
  width = DEFAULT_GUIDE_IMAGE_SIZE,
  height = DEFAULT_GUIDE_IMAGE_SIZE,
  exhaustedLabel,
  referrerPolicy = "no-referrer",
}: ProductImageWithFallbackProps) {
  const normalizedCandidates = useMemo(
    () => candidates.filter((candidate, index) => candidate && candidates.indexOf(candidate) === index),
    [candidates],
  )
  const [index, setIndex] = useState(0)
  const [exhausted, setExhausted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setIndex(0)
    setExhausted(false)
    setLoaded(false)
  }, [normalizedCandidates])

  const src = normalizedCandidates[index] ?? normalizedCandidates[normalizedCandidates.length - 1] ?? ""
  const displaySrc = src ? toProxiedProductImageSrc(src) : ""

  if (!src || exhausted) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center px-2 text-center text-xs text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        {exhaustedLabel ?? alt}
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!loaded ? (
        <div
          className="absolute inset-0 animate-pulse rounded-md bg-slate-100 ring-1 ring-slate-200/80"
          aria-hidden
        />
      ) : null}
      <Image
        key={displaySrc}
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        unoptimized
        priority={priority}
        loading={priority ? undefined : loading}
        referrerPolicy={referrerPolicy}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false)
          setIndex((current) => {
            if (current < normalizedCandidates.length - 1) {
              return current + 1
            }
            setExhausted(true)
            return current
          })
        }}
        className={cn(
          "relative z-[1] transition-opacity duration-200",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  )
}

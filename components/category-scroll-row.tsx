"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type CategoryScrollRowProps = {
  children: ReactNode
  className?: string
  /** `main` の左右パディングと相殺し、画面幅いっぱいで横スクロール */
  bleed?: boolean
}

export function CategoryScrollRow({ children, className, bleed }: CategoryScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollHints()
    const el = scrollRef.current
    if (!el) return

    el.addEventListener("scroll", updateScrollHints, { passive: true })
    const observer = new ResizeObserver(updateScrollHints)
    observer.observe(el)

    return () => {
      el.removeEventListener("scroll", updateScrollHints)
      observer.disconnect()
    }
  }, [updateScrollHints])

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" })
  }

  return (
    <div className={cn("relative min-w-0 max-w-full", className)}>
      {canScrollLeft && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background via-background/80 to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollBy(-220)}
            aria-label="カテゴリを左にスクロール"
            className="absolute left-0 top-1/2 z-20 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/95 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
        </>
      )}

      {canScrollRight && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background via-background/80 to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollBy(220)}
            aria-label="カテゴリを右にスクロール"
            className="absolute right-0 top-1/2 z-20 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/95 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "scrollbar-none flex min-w-0 w-full max-w-full flex-nowrap gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pb-0.5 [-webkit-overflow-scrolling:touch]",
          bleed ? "-mx-4 w-[calc(100%+2rem)] max-w-[100vw] scroll-px-4 px-4 py-2" : "px-1",
        )}
      >
        {children}
        <span className="pointer-events-none shrink-0 basis-4" aria-hidden />
      </div>
    </div>
  )
}

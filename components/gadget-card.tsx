"use client"

import { memo, useMemo } from "react"
import { Star, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatPrice,
  getCardHighlightLabel,
  getDisplayBadge,
  getCardDisplayPrice,
  getDisplayRating,
  getDisplayReviewCount,
  hasCardDisplayPrice,
  hasDisplayReviews,
  getCardHighlights,
  withCatalogCsvOverlay,
  type Gadget,
} from "@/lib/gadgets"
import { GadgetImage } from "@/components/gadget-image"
import { cardPrimarySpecShellClassName } from "@/lib/card-primary-spec-shell"

const badgeClassName =
  "inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold tracking-wide text-primary ring-1 ring-primary/20"

export type CardSize = "large" | "medium" | "small"

const IMAGE_RATING_BADGE_OVERLAY_CLASS =
  "pointer-events-none absolute bottom-2 right-2 z-[1] inline-flex h-6 min-w-[4.5rem] items-center justify-end gap-1 rounded bg-black/60 px-1.5 py-0.5 text-white backdrop-blur-sm"

const IMAGE_RATING_BADGE_INLINE_CLASS =
  "pointer-events-none inline-flex h-6 shrink-0 items-center justify-end gap-1 rounded bg-black/60 px-1.5 py-0.5 text-white backdrop-blur-sm"

function ImageRatingBadge({
  gadget,
  compact = false,
  inline = false,
}: {
  gadget: Gadget
  compact?: boolean
  inline?: boolean
}) {
  if (!hasDisplayReviews(gadget)) return null

  const rating = getDisplayRating(gadget)
  const reviews = getDisplayReviewCount(gadget)

  return (
    <div
      className={cn(
        inline ? IMAGE_RATING_BADGE_INLINE_CLASS : IMAGE_RATING_BADGE_OVERLAY_CLASS,
        compact ? "min-w-0 text-[10px] leading-none" : "min-w-[4.5rem] text-xs leading-none",
      )}
      aria-label={`評価 ${rating.toFixed(1)}、レビュー ${reviews.toLocaleString("ja-JP")}件`}
    >
      <Star
        className={cn("shrink-0 fill-chart-3 text-chart-3", compact ? "size-2.5" : "size-3")}
        aria-hidden
      />
      <span className="font-medium tabular-nums">{rating.toFixed(1)}</span>
      <span className="tabular-nums text-white/80">({reviews.toLocaleString("ja-JP")})</span>
    </div>
  )
}

export const GadgetCard = memo(function GadgetCard({
  gadget,
  size = "large",
  onOpen,
  onToggleCompare,
  isComparing,
  compareDisabled,
}: {
  gadget: Gadget
  size?: CardSize
  onOpen: (gadgetId: string) => void
  onToggleCompare: (gadgetId: string) => void
  isComparing: boolean
  compareDisabled: boolean
}) {
  const isLarge = size === "large"
  const isMedium = size === "medium"
  const isSmall = size === "small"
  const showBrand = isLarge
  const showTagline = isLarge
  const showSpecs = isLarge || isMedium
  const displayGadget = useMemo(() => withCatalogCsvOverlay(gadget), [gadget])
  const highlights = useMemo(() => getCardHighlights(gadget), [gadget])
  const displayBadge = useMemo(() => getDisplayBadge(gadget), [gadget])

  const specHighlightsGrid = (variant: "medium-mobile" | "default") => {
    if (variant === "medium-mobile") {
      return (
        <dl
          className={cn(
            cardPrimarySpecShellClassName,
            "flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-2.5 text-left",
          )}
        >
          {highlights.map((h) => (
            <div
              key={`${gadget.id}-${h.label}-medium-mobile`}
              className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2"
            >
              <dt className="shrink-0 whitespace-nowrap text-xs leading-4 text-muted-foreground">
                {getCardHighlightLabel(gadget, h.label)}
              </dt>
              <dd className="min-w-0 truncate whitespace-nowrap text-right text-xs font-semibold leading-4 text-slate-800">
                {h.value}
              </dd>
            </div>
          ))}
        </dl>
      )
    }

    return (
      <dl
        className={cn(
          cardPrimarySpecShellClassName,
          "grid min-w-0 grid-cols-2 gap-2 text-center",
          isMedium ? "gap-2 p-2.5" : "gap-2 p-3",
        )}
      >
        {highlights.map((h) => (
          <div key={`${gadget.id}-${h.label}-default`} className="min-w-0 overflow-hidden">
            <dt className="block min-w-0 truncate whitespace-nowrap text-xs leading-4 text-muted-foreground">
              {getCardHighlightLabel(gadget, h.label)}
            </dt>
            <dd className="mt-0.5 block min-w-0 truncate whitespace-nowrap text-xs font-semibold leading-4 text-slate-800">
              {h.value}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  const priceBlock = (
    hasCardDisplayPrice(gadget) ? (
      <p
        className={cn(
          "font-mono font-semibold text-slate-900",
          isSmall ? "pt-0.5 text-sm" : isMedium ? "pt-0.5 text-sm" : "mt-auto pt-1 text-base",
        )}
      >
        {formatPrice(getCardDisplayPrice(gadget)!)}
      </p>
    ) : null
  )

  const titleClassName = cn(
    "font-semibold leading-snug text-slate-900",
    isSmall ? "line-clamp-2 text-xs" : isMedium ? "line-clamp-2 text-sm" : "line-clamp-1 text-sm",
  )

  const cardBodyClassName = "text-left"

  const openDetail = () => onOpen(gadget.id)

  const compareButton = (compact?: boolean) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onToggleCompare(gadget.id)
      }}
      disabled={compareDisabled && !isComparing}
      aria-pressed={isComparing}
      aria-label={isComparing ? "比較から外す" : "比較に追加"}
      className={cn(
        "inline-flex items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-colors",
        compact ? "size-7" : "size-8",
        isComparing
          ? "bg-primary text-primary-foreground"
          : "bg-white/80 text-muted-foreground ring-1 ring-slate-200/80 hover:bg-white hover:text-foreground disabled:opacity-40",
      )}
    >
      {isComparing ? (
        <Check className={compact ? "size-3.5" : "size-4"} />
      ) : (
        <Plus className={compact ? "size-3.5" : "size-4"} />
      )}
    </button>
  )

  const compareOnImage = (compact?: boolean) => (
    <div
      className={cn("pointer-events-none absolute z-10", compact ? "right-1 top-1" : "right-2 top-2")}
    >
      <div className="pointer-events-auto">{compareButton(compact)}</div>
    </div>
  )

  const openDetailLabel = `${displayGadget.brand} ${displayGadget.name} の詳細を見る`

  const imageAreaClassName =
    "relative aspect-square cursor-pointer overflow-hidden bg-gradient-to-b from-slate-50 to-white"

  const imageClassName = cn(
    "pointer-events-none relative z-0 transition-transform duration-300 group-hover:scale-[1.02]",
  )

  return (
    <article
      role="presentation"
      onClick={openDetail}
      className={cn(
        "group relative isolate flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200",
        isSmall && "rounded-lg",
        isComparing
          ? "border-primary/40 shadow-md ring-2 ring-primary/15"
          : "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
      )}
    >
      <span className="sr-only">{openDetailLabel}</span>
      {displayBadge ? (
        <div
          className={cn(
            "pointer-events-none absolute z-[1] flex flex-col items-start gap-1",
            isSmall ? "left-1.5 top-1.5 max-w-[calc(100%-2.5rem)]" : "left-2.5 top-2.5 max-w-[calc(100%-3rem)]",
          )}
        >
          <span className={cn(badgeClassName, isSmall && "px-1.5 text-[8px]")}>{displayBadge}</span>
        </div>
      ) : null}

      {isMedium ? (
        <>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white sm:hidden">
            <div className="flex min-w-0 flex-1 flex-row items-stretch gap-1.5 p-3.5 pt-4">
              <div
                className={cn(imageAreaClassName, "aspect-square w-20 shrink-0 rounded-md ring-1 ring-slate-100")}
                aria-hidden
              >
                <div className="pointer-events-none h-full w-full">
                  <GadgetImage
                    src={gadget.image}
                    alt={`${displayGadget.brand} ${displayGadget.name}`}
                    category={gadget.category}
                    sizes="80px"
                    className={cn(imageClassName, "p-1")}
                  />
                </div>
                {compareOnImage(true)}
              </div>
              <div className={cn(cardBodyClassName, "min-w-0 flex-1")}>
                {showSpecs ? specHighlightsGrid("medium-mobile") : null}
              </div>
            </div>
            <div className={cn(cardBodyClassName, "border-t border-slate-100 px-3.5 pt-2 pb-1")}>
              <h3 className={cn(titleClassName, "min-w-0")}>{displayGadget.name}</h3>
            </div>
            <div className="flex items-center justify-between gap-2 px-3.5 pb-2.5 pt-0.5">
              {priceBlock ? (
                <div className={cn(cardBodyClassName, "min-w-0 shrink")}>{priceBlock}</div>
              ) : (
                <div className="min-w-0 flex-1" aria-hidden />
              )}
              <ImageRatingBadge gadget={gadget} compact inline />
            </div>
          </div>

          <div className="hidden min-h-0 min-w-0 flex-1 flex-col sm:flex">
            <div className={imageAreaClassName} aria-hidden>
              <div className="pointer-events-none h-full w-full">
                <GadgetImage
                  src={gadget.image}
                  alt={`${displayGadget.brand} ${displayGadget.name}`}
                  category={gadget.category}
                  sizes="(max-width: 768px) 50vw, 240px"
                  className={cn(imageClassName, "p-3")}
                />
              </div>
              {compareOnImage()}
              <ImageRatingBadge gadget={gadget} />
            </div>
            <div
              className={cn(
                cardBodyClassName,
                "flex min-w-0 flex-1 flex-col gap-2 overflow-hidden bg-white p-4 md:p-4 lg:p-5",
              )}
            >
              <h3 className={titleClassName}>{displayGadget.name}</h3>
              {showSpecs ? specHighlightsGrid("default") : null}
              {priceBlock}
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className={imageAreaClassName} aria-hidden>
            <div className="pointer-events-none h-full w-full">
              <GadgetImage
                src={gadget.image}
                alt={`${displayGadget.brand} ${displayGadget.name}`}
                category={gadget.category}
                sizes={
                  isSmall ? "(max-width: 768px) 50vw, 160px" : "(max-width: 768px) 100vw, 320px"
                }
                className={cn(imageClassName, isSmall ? "p-2" : "p-4")}
              />
            </div>
            {compareOnImage(isSmall)}
            <ImageRatingBadge gadget={gadget} compact={isSmall} />
          </div>

          <div
            className={cn(
              cardBodyClassName,
              "flex min-w-0 flex-1 flex-col overflow-hidden bg-white",
              isSmall ? "gap-1.5 p-3.5 md:p-4" : "gap-2 p-4 lg:p-5",
            )}
          >
            {showBrand ? (
              <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {displayGadget.brand}
              </span>
            ) : null}

            <h3 className={titleClassName}>{displayGadget.name}</h3>

            {showTagline && (
              <p className="line-clamp-1 min-h-[1.45em] text-[11px] leading-[1.45] text-muted-foreground">
                {displayGadget.tagline}
              </p>
            )}

            {showSpecs ? specHighlightsGrid("default") : null}
            {priceBlock}
          </div>
        </div>
      )}
    </article>
  )
})

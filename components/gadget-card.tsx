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
  withGamingChairCsvOverlay,
  type Gadget,
} from "@/lib/gadgets"
import { GadgetImage } from "@/components/gadget-image"

const badgeClassName =
  "inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold tracking-wide text-primary ring-1 ring-primary/20"

export type CardSize = "large" | "medium" | "small"

const IMAGE_RATING_BADGE_CLASS =
  "pointer-events-none absolute bottom-2 right-2 z-10 inline-flex h-6 min-w-[4.5rem] items-center justify-end gap-1 rounded bg-black/60 px-1.5 py-0.5 text-white backdrop-blur-sm"

function ImageRatingBadge({
  gadget,
  compact = false,
}: {
  gadget: Gadget
  compact?: boolean
}) {
  if (!hasDisplayReviews(gadget)) return null

  const rating = getDisplayRating(gadget)
  const reviews = getDisplayReviewCount(gadget)

  return (
    <div
      className={cn(IMAGE_RATING_BADGE_CLASS, compact ? "text-[10px] leading-none" : "text-xs leading-none")}
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
  const showRatingInBody = isLarge
  const showRatingOnImage = isMedium || isSmall
  const displayGadget = useMemo(() => withGamingChairCsvOverlay(gadget), [gadget])
  const highlights = useMemo(() => getCardHighlights(gadget), [gadget])
  const displayBadge = useMemo(() => getDisplayBadge(gadget), [gadget])

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200",
        isSmall && "rounded-lg",
        isComparing
          ? "border-primary/40 shadow-md ring-2 ring-primary/15"
          : "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
      )}
    >
      {displayBadge ? (
        <div
          className={cn(
            "pointer-events-none absolute z-10 flex flex-col items-start gap-1",
            isSmall ? "left-1.5 top-1.5 max-w-[calc(100%-2.5rem)]" : "left-2.5 top-2.5 max-w-[calc(100%-3rem)]",
          )}
        >
          <span className={cn(badgeClassName, isSmall && "px-1.5 text-[8px]")}>{displayBadge}</span>
        </div>
      ) : null}

      <div
        className={cn(
          "absolute z-10 flex items-center",
          isSmall ? "right-1.5 top-1.5 gap-1" : "right-2.5 top-2.5 gap-1.5",
        )}
      >
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
            "inline-flex items-center justify-center rounded-full text-xs shadow-sm transition-colors",
            isSmall ? "size-6" : "size-7",
            isComparing
              ? "bg-primary text-primary-foreground"
              : "bg-white/95 text-muted-foreground ring-1 ring-slate-200 backdrop-blur hover:text-foreground disabled:opacity-40",
          )}
        >
          {isComparing ? (
            <Check className={isSmall ? "size-3" : "size-3.5"} />
          ) : (
            <Plus className={isSmall ? "size-3" : "size-3.5"} />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(gadget.id)}
        className="flex min-h-0 min-w-0 flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          <GadgetImage
            src={gadget.image}
            alt={`${displayGadget.brand} ${displayGadget.name}`}
            category={gadget.category}
            sizes={
              isSmall
                ? "(max-width: 768px) 50vw, 160px"
                : isMedium
                  ? "(max-width: 768px) 50vw, 240px"
                  : "(max-width: 768px) 100vw, 320px"
            }
            className={cn(
              "transition-transform duration-300 group-hover:scale-[1.02]",
              isSmall ? "p-2" : isMedium ? "p-3" : "p-4",
            )}
          />
          {showRatingOnImage ? <ImageRatingBadge gadget={gadget} compact={isSmall} /> : null}
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-hidden bg-white",
            isSmall
              ? "gap-1.5 p-3.5 md:p-4"
              : isMedium
                ? "gap-2 p-4 md:p-4 lg:p-5"
                : "gap-2 p-4 lg:p-5",
          )}
        >
          {showBrand && (
            <div className="flex min-w-0 items-start justify-between gap-2">
              <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {displayGadget.brand}
              </span>
              {showRatingInBody ? (
                hasDisplayReviews(gadget) ? (
                  <span className="inline-flex min-w-0 shrink flex-wrap items-center justify-end gap-x-0.5 gap-y-0.5 text-[11px] text-chart-3">
                    <Star className="size-2.5 fill-chart-3 text-chart-3" />
                    {getDisplayRating(gadget).toFixed(1)}
                    <span className="text-muted-foreground">
                      ({getDisplayReviewCount(gadget).toLocaleString("ja-JP")})
                    </span>
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-muted-foreground">レビューなし</span>
                )
              ) : null}
            </div>
          )}

          <h3
            className={cn(
              "font-semibold leading-snug text-slate-900",
              isSmall ? "line-clamp-2 text-xs" : isMedium ? "line-clamp-2 text-sm" : "line-clamp-1 text-sm",
            )}
          >
            {displayGadget.name}
          </h3>

          {showTagline && (
            <p className="line-clamp-1 min-h-[1.45em] text-[11px] leading-[1.45] text-muted-foreground">
              {displayGadget.tagline}
            </p>
          )}

          {showSpecs && (
            <dl
              className={cn(
                "grid min-w-0 grid-cols-2 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 text-center",
                isMedium ? "gap-x-1.5 gap-y-1 p-2.5" : "gap-x-2 gap-y-1.5 p-3",
              )}
            >
              {highlights.map((h) => (
                <div key={`${gadget.id}-${h.label}`} className="min-w-0 overflow-hidden px-1 py-0.5">
                  <dt className="block min-w-0 truncate whitespace-nowrap text-xs leading-4 text-muted-foreground">
                    {getCardHighlightLabel(gadget, h.label)}
                  </dt>
                  <dd className="mt-0.5 block min-w-0 truncate whitespace-nowrap text-xs font-semibold leading-4 text-slate-800">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {hasCardDisplayPrice(gadget) ? (
            <p
              className={cn(
                "mt-auto font-mono font-semibold text-slate-900",
                isSmall ? "pt-0.5 text-sm" : isMedium ? "pt-0.5 text-sm" : "pt-1 text-base",
              )}
            >
              {formatPrice(getCardDisplayPrice(gadget)!)}
            </p>
          ) : null}
        </div>
      </button>
    </article>
  )
})

"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { X, Star, Cable } from "lucide-react"
import { CompatPill } from "@/components/compat-pill"
import { GadgetImage } from "@/components/gadget-image"
import { ShopLink } from "@/components/shop-link"
import {
  formatPrice,
  getGadgetConnectionDisplay,
  getCardHighlightLabel,
  getDetailHighlights,
  getDisplayBadge,
  getDisplayPrice,
  getReviewDisplayLabel,
  getListableGadgets,
  hasDisplayPrice,
  hasDisplayReviews,
  getDisplayRating,
  formatDetailSpecRowDisplayValue,
  showsGadgetConnection,
  gadgets,
  withGamingChairCsvOverlay,
  type Gadget,
} from "@/lib/gadgets"
import { getGamingChairDetailSpecSections } from "@/lib/gaming-chair-detail-specs"
import { getDetailFilterTags } from "@/lib/gadget-filters"
import {
  filterDetailSpecGroups,
  getMonitorDetailSpecGroups,
} from "@/lib/monitor-detail-specs"
import { getCameraDetailSpecGroups } from "@/lib/camera-detail-specs"
import { getMonitorArmDetailSpecGroups } from "@/lib/monitor-arm-detail-specs"
import { getAudioInterfaceDetailSpecGroups } from "@/lib/audio-interface-detail-specs"

const listableGadgetsForFilters = getListableGadgets(gadgets, false)

const detailTextClass =
  "whitespace-normal break-words text-pretty [overflow-wrap:anywhere]"

export function GadgetDetail({
  gadget,
  onClose,
}: {
  gadget: Gadget | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!gadget) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [gadget, onClose])

  if (!gadget) return null

  const displayGadget = withGamingChairCsvOverlay(gadget)
  const displayBadge = getDisplayBadge(gadget)
  const filterTags = getDetailFilterTags(gadget, listableGadgetsForFilters)
  const detailHighlights = getDetailHighlights(gadget)
  const gamingChairDetailSections =
    gadget.category === "gaming-chair" ? getGamingChairDetailSpecSections(gadget) : null
  let specGroups =
    gadget.category === "monitor"
      ? getMonitorDetailSpecGroups(gadget)
      : gadget.category === "camera"
        ? getCameraDetailSpecGroups(gadget)
        : gadget.category === "monitor-arm"
          ? getMonitorArmDetailSpecGroups(gadget)
          : gadget.category === "audio-interface"
            ? getAudioInterfaceDetailSpecGroups(gadget)
            : gadget.specGroups

  if (gadget.category === "gaming-chair") {
    specGroups = []
  }

  specGroups = filterDetailSpecGroups(specGroups)

  const detailHighlightsBlock = (
    <dl className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/50 p-3">
      {detailHighlights.map((h) => (
        <div
          key={`${gadget.id}-${h.label}`}
          className={cn(
            "min-w-0",
            "colSpan" in h && h.colSpan === 2 ? "col-span-2" : undefined,
          )}
        >
          <dt className={cn(detailTextClass, "text-[10px] font-medium leading-snug tracking-wide text-muted-foreground")}>
            {getCardHighlightLabel(gadget, h.label)}
          </dt>
          <dd className={cn(detailTextClass, "mt-0.5 font-mono text-sm font-medium leading-snug text-card-foreground")}>
            {h.value}
          </dd>
        </div>
      ))}
    </dl>
  )

  const connectionBlock =
    gadget.category !== "monitor" && showsGadgetConnection(gadget) ? (
    <div className="flex items-start gap-2 rounded-xl bg-secondary/40 px-3 py-2.5 text-sm">
      <Cable className="mt-0.5 size-4 shrink-0 text-primary/70" aria-hidden="true" />
      <p className={cn(detailTextClass, "min-w-0 leading-snug text-muted-foreground")}>
        <span className="font-medium text-foreground">接続</span>
        <span className="mx-1.5 text-border">/</span>
        {getGadgetConnectionDisplay(gadget)}
      </p>
    </div>
  ) : null

  const priceShopBlock = (
    <div className="space-y-3 border-t border-border/50 pt-4 lg:mt-auto lg:pt-5">
      {hasDisplayPrice(displayGadget) ? (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-mono text-2xl font-semibold tracking-tight text-card-foreground">
            {formatPrice(getDisplayPrice(displayGadget)!)}
          </span>
        </div>
      ) : null}
      <ShopLink
        gadget={gadget}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] animate-in fade-in"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${displayGadget.name} のスペック`}
        className="relative flex h-full w-full max-w-[100vw] flex-col overflow-x-hidden border-l border-border/60 bg-card shadow-2xl animate-in slide-in-from-right duration-300 sm:max-w-2xl md:max-w-4xl lg:w-[min(960px,62vw)] lg:max-w-none xl:w-[min(1040px,65vw)]"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-border/50 px-5 py-4 lg:gap-4">
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-secondary/50 to-card shadow-sm ring-1 ring-border/60 lg:hidden">
            <GadgetImage
              key={`${gadget.id}-header`}
              src={gadget.image}
              alt={`${displayGadget.brand} ${displayGadget.name}`}
              category={gadget.category}
              sizes="72px"
              className="p-1.5"
            />
            {displayBadge && (
              <span className="absolute left-1 top-1 inline-flex max-w-[calc(100%-0.5rem)] items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary ring-1 ring-primary/20">
                {displayBadge}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {displayGadget.brand}
            </p>
            <h2 className="text-balance text-lg font-semibold leading-snug text-card-foreground sm:text-xl">
              {displayGadget.name}
            </h2>
            {hasDisplayReviews(gadget) ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1 text-chart-3">
                  <Star className="size-3.5 fill-chart-3 text-chart-3" />
                  {getDisplayRating(gadget).toFixed(1)}
                </span>
                <span className="text-muted-foreground">{getReviewDisplayLabel(gadget)}</span>
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">{getReviewDisplayLabel(gadget)}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="inline-flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="flex min-w-0 flex-col lg:flex-row">
            {/* 左カラム: 画像・価格・主要スペック（デスクトップ） */}
            <div className="hidden min-w-0 shrink-0 flex-col border-b border-border/50 lg:flex lg:w-[min(340px,38%)] lg:border-b-0 lg:border-r">
              <div className="relative aspect-[5/4] w-full max-h-[min(36vh,320px)] overflow-hidden bg-gradient-to-b from-secondary/50 to-card">
                <GadgetImage
                  key={gadget.id}
                  src={gadget.image}
                  alt={`${displayGadget.brand} ${displayGadget.name}`}
                  category={gadget.category}
                  sizes="(max-width: 1024px) 100vw, 340px"
                  className="p-6"
                />
                {displayBadge && (
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                      {displayBadge}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 p-5 lg:p-6">
                {detailHighlightsBlock}
                {connectionBlock}
                {priceShopBlock}
              </div>
            </div>

            {/* モバイル: 主要スペック・価格（画像はヘッダー内サムネイル） */}
            <div className="flex flex-col gap-3 border-b border-border/50 p-5 lg:hidden">
              {detailHighlightsBlock}
              {connectionBlock}
              {priceShopBlock}
            </div>

            {/* 右カラム: 説明・互換性・詳細スペック */}
            <div className="min-w-0 flex-1 px-5 py-5 lg:px-7 lg:py-6">
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground">
                  商品説明
                </h3>
                <p className={cn(detailTextClass, "mt-3 text-[15px] leading-7 text-foreground/85 sm:text-base sm:leading-8")}>
                  {displayGadget.tagline}
                </p>
              </section>

              {filterTags.length > 0 && (
                <section className="mt-5">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground">
                    絞り込み条件
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filterTags.map((tag) => (
                      <CompatPill
                        key={tag.label}
                        tag={tag}
                        className="h-auto max-w-full whitespace-normal break-words text-left [overflow-wrap:anywhere]"
                      />
                    ))}
                  </div>
                </section>
              )}

              {gamingChairDetailSections ? (
                <section className="mt-6 min-w-0 space-y-5 border-t border-border/50 pt-6 pb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-primary">詳細情報</h3>
                    <dl className="mt-2.5 grid min-w-0 grid-cols-2 gap-2">
                      {gamingChairDetailSections.detailInfo.map((item) => (
                        <div
                          key={`${gadget.id}-detail-${item.label}`}
                          className="min-w-0 space-y-1 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm"
                        >
                          <dt className={cn(detailTextClass, "leading-snug text-muted-foreground")}>
                            {getCardHighlightLabel(gadget, item.label)}
                          </dt>
                          <dd className={cn(detailTextClass, "font-mono text-[13px] leading-snug text-card-foreground")}>
                            {formatDetailSpecRowDisplayValue(gadget, item.label, item.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-primary">フレーム</h3>
                    <dl className="mt-2.5 grid min-w-0 grid-cols-2 gap-2">
                      {gamingChairDetailSections.frame.map((item) => (
                        <div
                          key={`${gadget.id}-frame-${item.label}`}
                          className="min-w-0 space-y-1 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm"
                        >
                          <dt className={cn(detailTextClass, "leading-snug text-muted-foreground")}>
                            {getCardHighlightLabel(gadget, item.label)}
                          </dt>
                          <dd className={cn(detailTextClass, "font-mono text-[13px] leading-snug text-card-foreground")}>
                            {formatDetailSpecRowDisplayValue(gadget, item.label, item.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>
              ) : null}

              <section className="mt-6 min-w-0 space-y-5 pb-2">
                {specGroups.map((group) => (
                  <div key={group.title} className="min-w-0">
                    <h3 className="text-sm font-semibold text-primary">{group.title}</h3>
                    <dl className="mt-2.5 grid min-w-0 gap-2 sm:grid-cols-2">
                      {group.rows.map((row) => (
                        <div
                          key={row.label}
                          className="min-w-0 space-y-1 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm"
                        >
                          <dt className={cn(detailTextClass, "leading-snug text-muted-foreground")}>
                            {getCardHighlightLabel(gadget, row.label)}
                          </dt>
                          <dd className={cn(detailTextClass, "font-mono text-[13px] leading-snug text-card-foreground")}>
                            {formatDetailSpecRowDisplayValue(gadget, row.label, row.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

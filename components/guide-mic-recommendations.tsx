"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GUIDE_MIC_LIST_TITLES,
  GUIDE_MIC_PLACEHOLDER_MESSAGE,
  GUIDE_MIC_RECOMMENDATIONS,
  GUIDE_MIC_TABS,
  type GuideMicRecommendationId,
} from "@/lib/guide-mic-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import { preloadGuideProductImages } from "@/lib/guide-image-preload"
import { cn } from "@/lib/utils"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideMicRecommendationsProps = {
  pool: Gadget[]
}

export function GuideMicRecommendations({ pool }: GuideMicRecommendationsProps) {
  const [micType, setMicType] = useState<GuideMicRecommendationId>("dynamic")

  const picks = GUIDE_MIC_RECOMMENDATIONS[micType]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  useEffect(() => {
    const urls = [
      ...GUIDE_MIC_RECOMMENDATIONS.dynamic,
      ...GUIDE_MIC_RECOMMENDATIONS.condenser,
    ].flatMap((pick) => [pick.imageUrl, ...(pick.imageFallbackUrls ?? [])])
    return preloadGuideProductImages(urls, 8)
  }, [])

  useEffect(() => {
    const urls = picks.flatMap((pick) => [pick.imageUrl, ...(pick.imageFallbackUrls ?? [])])
    return preloadGuideProductImages(urls, 4)
  }, [picks])

  return (
    <section className="mb-12 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">おすすめのマイク</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            用途や使用環境に合わせて最適なマイクタイプを選択してください。
          </p>
        </div>
        <Link
          href="/?category=mic"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-2 md:gap-3">
        {GUIDE_MIC_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMicType(tab.id)}
            aria-pressed={micType === tab.id}
            className={cn(
              "rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all md:text-sm",
              micType === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-base font-bold text-foreground">
          {GUIDE_MIC_LIST_TITLES[micType]}
        </h3>

        {resolvedGadgets.length > 0 ? (
          resolvedGadgets.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="mic"
              gadget={gadget}
              priority={index < 2}
            />
          ))
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            {GUIDE_MIC_PLACEHOLDER_MESSAGE}
          </div>
        )}
      </div>
    </section>
  )
}

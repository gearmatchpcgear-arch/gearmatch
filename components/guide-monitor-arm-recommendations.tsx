"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import { GUIDE_MONITOR_ARM_RECOMMENDATIONS } from "@/lib/guide-monitor-arm-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import {
  collectGuideRecommendationImageUrls,
  preloadGuideProductImages,
} from "@/lib/guide-image-preload"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideMonitorArmRecommendationsProps = {
  pool: Gadget[]
}

export function GuideMonitorArmRecommendations({ pool }: GuideMonitorArmRecommendationsProps) {
  const resolved = useMemo(
    () =>
      GUIDE_MONITOR_ARM_RECOMMENDATIONS.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [pool],
  )

  useEffect(() => {
    const urls = collectGuideRecommendationImageUrls(GUIDE_MONITOR_ARM_RECOMMENDATIONS, (id) =>
      resolveGadget(id, pool),
    )
    return preloadGuideProductImages(urls, 6)
  }, [pool])

  return (
    <section className="mb-12 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">おすすめのモニターアーム</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            用途や予算に合わせたおすすめモデルと選定理由を紹介します。
          </p>
        </div>
        <Link
          href="/?category=monitor-arm"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      {resolved.map(({ pick, gadget }, index) => (
        <GuideRecommendationCard
          key={pick.id}
          pick={pick}
          category="monitor-arm"
          gadget={gadget}
          priority={index < 2}
        />
      ))}
    </section>
  )
}

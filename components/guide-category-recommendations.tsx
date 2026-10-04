"use client"

import { useMemo } from "react"
import Link from "next/link"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GUIDE_CATEGORY_RECOMMENDATIONS,
  type GuideCategoryRecommendationId,
} from "@/lib/guide-category-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideCategoryRecommendationsProps = {
  category: GuideCategoryRecommendationId
  categoryLabel: string
  pool: Gadget[]
}

export function GuideCategoryRecommendations({
  category,
  categoryLabel,
  pool,
}: GuideCategoryRecommendationsProps) {
  const picks = GUIDE_CATEGORY_RECOMMENDATIONS[category]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">おすすめの{categoryLabel}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            用途や予算に合わせたおすすめモデルと選定理由を紹介します。
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-foreground">おすすめモデル一覧</h3>

        {resolvedGadgets.map(({ pick, gadget }, index) => (
          <GuideRecommendationCard
            key={pick.id}
            pick={pick}
            category={category}
            gadget={gadget}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  )
}

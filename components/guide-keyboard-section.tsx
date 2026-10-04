"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GUIDE_KEYBOARD_LIST_TITLES,
  GUIDE_KEYBOARD_RECOMMENDATIONS,
  GUIDE_KEYBOARD_TABS,
  type GuideKeyboardRecommendationId,
} from "@/lib/guide-keyboard-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import { cn } from "@/lib/utils"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideKeyboardSectionProps = {
  pool: Gadget[]
}

export function GuideKeyboardSection({ pool }: GuideKeyboardSectionProps) {
  const [keyboardType, setKeyboardType] = useState<GuideKeyboardRecommendationId>("entry")

  const picks = GUIDE_KEYBOARD_RECOMMENDATIONS[keyboardType]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 border-b border-border/60 pb-4">
          {GUIDE_KEYBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setKeyboardType(tab.id)}
              aria-pressed={keyboardType === tab.id}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold transition-all md:text-sm",
                keyboardType === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-lg font-bold text-foreground">
              {GUIDE_KEYBOARD_LIST_TITLES[keyboardType]}
            </h3>
            <Link
              href="/"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              トップの一覧で比較する →
            </Link>
          </div>

          {resolvedGadgets.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="keyboard"
              gadget={gadget}
              priority={index < 2}
            />
          ))}
        </section>
      </div>
    </div>
  )
}

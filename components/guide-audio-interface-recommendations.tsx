"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GUIDE_AUDIO_INTERFACE_LIST_TITLES,
  GUIDE_AUDIO_INTERFACE_PLACEHOLDER_MESSAGES,
  GUIDE_AUDIO_INTERFACE_RECOMMENDATIONS,
  GUIDE_AUDIO_INTERFACE_TABS,
  type GuideAudioInterfaceRecommendationId,
} from "@/lib/guide-audio-interface-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import { cn } from "@/lib/utils"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideAudioInterfaceRecommendationsProps = {
  pool: Gadget[]
}

export function GuideAudioInterfaceRecommendations({
  pool,
}: GuideAudioInterfaceRecommendationsProps) {
  const [selectedType, setSelectedType] =
    useState<GuideAudioInterfaceRecommendationId>("beginner")

  const picks = GUIDE_AUDIO_INTERFACE_RECOMMENDATIONS[selectedType]

  const resolvedGadgets = useMemo(
    () =>
      picks.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [picks, pool],
  )

  const placeholderMessage =
    selectedType === "music" || selectedType === "streaming"
      ? GUIDE_AUDIO_INTERFACE_PLACEHOLDER_MESSAGES[selectedType]
      : null

  return (
    <section className="mb-12 space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Sparkles className="size-5 text-primary" aria-hidden />
            あなたに合うおすすめのオーディオインターフェイスを選ぶ
          </h2>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            用途ボタンを選択すると、最適なおすすめモデルと選定理由が表示されます。
          </p>
        </div>
        <Link
          href="/?category=audio-interface"
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary underline-offset-4 hover:underline md:mt-0"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3">
        {GUIDE_AUDIO_INTERFACE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedType(tab.id)}
            aria-pressed={selectedType === tab.id}
            className={cn(
              "rounded-lg px-5 py-2.5 text-xs font-bold shadow-sm transition-all md:text-sm",
              selectedType === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-base font-bold text-foreground">
          {GUIDE_AUDIO_INTERFACE_LIST_TITLES[selectedType]}
        </h3>

        {resolvedGadgets.length > 0 ? (
          resolvedGadgets.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="audio-interface"
              gadget={gadget}
              priority={index < 2}
            />
          ))
        ) : placeholderMessage ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            {placeholderMessage}
          </div>
        ) : null}
      </div>
    </section>
  )
}

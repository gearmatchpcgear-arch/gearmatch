"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import { GUIDE_MONITOR_GAMING_RECOMMENDATIONS } from "@/lib/guide-monitor-gaming-recommendations"
import { GUIDE_MONITOR_OFFICE_RECOMMENDATIONS } from "@/lib/guide-monitor-office-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import { cn } from "@/lib/utils"

type MonitorRecommendTab = "gaming" | "office"

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideMonitorSectionProps = {
  pool: Gadget[]
}

export function GuideMonitorSection({ pool }: GuideMonitorSectionProps) {
  const [activeTab, setActiveTab] = useState<MonitorRecommendTab>("gaming")

  const gamingPicks = useMemo(
    () =>
      GUIDE_MONITOR_GAMING_RECOMMENDATIONS.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [pool],
  )

  const officePicks = useMemo(
    () =>
      GUIDE_MONITOR_OFFICE_RECOMMENDATIONS.map((pick) => ({
        pick,
        gadget: resolveGadget(pick.gadgetId, pool),
      })),
    [pool],
  )

  return (
    <section className="my-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1.5 text-xl font-bold text-foreground md:text-2xl">
            おすすめのモニター
          </h2>
          <p className="text-xs text-muted-foreground md:text-sm">
            用途に合わせておすすめモデルの表示を切り替えられます。
          </p>
        </div>
        <Link
          href="/?category=monitor"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      <div className="mb-6 flex w-fit flex-wrap items-center gap-2.5 rounded-2xl border bg-muted/60 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("gaming")}
          aria-pressed={activeTab === "gaming"}
          className={cn(
            "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 md:text-sm",
            activeTab === "gaming"
              ? "border border-primary/20 bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:bg-background/40 hover:text-foreground",
          )}
        >
          ゲーミングモニターのおすすめ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("office")}
          aria-pressed={activeTab === "office"}
          className={cn(
            "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 md:text-sm",
            activeTab === "office"
              ? "border border-primary/20 bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:bg-background/40 hover:text-foreground",
          )}
        >
          オフィス・映像鑑賞のおすすめ
        </button>
      </div>

      {activeTab === "gaming" ? (
        <div className="space-y-6">
          {gamingPicks.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="monitor"
              gadget={gadget}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {officePicks.map(({ pick, gadget }, index) => (
            <GuideRecommendationCard
              key={pick.id}
              pick={pick}
              category="monitor"
              gadget={gadget}
              priority={index < 2}
            />
          ))}
        </div>
      )}
    </section>
  )
}

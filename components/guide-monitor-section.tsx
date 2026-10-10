"use client"

import { useMemo, useState } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsSection,
  GuideRecommendationsTabs,
} from "@/components/guide-recommendations-layout"
import { GUIDE_MONITOR_GAMING_RECOMMENDATIONS } from "@/lib/guide-monitor-gaming-recommendations"
import { GUIDE_MONITOR_OFFICE_RECOMMENDATIONS } from "@/lib/guide-monitor-office-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"

type MonitorRecommendTab = "gaming" | "office"

const MONITOR_TABS = [
  { id: "gaming" as const, label: "ゲーミングモニターのおすすめ" },
  { id: "office" as const, label: "オフィス・映像鑑賞のおすすめ" },
]

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

  const activePicks = activeTab === "gaming" ? gamingPicks : officePicks

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader categoryLabel="モニター" compareHref="/?category=monitor" />
      <GuideRecommendationsTabs
        tabs={MONITOR_TABS}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as MonitorRecommendTab)}
      />
      <GuideRecommendationsCardStack>
        {activePicks.map(({ pick, gadget }, index) => (
          <GuideRecommendationCard
            key={pick.id}
            pick={pick}
            category="monitor"
            gadget={gadget}
            priority={index < 2}
          />
        ))}
      </GuideRecommendationsCardStack>
    </GuideRecommendationsSection>
  )
}

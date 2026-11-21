"use client"

import { Suspense, useMemo, type ReactNode } from "react"
import { GuideRecommendationCard } from "@/components/guide-recommendation-card"
import {
  GuideRecommendationsCardStack,
  GuideRecommendationsHeader,
  GuideRecommendationsPanel,
  GuideRecommendationsSection,
  GuideRecommendationsTabs,
} from "@/components/guide-recommendations-layout"
import { GUIDE_MONITOR_GAMING_RECOMMENDATIONS } from "@/lib/guide-monitor-gaming-recommendations"
import { GUIDE_MONITOR_OFFICE_RECOMMENDATIONS } from "@/lib/guide-monitor-office-recommendations"
import { gadgets, type Gadget } from "@/lib/gadgets"
import { guideCategoryPath } from "@/lib/guide-routes"
import { useGuideRecommendationTabId } from "@/lib/use-guide-recommendation-tab-id"

type MonitorRecommendTab = "gaming" | "office"

const MONITOR_TABS = [
  { id: "gaming" as const, label: "ゲーミングモニターのおすすめ" },
  { id: "office" as const, label: "オフィス・映像鑑賞のおすすめ" },
]

const MONITOR_TAB_IDS = MONITOR_TABS.map((tab) => tab.id)

function resolveGadget(gadgetId: string | undefined, pool: Gadget[]): Gadget | undefined {
  if (!gadgetId) return undefined
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

type GuideMonitorSectionProps = {
  pool: Gadget[]
  seoSlot?: ReactNode
}

export function GuideMonitorSection({ pool, seoSlot }: GuideMonitorSectionProps) {
  const activeTab = useGuideRecommendationTabId(MONITOR_TAB_IDS, "gaming") as MonitorRecommendTab

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
        tabHrefBase={guideCategoryPath("monitor")}
      />
      {seoSlot ? <Suspense fallback={null}>{seoSlot}</Suspense> : null}
      <GuideRecommendationsPanel tabId={activeTab}>
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
      </GuideRecommendationsPanel>
    </GuideRecommendationsSection>
  )
}

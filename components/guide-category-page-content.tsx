"use client"

import { Suspense, useEffect, useMemo } from "react"
import { GuideNav } from "@/components/guide-nav"
import { GuidePointsSection } from "@/components/guide-points-section"
import { GuideAudioInterfaceRecommendations } from "@/components/guide-audio-interface-recommendations"
import { GuideCameraRecommendations } from "@/components/guide-camera-recommendations"
import { GuideCategoryRecommendations } from "@/components/guide-category-recommendations"
import { GuideCategoryTabSeoArticles } from "@/components/guide-category-tab-seo-articles"
import { GuideKeyboardSection } from "@/components/guide-keyboard-section"
import { GuideMicRecommendations } from "@/components/guide-mic-recommendations"
import { GuideMonitorArmRecommendations } from "@/components/guide-monitor-arm-recommendations"
import { GuideMonitorSection } from "@/components/guide-monitor-section"
import { GuideMouseRecommendations } from "@/components/guide-mouse-recommendations"
import { GUIDE_CONTENTS, getGuideSubtitle } from "@/lib/guide-content"
import {
  getGuideCategoryRecommendationImageUrls,
  preloadGuideProductImages,
} from "@/lib/guide-image-preload"
import { isGuideTabbedCategory } from "@/lib/guide-tab-config"
import { getGuideCategoryLabel, type GuideCategorySlug } from "@/lib/guide-routes"
import { getGuideCategoryDefaultTab, isGuideTabSeoCategory } from "@/lib/guide-tab-seo"
import { gadgets, getListableGadgets, type CategoryId } from "@/lib/gadgets"

type GuideCategoryPageContentProps = {
  category: GuideCategorySlug
  guideActiveTab?: string
}

function guideSeoSlot(category: CategoryId, initialTab?: string) {
  if (!isGuideTabSeoCategory(category)) return null
  const tab = initialTab ?? (isGuideTabbedCategory(category) ? getGuideCategoryDefaultTab(category) : "overview")
  return (
    <Suspense fallback={null}>
      <GuideCategoryTabSeoArticles category={category} initialTab={tab} />
    </Suspense>
  )
}

function GuideCategoryRecommendationsSection({
  category,
  pool,
  guideActiveTab,
}: {
  category: CategoryId
  pool: ReturnType<typeof getListableGadgets>
  guideActiveTab?: string
}) {
  const label = getGuideCategoryLabel(category)
  const seoSlot = guideSeoSlot(category, guideActiveTab)

  switch (category) {
    case "mouse":
      return <GuideMouseRecommendations pool={pool} seoSlot={seoSlot} />
    case "keyboard":
      return <GuideKeyboardSection pool={pool} seoSlot={seoSlot} />
    case "audio-interface":
      return <GuideAudioInterfaceRecommendations pool={pool} seoSlot={seoSlot} />
    case "mic":
      return <GuideMicRecommendations pool={pool} seoSlot={seoSlot} />
    case "camera":
      return <GuideCameraRecommendations pool={pool} seoSlot={seoSlot} />
    case "monitor-arm":
      return <GuideMonitorArmRecommendations pool={pool} seoSlot={seoSlot} />
    case "monitor":
      return <GuideMonitorSection pool={pool} seoSlot={seoSlot} />
    case "gaming-chair":
      return (
        <GuideCategoryRecommendations
          category={category}
          categoryLabel={label}
          pool={pool}
          seoSlot={seoSlot}
        />
      )
    default:
      return (
        <GuideCategoryRecommendations category={category} categoryLabel={label} pool={pool} />
      )
  }
}

export function GuideCategoryPageContent({
  category,
  guideActiveTab,
}: GuideCategoryPageContentProps) {
  const listableGadgets = useMemo(() => getListableGadgets(gadgets, false), [])
  const currentGuide = GUIDE_CONTENTS[category]
  const activeLabel = getGuideCategoryLabel(category)

  useEffect(() => {
    const urls = getGuideCategoryRecommendationImageUrls(category, listableGadgets)
    return preloadGuideProductImages(urls, 8)
  }, [category, listableGadgets])

  return (
    <div className="min-w-0 w-full max-w-full">
      <GuideNav currentCategory={category} />

      <GuidePointsSection
        title={currentGuide.title}
        titleIcon={currentGuide.titleIcon}
        subtitle={getGuideSubtitle(activeLabel, currentGuide.subtitle)}
        points={currentGuide.points}
        layout={currentGuide.pointsLayout}
        boxed={currentGuide.boxed}
      />

      <GuideCategoryRecommendationsSection
        category={category}
        pool={listableGadgets}
        guideActiveTab={guideActiveTab}
      />
    </div>
  )
}
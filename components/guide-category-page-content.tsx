"use client"

import { useEffect, useMemo } from "react"
import { GuideNav } from "@/components/guide-nav"
import { GuidePointsSection } from "@/components/guide-points-section"
import { GuideAudioInterfaceRecommendations } from "@/components/guide-audio-interface-recommendations"
import { GuideCameraRecommendations } from "@/components/guide-camera-recommendations"
import { GuideCategoryRecommendations } from "@/components/guide-category-recommendations"
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
import { getGuideCategoryLabel, type GuideCategorySlug } from "@/lib/guide-routes"
import { gadgets, getListableGadgets, type CategoryId } from "@/lib/gadgets"

type GuideCategoryPageContentProps = {
  category: GuideCategorySlug
}

function GuideCategoryRecommendationsSection({
  category,
  pool,
}: {
  category: CategoryId
  pool: ReturnType<typeof getListableGadgets>
}) {
  const label = getGuideCategoryLabel(category)

  switch (category) {
    case "mouse":
      return <GuideMouseRecommendations pool={pool} />
    case "keyboard":
      return <GuideKeyboardSection pool={pool} />
    case "audio-interface":
      return <GuideAudioInterfaceRecommendations pool={pool} />
    case "mic":
      return <GuideMicRecommendations pool={pool} />
    case "camera":
      return <GuideCameraRecommendations pool={pool} />
    case "monitor-arm":
      return <GuideMonitorArmRecommendations pool={pool} />
    case "monitor":
      return <GuideMonitorSection pool={pool} />
    default:
      return (
        <GuideCategoryRecommendations category={category} categoryLabel={label} pool={pool} />
      )
  }
}

export function GuideCategoryPageContent({ category }: GuideCategoryPageContentProps) {
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

      <GuideCategoryRecommendationsSection category={category} pool={listableGadgets} />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { CategoryIcon } from "@/components/category-icon"
import { CategoryScrollRow } from "@/components/category-scroll-row"
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
  categories,
  gadgets,
  getListableGadgets,
  type CategoryId,
} from "@/lib/gadgets"
import { cn } from "@/lib/utils"
import {
  getGuideCategoryRecommendationImageUrls,
  preloadGuideProductImages,
  preloadGuideSlowCategoryImages,
} from "@/lib/guide-image-preload"

export function GuidePageContent() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("mouse")

  const listableGadgets = useMemo(() => getListableGadgets(gadgets, false), [])

  useEffect(() => preloadGuideSlowCategoryImages(listableGadgets), [listableGadgets])

  useEffect(() => {
    const urls = getGuideCategoryRecommendationImageUrls(activeCategory, listableGadgets)
    return preloadGuideProductImages(urls, 8)
  }, [activeCategory, listableGadgets])

  const currentGuide = GUIDE_CONTENTS[activeCategory]
  const activeLabel = categories.find((c) => c.id === activeCategory)?.label ?? ""

  return (
    <>
      <div className="mb-6 min-w-0 max-w-full border-b border-border/60 pb-4">
        <CategoryScrollRow bleed>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onMouseEnter={() => {
                const urls = getGuideCategoryRecommendationImageUrls(category.id, listableGadgets)
                preloadGuideProductImages(urls, 6)
              }}
              onFocus={() => {
                const urls = getGuideCategoryRecommendationImageUrls(category.id, listableGadgets)
                preloadGuideProductImages(urls, 6)
              }}
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground shadow-sm ring-1 ring-border/70 hover:text-foreground hover:ring-primary/30",
              )}
            >
              <CategoryIcon
                category={category.id}
                className={cn(
                  "size-3.5",
                  activeCategory === category.id ? "text-primary-foreground/90" : "text-primary/70",
                )}
              />
              {category.label}
            </button>
          ))}
        </CategoryScrollRow>
      </div>

      <GuidePointsSection
        title={currentGuide.title}
        titleIcon={currentGuide.titleIcon}
        subtitle={getGuideSubtitle(activeLabel, currentGuide.subtitle)}
        points={currentGuide.points}
        layout={currentGuide.pointsLayout}
        boxed={currentGuide.boxed}
      />

      {activeCategory === "mouse" ? (
        <GuideMouseRecommendations pool={listableGadgets} />
      ) : activeCategory === "keyboard" ? (
        <GuideKeyboardSection pool={listableGadgets} />
      ) : activeCategory === "audio-interface" ? (
        <GuideAudioInterfaceRecommendations pool={listableGadgets} />
      ) : activeCategory === "mic" ? (
        <GuideMicRecommendations pool={listableGadgets} />
      ) : activeCategory === "camera" ? (
        <GuideCameraRecommendations pool={listableGadgets} />
      ) : activeCategory === "monitor-arm" ? (
        <GuideMonitorArmRecommendations pool={listableGadgets} />
      ) : activeCategory === "monitor" ? (
        <GuideMonitorSection pool={listableGadgets} />
      ) : (
        <GuideCategoryRecommendations
          category={activeCategory}
          categoryLabel={activeLabel}
          pool={listableGadgets}
        />
      )}
    </>
  )
}

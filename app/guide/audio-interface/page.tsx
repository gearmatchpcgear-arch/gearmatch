import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("audio-interface")
}

export default function GuideAudioInterfacePage() {
  return <GuideCategoryDedicatedPage category="audio-interface" guideActiveTab="beginner" />
}
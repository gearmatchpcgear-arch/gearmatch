import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("monitor-arm")
}

export default function GuideMonitorArmPage() {
  return <GuideCategoryDedicatedPage category="monitor-arm" guideActiveTab="overview" />
}
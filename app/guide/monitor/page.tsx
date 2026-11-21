import type { Metadata } from "next"
import { GuideCategoryDedicatedPage } from "@/components/guide-category-dedicated-page"
import { buildGuideCategoryPageMetadata } from "@/lib/guide-category-page-metadata"

export function generateMetadata(): Metadata {
  return buildGuideCategoryPageMetadata("monitor")
}

export default function GuideMonitorPage() {
  return <GuideCategoryDedicatedPage category="monitor" guideActiveTab="gaming" />
}
import type { GuideCategorySpec } from "@/lib/guide-category-recommendations"

/** ガイド・モニターカード左下に表示するスペック（順序固定） */
export const GUIDE_MONITOR_CARD_SPEC_LABELS = [
  "画面サイズ:",
  "解像度:",
  "液晶パネルの種類:",
  "リフレッシュレート:",
] as const

const LEGACY_PANEL_LABEL = "パネル:"

export function getGuideMonitorCardSpecs(
  specs: GuideCategorySpec[],
): GuideCategorySpec[] {
  const byLabel = new Map(specs.map((s) => [s.label, s]))

  if (!byLabel.has("液晶パネルの種類:") && byLabel.has(LEGACY_PANEL_LABEL)) {
    const legacy = byLabel.get(LEGACY_PANEL_LABEL)!
    byLabel.set("液晶パネルの種類:", {
      label: "液晶パネルの種類:",
      value: legacy.value,
    })
  }

  return GUIDE_MONITOR_CARD_SPEC_LABELS.flatMap((label) => {
    const spec = byLabel.get(label)
    return spec ? [spec] : []
  })
}

import type { CategoryId } from "@/lib/gadgets"
import { GUIDE_AUDIO_INTERFACE_TABS } from "@/lib/guide-audio-interface-recommendations"
import { GUIDE_KEYBOARD_TABS } from "@/lib/guide-keyboard-recommendations"
import { GUIDE_MIC_TABS } from "@/lib/guide-mic-recommendations"
import { GUIDE_MOUSE_TABS } from "@/lib/guide-mouse-recommendations"

export type GuideTabbedCategoryId =
  | "mouse"
  | "keyboard"
  | "mic"
  | "audio-interface"
  | "monitor"

export const GUIDE_TABBED_CATEGORY_IDS: readonly GuideTabbedCategoryId[] = [
  "mouse",
  "keyboard",
  "mic",
  "audio-interface",
  "monitor",
] as const

export const GUIDE_SINGLE_TAB_CATEGORY_IDS = ["camera", "monitor-arm", "gaming-chair"] as const satisfies readonly CategoryId[]

export type GuideSingleTabCategoryId = (typeof GUIDE_SINGLE_TAB_CATEGORY_IDS)[number]

export const GUIDE_CATEGORY_DEFAULT_TAB: Record<GuideTabbedCategoryId, string> = {
  mouse: "beginner",
  keyboard: "entry",
  mic: "dynamic",
  "audio-interface": "beginner",
  monitor: "gaming",
}

const MONITOR_TABS = [
  { id: "gaming", label: "ゲーミングモニターのおすすめ" },
  { id: "office", label: "オフィス・映像鑑賞のおすすめ" },
] as const

export function getGuideCategoryTabIds(category: GuideTabbedCategoryId): readonly string[] {
  switch (category) {
    case "mouse":
      return GUIDE_MOUSE_TABS.map((t) => t.id)
    case "keyboard":
      return GUIDE_KEYBOARD_TABS.map((t) => t.id)
    case "mic":
      return GUIDE_MIC_TABS.map((t) => t.id)
    case "audio-interface":
      return GUIDE_AUDIO_INTERFACE_TABS.map((t) => t.id)
    case "monitor":
      return MONITOR_TABS.map((t) => t.id)
    default:
      return []
  }
}

export function isGuideTabbedCategory(category: string): category is GuideTabbedCategoryId {
  return (GUIDE_TABBED_CATEGORY_IDS as readonly string[]).includes(category)
}
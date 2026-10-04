import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import {
  GAMING_CHAIR_DIMENSION_CARD_LABEL,
  getGamingChairDimensionCardDisplay,
} from "@/lib/gaming-chair-dimension-display"

export type GamingChairDimensionField =
  | "dimensions"
  | "seatDepth"
  | "seatWidth"
  | "backrestWidth"

const DIMENSION_LABELS: Record<GamingChairDimensionField, string> = {
  dimensions: GAMING_CHAIR_DIMENSION_CARD_LABEL,
  seatDepth: "座面の奥行",
  seatWidth: "座面の幅",
  backrestWidth: "背もたれ幅",
}

const DIMENSION_FIELDS: GamingChairDimensionField[] = [
  "dimensions",
  "seatDepth",
  "seatWidth",
  "backrestWidth",
]

export function hasGamingChairDimensionValue(value?: string): value is string {
  return Boolean(value && value !== UNSPECIFIED_SPEC && value !== "-")
}

/** 寸法プロパティが1つ以上あるか */
export function gamingChairHasDimensions(gadget: Gadget): boolean {
  if (gadget.category !== "gaming-chair") return false
  return DIMENSION_FIELDS.some((f) => hasGamingChairDimensionValue(gadget[f]))
}

/** カード・詳細上部用（値がある項目のみ） */
export function getGamingChairDimensionHighlights(
  gadget: Gadget,
): { label: string; value: string }[] {
  if (gadget.category !== "gaming-chair") return []
  return DIMENSION_FIELDS.flatMap((field) => {
    const value = gadget[field]
    if (!hasGamingChairDimensionValue(value)) return []
    const display =
      field === "dimensions" ? getGamingChairDimensionCardDisplay(gadget) : value!
    if (field === "dimensions" && display === UNSPECIFIED_SPEC) return []
    return [{ label: DIMENSION_LABELS[field], value: display }]
  })
}

/** 詳細モーダル「サイズ / 寸法」グループ用 */
export function getGamingChairDimensionSpecRows(gadget: Gadget): { label: string; value: string }[] {
  const cardDisplay = getGamingChairDimensionCardDisplay(gadget)
  const rows: { label: string; value: string }[] = []
  if (cardDisplay !== UNSPECIFIED_SPEC) {
    rows.push({ label: "本体寸法", value: cardDisplay })
  }
  for (const field of ["seatDepth", "seatWidth", "backrestWidth"] as const) {
    const value = gadget[field]
    if (!hasGamingChairDimensionValue(value)) continue
    rows.push({ label: DIMENSION_LABELS[field], value: value! })
  }
  return rows
}

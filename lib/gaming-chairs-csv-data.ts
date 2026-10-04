import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { GAMING_CHAIR_FRAME_CARD_LABEL } from "@/lib/gaming-chair-filter-tags"
import {
  formatDimensions,
  GAMING_CHAIR_DIMENSION_CARD_LABEL,
  isGamingChairDimensionCardLabel,
} from "@/lib/gaming-chair-dimension-display"
import { GAMING_CHAIR_OTTOMAN_CARD_LABEL } from "@/lib/gaming-chair-filter-tags"
import { parseGamingChairShapeCell } from "@/lib/gaming-chair-csv-shape"
import { GAMING_CHAIRS_CSV_BY_ID } from "@/lib/gaming-chairs-csv-data.generated"

/** `gaming_chairs.csv` に登録されたチェア ID（表示・検索の正） */
export const GAMING_CHAIR_CSV_IDS = Object.freeze(
  Object.keys(GAMING_CHAIRS_CSV_BY_ID),
) as readonly string[]

const GAMING_CHAIR_CSV_ID_SET = new Set<string>(GAMING_CHAIR_CSV_IDS)

export type GamingChairCsvRow = {
  id: string
  name: string
  description: string
  brand: string
  price: number | null
  material: string
  shape: string
  backrestWidth: string | null
  maxReclining: string
  frameType: string
  ottoman: string
  dimensions: string
  rating: number | null
  reviewCount: number | null
}

export function getGamingChairCsvRow(gadgetId: string): GamingChairCsvRow | undefined {
  return GAMING_CHAIRS_CSV_BY_ID[gadgetId]
}

export function hasGamingChairCsvRow(gadget: Gadget): boolean {
  return gadget.category === "gaming-chair" && GAMING_CHAIR_CSV_ID_SET.has(gadget.id)
}

/** 一覧に載せるゲーミングチェア（CSV 登録分のみ。画像・URL は Gadget 側を維持） */
export function isGamingChairListedInCsv(gadget: Gadget): boolean {
  return hasGamingChairCsvRow(gadget)
}

export function formatGamingChairCsvOttoman(raw: string): string {
  if (!raw || raw === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC
  if (raw === "あり" || /^付/i.test(raw)) return "あり"
  if (raw === "なし") return "なし"
  return raw
}

/** 画像・purchaseUrl は触らず、表示用テキストと評価のみ上書き */
export function withGamingChairCsvOverlay(gadget: Gadget): Gadget {
  const row = getGamingChairCsvRow(gadget.id)
  if (!row || gadget.category !== "gaming-chair") return gadget

  const csvPrice = row.price ?? null
  const { listPrice: _ignoredListPrice, ...gadgetWithoutListPrice } = gadget

  return {
    ...gadgetWithoutListPrice,
    name: row.name || gadget.name,
    tagline: row.description || gadget.tagline,
    brand: row.brand || gadget.brand,
    price: csvPrice ?? gadget.price,
    ...(csvPrice == null && gadget.listPrice != null ? { listPrice: gadget.listPrice } : {}),
    rating: row.rating ?? gadget.rating,
    reviews: row.reviewCount ?? gadget.reviews,
  }
}

/** 一覧カード：既存ラベル順のまま CSV 値のみ差し替え */
export function getGamingChairCsvCardHighlights(
  gadget: Gadget,
  labels: readonly string[],
): { label: string; value: string }[] | null {
  const row = getGamingChairCsvRow(gadget.id)
  if (!row) return null

  const valueForLabel = (label: string): string => {
    if (label === "素材") return row.material || UNSPECIFIED_SPEC
    if (label === "最大リクライニング角度") return row.maxReclining || UNSPECIFIED_SPEC
    if (isGamingChairDimensionCardLabel(label) || label === "寸法") {
      const formatted = formatDimensions(row.dimensions)
      return formatted === "-" ? UNSPECIFIED_SPEC : formatted
    }
    if (
      label === GAMING_CHAIR_OTTOMAN_CARD_LABEL ||
      label === "オットマン"
    ) {
      return formatGamingChairCsvOttoman(row.ottoman)
    }
    if (
      label === GAMING_CHAIR_FRAME_CARD_LABEL ||
      label === "フレームの種類" ||
      label === "アームレスト/保証"
    ) {
      return row.frameType || UNSPECIFIED_SPEC
    }
    return UNSPECIFIED_SPEC
  }

  return labels.map((label) => ({ label, value: valueForLabel(label) }))
}

export function buildGamingChairCsvShapeFields(shapeCell: string): {
  shape: string
  backrestWidth: string | null
} {
  return parseGamingChairShapeCell(shapeCell)
}

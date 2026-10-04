/** 形状フィルター用の定義済み3項目（サイドバー表示ラベル） */
export const GAMING_CHAIR_SHAPE_DEFINED_FILTER_LABELS = [
  "ハイバック",
  "クイーンアンバック",
  "座椅子タイプ",
] as const

const BUCKET_SHAPE_PATTERN = /バケットシート型（ハイバック）|バケットシート型/
const BUCKET_SHAPE_REPLACE = /バケットシート型（ハイバック）|バケットシート型/g

/** 詳細モーダル等の形状表示（バケットシート系 → ハイバック） */
export function formatShapeLabel(shape?: string): string {
  const raw = String(shape ?? "").trim()
  if (!raw || raw === "—" || raw === "-") {
    return "—"
  }
  return raw.replace(BUCKET_SHAPE_REPLACE, "ハイバック")
}

/** 絞り込み: 定義済み形状ラベルと raw `shape` の一致判定 */
export function gamingChairShapeMatchesDefinedFilter(shape: string, defined: string): boolean {
  const s = shape || ""

  if (defined === "ハイバック") {
    return BUCKET_SHAPE_PATTERN.test(s) || s.includes("ハイバック")
  }

  return s.includes(defined)
}

import { UNSPECIFIED_SPEC } from "@/lib/gadgets"

/** フィルター判定用：スペック値が未設定（空・`-`・`—`）か */
export function isUnsetFilterSpecValue(value: string | null | undefined): boolean {
  if (!value?.trim()) return true
  const trimmed = value.trim()
  return trimmed === UNSPECIFIED_SPEC || trimmed === "-"
}

/** フィルター判定用：スペック値が入力済みか */
export function isFilterSpecFilled(value: string | null | undefined): boolean {
  return !isUnsetFilterSpecValue(value)
}

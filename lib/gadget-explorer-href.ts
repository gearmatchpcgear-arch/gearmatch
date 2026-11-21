import type { CategoryId } from "@/lib/gadgets"
import { GADGET_DETAIL_QUERY_PARAM } from "@/lib/gadget-detail-url"

/** トップ一覧でカテゴリ＋製品詳細を開く内部リンク（クローラー向け） */
export function buildGadgetExplorerHref(category: CategoryId, gadgetId: string): string {
  const params = new URLSearchParams()
  params.set("category", category)
  params.set(GADGET_DETAIL_QUERY_PARAM, gadgetId)
  return `/?${params.toString()}`
}
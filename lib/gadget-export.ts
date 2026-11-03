import {
  categories,
  gadgets,
  getListableGadgets,
  type CategoryId,
  type Gadget,
} from "@/lib/gadgets"
import { csvRow } from "@/lib/gadget-csv-utils"
import { getMoshimoCardLinkForGadget, resolveGadgetExportLinkUrl } from "@/lib/moshimo-cardlink"

export const GADGET_EXPORT_CSV_HEADERS = [
  "カテゴリ",
  "ID",
  "カード名",
  "商品説明",
  "価格",
  "リンク先のURL",
] as const

const categoryLabelById = new Map(categories.map((c) => [c.id, c.label]))

export function getGadgetCategoryLabel(categoryId: CategoryId): string {
  return categoryLabelById.get(categoryId) ?? categoryId
}

/** トップ／検索一覧 UI と同じ表示対象（`getListableGadgets(gadgets, false)`） */
export function getUiListableGadgetsForExport(): Gadget[] {
  return getListableGadgets(gadgets, false)
}

export function gadgetToExportCsvRow(gadget: Gadget): string {
  return csvRow([
    getGadgetCategoryLabel(gadget.category),
    gadget.id,
    gadget.name,
    gadget.tagline,
    gadget.price ?? "",
    resolveGadgetExportLinkUrl(gadget),
  ])
}

/** かんたんリンク一括取り込み用（拡張列） */
export const GADGET_EXPORT_EXTENDED_HEADERS = [
  ...GADGET_EXPORT_CSV_HEADERS,
  "purchaseUrl",
  "moshimo_eid",
  "has_moshimo_cardlink",
] as const

export function gadgetToExtendedExportCsvRow(gadget: Gadget): string {
  const moshimo = getMoshimoCardLinkForGadget(gadget)
  return csvRow([
    getGadgetCategoryLabel(gadget.category),
    gadget.id,
    gadget.name,
    gadget.tagline,
    gadget.price ?? "",
    resolveGadgetExportLinkUrl(gadget),
    gadget.purchaseUrl,
    moshimo?.eid ?? "",
    moshimo ? "1" : "0",
  ])
}

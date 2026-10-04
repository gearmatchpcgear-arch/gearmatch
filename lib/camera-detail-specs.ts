import type { Gadget, SpecGroup } from "@/lib/gadgets"
import { filterDetailSpecGroups } from "@/lib/monitor-detail-specs"

const HIDDEN_CAMERA_DETAIL_GROUP_TITLES = new Set(["サイズ / 重量"])
const HIDDEN_CAMERA_DETAIL_LABELS = new Set(["寸法", "重量"])

/** カメラ詳細モーダル用: サイズ / 重量・寸法・重量を非表示 */
export function getCameraDetailSpecGroups(gadget: Gadget): SpecGroup[] {
  if (gadget.category !== "camera") return gadget.specGroups

  const filtered = gadget.specGroups
    .filter((group) => !HIDDEN_CAMERA_DETAIL_GROUP_TITLES.has(group.title))
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => !HIDDEN_CAMERA_DETAIL_LABELS.has(row.label)),
    }))
    .filter((group) => group.rows.length > 0)

  return filterDetailSpecGroups(filtered)
}

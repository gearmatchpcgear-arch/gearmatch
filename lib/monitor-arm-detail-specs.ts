import type { Gadget, SpecGroup } from "@/lib/gadgets"
import { filterDetailSpecGroups } from "@/lib/monitor-detail-specs"

const HIDDEN_MONITOR_ARM_DETAIL_LABELS = new Set(["重量"])

/** モニターアーム詳細モーダル用: 画面サイズ→対応サイズ、重量を非表示 */
export function getMonitorArmDetailSpecGroups(gadget: Gadget): SpecGroup[] {
  if (gadget.category !== "monitor-arm") return gadget.specGroups

  const filtered = gadget.specGroups
    .map((group) => ({
      ...group,
      rows: group.rows
        .filter((row) => !HIDDEN_MONITOR_ARM_DETAIL_LABELS.has(row.label))
        .map((row) =>
          row.label === "画面サイズ" ? { ...row, label: "対応サイズ" } : row,
        ),
    }))
    .filter((group) => group.rows.length > 0)

  return filterDetailSpecGroups(filtered)
}

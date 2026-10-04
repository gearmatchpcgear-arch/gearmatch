import type { Gadget, SpecGroup } from "@/lib/gadgets"
import { filterDetailSpecGroups } from "@/lib/monitor-detail-specs"
import {
  getAudioInterfaceDetailSpec,
} from "@/lib/audio-interface-filter-tags"
import { formatAudioInterfacePcConnectionDisplay } from "@/lib/audio-interface-pc-connection"

/** スプレッドシート B〜I 列に相当する詳細表示ラベル */
const VISIBLE_DETAIL_LABELS = new Set([
  "入力端子",
  "入力端子と数",
  "PC接続",
  "ファンタム電源",
  "システム要件",
  "サンプリングレート",
])

/** 赤色列・内部管理用（J/K列や旧スクレイプ項目）。UI に表示しない */
export const AUDIO_INTERFACE_HIDDEN_DETAIL_LABELS = new Set([
  "ダイレクトモニタリング",
  "ループバック",
  "主な用途",
  "機能",
  "ビット深度",
  "ビット数",
  "Bit Depth",
  "入力4以上",
  "入力数区分",
  "ソフト付き",
])

export function isAudioInterfaceHiddenDetailLabel(label: string): boolean {
  return AUDIO_INTERFACE_HIDDEN_DETAIL_LABELS.has(label.trim())
}

function filterAudioInterfaceSpecGroups(groups: SpecGroup[]): SpecGroup[] {
  return groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter(
        (row) =>
          VISIBLE_DETAIL_LABELS.has(row.label) &&
          !isAudioInterfaceHiddenDetailLabel(row.label),
      ),
    }))
    .filter((group) => group.rows.length > 0)
}

/** オーディオIF詳細モーダル用 specGroups（B〜I 列のみ・赤色列は除外） */
export function getAudioInterfaceDetailSpecGroups(gadget: Gadget): SpecGroup[] {
  const fromData = filterAudioInterfaceSpecGroups(gadget.specGroups)
  if (fromData.length > 0) {
    return filterDetailSpecGroups(fromData)
  }

  const rows = [
    { label: "入力端子", value: getAudioInterfaceDetailSpec(gadget, "入力端子と数") },
    { label: "PC接続", value: formatAudioInterfacePcConnectionDisplay(gadget) },
    { label: "ファンタム電源", value: getAudioInterfaceDetailSpec(gadget, "ファンタム電源") },
    { label: "システム要件", value: getAudioInterfaceDetailSpec(gadget, "システム要件") },
    {
      label: "サンプリングレート",
      value: getAudioInterfaceDetailSpec(gadget, "サンプリングレート"),
    },
  ].filter((row) => row.value && row.value !== "—")

  return filterDetailSpecGroups([{ title: "スペック", rows }])
}

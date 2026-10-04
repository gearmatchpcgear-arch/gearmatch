import type { Gadget } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"

/** マイク絞り込み用タグ（フィルターID mic-type-* と1:1対応） */
export type MicFilterTag =
  | "pin"
  | "conference"
  | "stand"
  | "condenser"
  | "dynamic"
  | "wireless"
  | "headset"

export const MIC_FILTER_TAG_LABELS: Record<MicFilterTag, string> = {
  pin: "ピンマイク",
  conference: "会議用マイク",
  stand: "スタンドマイク",
  condenser: "コンデンサーマイク",
  dynamic: "ダイナミックマイク",
  wireless: "ワイヤレスマイク",
  headset: "ヘッドセット / マイク付きイヤホン",
}

function getMicTypeStructuredText(gadget: Gadget): string {
  const parts: string[] = []

  const typeHighlight = gadget.highlights.find((h) => h.label === "タイプ")?.value
  if (isFilterSpecFilled(typeHighlight)) parts.push(typeHighlight!)

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "タイプ")
    if (isFilterSpecFilled(row?.value)) parts.push(row!.value)
  }

  if (isFilterSpecFilled(gadget.connection)) parts.push(gadget.connection!)

  return parts.join(" ")
}

function inferMicFilterTags(gadget: Gadget): MicFilterTag[] {
  if (gadget.category !== "mic") return []

  const hay = getMicTypeStructuredText(gadget).toLowerCase()
  if (!hay) return []

  const tags: MicFilterTag[] = []

  if (/ピンマイク|ラベリア|lavali|クリップ式|clip/i.test(hay)) tags.push("pin")
  if (/スピーカーフォン|会議用|conference speaker|アレイマイク/i.test(hay)) {
    tags.push("conference")
  }
  if (/スタンド|卓上|desk|三脚|tripod/i.test(hay) && !/ピンマイク|ラベリア|lavali/i.test(hay)) {
    tags.push("stand")
  }
  if (/コンデンサ|condenser/i.test(hay)) tags.push("condenser")
  if (/ダイナミック|dynamic/i.test(hay)) tags.push("dynamic")
  if (/ワイヤレス|wireless|2\.4\s*ghz|2\.4ghz/i.test(hay)) tags.push("wireless")
  if (/ヘッドセット|headset|マイク付き.*イヤホン|マイク付き.*ヘッド/i.test(hay)) tags.push("headset")

  return tags
}

/** 明示タグ + データから推論したタグをマージ（重複除去） */
export function inferMicFilterTagsMerged(gadget: Gadget): MicFilterTag[] {
  if (gadget.category !== "mic") return []

  const explicit = gadget.micFilterTags ?? []
  const inferred = inferMicFilterTags(gadget)
  return [...new Set([...explicit, ...inferred])]
}

export function hasMicFilterTag(gadget: Gadget, tag: MicFilterTag): boolean {
  return inferMicFilterTagsMerged(gadget).includes(tag)
}

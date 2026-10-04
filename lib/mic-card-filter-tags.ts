import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"

/** カード「指向性」に対応するフィルタータグ */
export type MicDirectionFilterTag =
  | "dir-cardioid"
  | "dir-omni"
  | "dir-switchable"
  | "dir-super"
  | "dir-other"

export const MIC_DIRECTION_LABELS: Record<MicDirectionFilterTag, string> = {
  "dir-cardioid": "単一指向性",
  "dir-omni": "全指向性",
  "dir-switchable": "指向性切替対応",
  "dir-super": "超単一指向性",
  "dir-other": "その他・未設定",
}

function micHaystack(gadget: Gadget): string {
  return [
    gadget.name,
    gadget.tagline,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ].join(" ")
}

function normalizeMicDirectionText(value: string): string {
  return value.normalize("NFKC").trim()
}

function getMicCardDirection(gadget: Gadget): string {
  const fromHighlight = gadget.highlights.find((h) => h.label === "指向性")?.value
  if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) return fromHighlight

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "指向性")
    if (row?.value && row.value !== UNSPECIFIED_SPEC) return row.value
  }
  return UNSPECIFIED_SPEC
}

function inferDirectionFromText(text: string): MicDirectionFilterTag | null {
  const normalized = normalizeMicDirectionText(text)
  if (!normalized || normalized === UNSPECIFIED_SPEC) return null

  if (/指向性切替|マルチパターン|[24]モード|4パターン|multi.?pattern|switchable/i.test(normalized)) {
    return "dir-switchable"
  }
  if (/超単一|スーパーカーディオイド|ハイパーカーディオイド|supercardioid|ショットガン|ライン\+ガン/i.test(normalized)) {
    return "dir-super"
  }
  if (/全指向|無指向|omnidirectional/i.test(normalized)) {
    return "dir-omni"
  }
  if (/単一指向|カーディオイド|cardioid/i.test(normalized)) {
    return "dir-cardioid"
  }
  return null
}

export function inferMicDirectionTags(gadget: Gadget): MicDirectionFilterTag[] {
  if (gadget.category !== "mic") return []

  const cardText = getMicCardDirection(gadget)
  if (cardText === UNSPECIFIED_SPEC) return []

  const fromCard = inferDirectionFromText(cardText)
  if (fromCard) return [fromCard]

  return ["dir-other"]
}

export function hasMicDirectionFilterTag(gadget: Gadget, tag: MicDirectionFilterTag): boolean {
  return inferMicDirectionTags(gadget).includes(tag)
}

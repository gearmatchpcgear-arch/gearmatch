import { UNSPECIFIED_SPEC, type Gadget } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"

type MouseSensitivityFields = Gadget & {
  mouseSensitivity?: string
  sensitivity?: string
  dpi?: string
}

const HIGHLIGHT_LABELS = ["最大DPI", "感度", "マウス最大感度"] as const
const SPEC_ROW_LABELS = ["最大 DPI", "最大DPI", "マウス最大感度", "感度"] as const

function readMouseSensitivityRaw(gadget: Gadget): string | null {
  if (gadget.category !== "mouse") return null

  const extended = gadget as MouseSensitivityFields
  for (const candidate of [extended.mouseSensitivity, extended.sensitivity, extended.dpi]) {
    if (isFilterSpecFilled(candidate)) return candidate!.trim()
  }

  for (const label of HIGHLIGHT_LABELS) {
    const value = gadget.highlights.find((h) => h.label === label)?.value
    if (isFilterSpecFilled(value)) return value!.trim()
  }

  for (const group of gadget.specGroups) {
    for (const label of SPEC_ROW_LABELS) {
      const value = group.rows.find((r) => r.label === label)?.value
      if (isFilterSpecFilled(value)) return value!.trim()
    }
  }

  return null
}

/** 一覧カード「感度」表示（数値のみの場合は DPI を補完） */
export function formatMouseSensitivityDisplay(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed || trimmed === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC
  if (/dpi/i.test(trimmed)) return trimmed
  if (/^[\d,]+$/.test(trimmed)) return `${trimmed} DPI`
  return trimmed
}

/** マウスカード「感度」表示 */
export function getMouseSensitivityDisplay(gadget: Gadget): string {
  const raw = readMouseSensitivityRaw(gadget)
  if (!raw) return UNSPECIFIED_SPEC
  return formatMouseSensitivityDisplay(raw)
}

import type { Gadget } from "@/lib/gadgets"

/** スプレッドシート I列（アームタイプ） */
export type MonitorArmSpreadsheetArmType = "シングルアーム" | "デュアルアーム" | "トリプルアーム"

export const MONITOR_ARM_ARM_TYPES: MonitorArmSpreadsheetArmType[] = [
  "シングルアーム",
  "デュアルアーム",
  "トリプルアーム",
]

export const MONITOR_ARM_ARM_TYPE_LABELS: Record<MonitorArmSpreadsheetArmType, string> = {
  シングルアーム: "シングルアーム",
  デュアルアーム: "デュアルアーム",
  トリプルアーム: "トリプルアーム",
}

export type MonitorArmArmTypeFilterId = "arm-type-single" | "arm-type-dual-or-more"

export const MONITOR_ARM_ARM_TYPE_FILTER_LABELS: Record<MonitorArmArmTypeFilterId, string> = {
  "arm-type-single": "シングルアーム",
  "arm-type-dual-or-more": "デュアルアーム以上",
}

function isEmptyArmType(value: string | undefined | null): boolean {
  if (!value) return true
  const t = value.trim()
  return !t || t === "-" || t === "—"
}

/** CSV I列の生値 → 正規化アームタイプ（空はシングル） */
export function normalizeMonitorArmSpreadsheetArmType(
  raw: string | undefined | null,
): MonitorArmSpreadsheetArmType {
  if (isEmptyArmType(raw)) return "シングルアーム"
  const t = raw.trim().normalize("NFKC")
  if (/トリプル|3画面/i.test(t)) return "トリプルアーム"
  if (/デュアル|2画面/i.test(t)) return "デュアルアーム"
  if (/シングル/i.test(t)) return "シングルアーム"
  return "シングルアーム"
}

export function formatMonitorArmCountLabel(armType: MonitorArmSpreadsheetArmType): string {
  if (armType === "デュアルアーム") return "デュアル (2画面)"
  if (armType === "トリプルアーム") return "トリプル (3画面)"
  return "シングル (1画面)"
}

export function getMonitorArmArmType(gadget: Gadget): MonitorArmSpreadsheetArmType {
  if (gadget.category !== "monitor-arm") return "シングルアーム"
  if (gadget.monitorArmSpreadsheetArmType) return gadget.monitorArmSpreadsheetArmType

  const fromHighlight = gadget.highlights.find((h) => h.label === "アーム数")?.value
  const armCountRow = gadget.specGroups
    .flatMap((g) => g.rows)
    .find((r) => r.label === "アーム数")?.value
  const hay = [fromHighlight, armCountRow, gadget.name, gadget.tagline].filter(Boolean).join(" ")

  if (/トリプル|3画面|4画面|多画面/i.test(hay)) return "トリプルアーム"
  if (/デュアル|2画面/i.test(hay)) return "デュアルアーム"
  if (/シングル|1画面/i.test(hay)) return "シングルアーム"

  return "シングルアーム"
}

export function matchesMonitorArmDualOrMoreArmType(gadget: Gadget): boolean {
  const armType = getMonitorArmArmType(gadget)
  return armType === "デュアルアーム" || armType === "トリプルアーム"
}

export function monitorArmArmTypeFilterMatch(
  gadget: Gadget,
  id: MonitorArmArmTypeFilterId,
): boolean {
  if (gadget.category !== "monitor-arm") return false
  if (id === "arm-type-single") {
    return getMonitorArmArmType(gadget) === "シングルアーム"
  }
  return matchesMonitorArmDualOrMoreArmType(gadget)
}

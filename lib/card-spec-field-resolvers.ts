import { UNSPECIFIED_SPEC, type Gadget } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"
import { normalizeMonitorRefreshDisplay } from "@/lib/spec-display-normalize"

type KeyboardLayoutFields = Gadget & {
  keyboardLayout?: string
  layout?: string
  switchType?: string
  axis?: string
  switch?: string
}

type MicFields = Gadget & {
  directivity?: string
  polarPattern?: string
  interface?: string
}

type MonitorFields = Gadget & {
  refreshRate?: string
  hz?: string
  responseTime?: string
}

function readSpecRowValue(gadget: Gadget, labels: string[]): string | null {
  for (const group of gadget.specGroups) {
    for (const label of labels) {
      const value = group.rows.find((r) => r.label === label)?.value
      if (isFilterSpecFilled(value)) return value!.trim()
    }
  }
  return null
}

function readHighlightValue(gadget: Gadget, labels: string[]): string | null {
  for (const label of labels) {
    const exact = gadget.highlights.find((h) => h.label === label)?.value
    if (isFilterSpecFilled(exact)) return exact!.trim()
  }
  return null
}

/** キーボード配列（表記揺れフォールバック） */
export function resolveKeyboardLayoutValue(gadget: Gadget): string | null {
  if (gadget.category !== "keyboard") return null
  const extended = gadget as KeyboardLayoutFields
  return (
    readHighlightValue(gadget, ["レイアウト", "配列"]) ??
    readSpecRowValue(gadget, ["レイアウト", "配列"]) ??
    extended.keyboardLayout ??
    extended.layout ??
    gadget.keyboardLayoutArray ??
    null
  )
}

/** キーボード内部構造 / 軸の種類（表記揺れフォールバック） */
export function resolveKeyboardSwitchStructureValue(gadget: Gadget): string | null {
  if (gadget.category !== "keyboard") return null
  const extended = gadget as KeyboardLayoutFields
  return (
    readHighlightValue(gadget, ["内部構造", "軸の種類", "スイッチ"]) ??
    readSpecRowValue(gadget, ["内部構造", "軸の種類", "スイッチ", "マウント"]) ??
    extended.switchType ??
    extended.axis ??
    extended.switch ??
    null
  )
}

/** マイク指向性（表記揺れフォールバック） */
export function resolveMicDirectivityValue(gadget: Gadget): string | null {
  if (gadget.category !== "mic") return null
  const extended = gadget as MicFields
  return (
    extended.directivity ??
    extended.polarPattern ??
    readHighlightValue(gadget, ["指向性"]) ??
    readSpecRowValue(gadget, ["指向性"]) ??
    null
  )
}

/** マイク接続端子（表記揺れフォールバック） */
export function resolveMicInterfaceValue(gadget: Gadget): string | null {
  if (gadget.category !== "mic") return null
  const extended = gadget as MicFields
  return (
    extended.interface ??
    readHighlightValue(gadget, ["接続方式", "端子", "接続端子"]) ??
    readSpecRowValue(gadget, ["接続方式", "端子", "接続端子"]) ??
    (isFilterSpecFilled(gadget.connection) ? gadget.connection.trim() : null)
  )
}

/** モニターリフレッシュレート（表記揺れフォールバック） */
export function resolveMonitorRefreshRateValue(gadget: Gadget): string | null {
  if (gadget.category !== "monitor") return null
  const extended = gadget as MonitorFields
  const raw =
    extended.refreshRate ??
    extended.hz ??
    readHighlightValue(gadget, ["リフレッシュレート", "リフレッシュ"]) ??
    readSpecRowValue(gadget, ["リフレッシュレート", "リフレッシュ"])
  if (!isFilterSpecFilled(raw)) return null
  return normalizeMonitorRefreshDisplay(raw!)
}

/** モニター応答速度（表記揺れフォールバック） */
export function resolveMonitorResponseTimeValue(gadget: Gadget): string | null {
  if (gadget.category !== "monitor") return null
  const extended = gadget as MonitorFields
  return (
    extended.responseTime ??
    readHighlightValue(gadget, ["応答速度", "応答時間"]) ??
    readSpecRowValue(gadget, ["応答速度", "応答時間"]) ??
    null
  )
}

export function filledOrUnspecified(value: string | null | undefined): string {
  return isFilterSpecFilled(value) ? value!.trim() : UNSPECIFIED_SPEC
}

import { getVerifiedUsbConnection } from "./usb-connection-verified"

export const UNSPECIFIED_SPEC = "—"

export function isEmptyConnectionValue(text?: string | null): boolean {
  if (!text) return true
  const trimmed = text.replace(/\s+/g, " ").trim()
  return trimmed === "" || trimmed === UNSPECIFIED_SPEC || trimmed === "-" || trimmed === "―"
}

export type UsbGadgetContext = {
  id: string
  category: string
  name: string
  tagline: string
  brand?: string
  connection?: string
  connectionType?: string
  highlights: { label: string; value: string }[]
  specGroups: { title?: string; rows: { label: string; value: string }[] }[]
}

export type UsbConnectorKind = "type-a" | "type-c" | "type-c-to-a"

export type UsbConnectorSpec = {
  kind: UsbConnectorKind
  detachable?: boolean
  pollingHz?: number
}

const USB_TYPE_A = "Type-A"
const USB_TYPE_C = "Type-C"

/** 端子規格（Type-A / Type-C）が明示されているか */
export function hasExplicitUsbConnectorType(text: string): boolean {
  if (!text) return false
  return (
    /type[-\s]?c|usb-c|usb type c|type c to|type-c to/i.test(text) ||
    /type[-\s]?a|usb-a|usb type a|usb\s*\(\s*a\s*\)/i.test(text) ||
    /有線\s*usb-c/i.test(text)
  )
}

/** 「有線 USB」「USB」のみ等、端子規格が曖昧な表記か */
export function isVagueWiredUsb(text: string): boolean {
  if (!text || text === UNSPECIFIED_SPEC || text === "—" || text === "-") return false

  const trimmed = text.replace(/\s+/g, " ").trim()
  if (hasExplicitUsbConnectorType(trimmed)) return false

  if (/^usb$/i.test(trimmed)) return true
  if (/^有線\s*usb$/i.test(trimmed)) return true
  if (/^有線\s*usb\s*\(/i.test(trimmed)) return true
  if (/\b有線\s*usb\b/i.test(trimmed) && !/bluetooth|2\.4|wifi|wireless|レシーバー/i.test(trimmed)) {
    return true
  }

  return false
}

function extractPollingHz(text: string): number | undefined {
  const match =
    text.match(/\(\s*8000\s*hz\s*\)/i) ??
    text.match(/\b8000\s*hz\b/i) ??
    text.match(/\b8\s*khz\b/i)
  if (match) return 8000
  const generic = text.match(/\((\d{3,5})\s*hz\)/i)
  if (generic) return Number(generic[1])
  return undefined
}

function extractDetachable(text: string): boolean {
  return /着脱|detach|removable\s*cable|着脱式ケーブル|detachable\s*type\s*c/i.test(text)
}

function isStandaloneConnectorListing(text: string): boolean {
  const trimmed = text.replace(/\s+/g, " ").trim()
  if (!hasExplicitUsbConnectorType(trimmed)) return false
  return !/^有線\s*usb/i.test(trimmed)
}

/** specGroups 内の「接続端子」行（カメラ等） */
export function getConnectionTerminalRowValue(gadget: UsbGadgetContext): string | null {
  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (row.label === "接続端子" && !isEmptyConnectionValue(row.value)) {
        return row.value.replace(/\s+/g, " ").trim()
      }
    }
  }
  return null
}

/** specGroups 内の「接続端子」グループから接続概要を生成（モニター等） */
export function summarizeConnectionTerminalGroup(gadget: UsbGadgetContext): string | null {
  for (const group of gadget.specGroups) {
    if (group.title !== "接続端子") continue

    const terminalRow = group.rows.find((row) => row.label === "接続端子")
    if (terminalRow && !isEmptyConnectionValue(terminalRow.value)) {
      return terminalRow.value.replace(/\s+/g, " ").trim()
    }

    const ports = group.rows
      .filter((row) => row.label !== "接続端子" && !isEmptyConnectionValue(row.value))
      .filter((row) => row.value === "対応" || /×\d+/.test(row.value) || /\d/.test(row.value))
      .map((row) => row.label.replace(/\s+/g, " ").trim())

    if (ports.length > 0) return ports.join(" / ")
  }

  return null
}

export function resolveGadgetConnectionSource(gadget: UsbGadgetContext): string | null {
  const fromConnection = gadget.connection?.replace(/\s+/g, " ").trim()
  if (fromConnection && !isEmptyConnectionValue(fromConnection)) return fromConnection

  const fromTerminalRow = getConnectionTerminalRowValue(gadget)
  if (fromTerminalRow) return fromTerminalRow

  const fromGroup = summarizeConnectionTerminalGroup(gadget)
  if (fromGroup) return fromGroup

  const fromType = gadget.connectionType?.replace(/\s+/g, " ").trim()
  if (fromType && !isEmptyConnectionValue(fromType)) return fromType

  return null
}

function parseExplicitKind(text: string): UsbConnectorKind | null {
  if (/type[-\s]?c\s*to\s*type?[-\s]?a|type-c\s*to\s*a|usb-c\s*to\s*usb-a|c\s*to\s*a|type c to a/i.test(text)) {
    return "type-c-to-a"
  }
  if (/type[-\s]?c|usb-c|usb type c|有線\s*usb-c/i.test(text)) return "type-c"
  if (/type[-\s]?a|usb-a|usb type a|usb\s*\(\s*a\s*\)/i.test(text)) return "type-a"
  return null
}

/** 充電端子の Type-C 表記（接続方式ではない） */
function isChargingOnlyTypeCText(text: string): boolean {
  return /type-c\s*充電|type-c充電|usb-c\s*充電|usb-c充電|充電式\s*[\(（]?\s*type-c|充電式\s*[\(（]?\s*usb-c|type-c\s*急速充電/i.test(
    text,
  )
}

/**
 * 商品名・説明から「有線接続の USB 端子規格」が明示されている場合のみ抽出。
 * Type-C充電 等の給電端子表記は除外する。
 */
function getStrictExplicitFromListing(gadget: UsbGadgetContext): UsbConnectorSpec | null {
  const text = `${gadget.name} ${gadget.tagline}`.replace(/\s+/g, " ")
  if (isChargingOnlyTypeCText(text) && !/有線.*type-c|type-c.*有線|usb-c.*有線|usb type-c接続|type-c接続/i.test(text)) {
    return null
  }

  const wiredTypeCPatterns = [
    /usb[\s-]?type[\s-]?c\s*(?:有線|接続|ケーブル|ポート)/i,
    /type[\s-]?c\s*有線/i,
    /type-c有線/i,
    /usb[\s-]?c\s*有線/i,
    /有線\s*usb[\s-]?type[\s-]?c/i,
    /usb[\s-]?type[\s-]?c接続/i,
    /usb[\s-]?c\s*マウス\s*有線/i,
    /usb\s*c\s*マウス\s*有線/i,
    /detachable\s*type\s*c\s*cable/i,
  ]
  const wiredTypeAPatterns = [
    /usb[\s-]?type[\s-]?a\s*(?:有線|接続|ケーブル|ポート)?/i,
    /コネクター形状[:：]\s*usb\s*\(\s*a\s*\)/i,
    /connector\s*shape:\s*usb\s*\(\s*a\s*\)/i,
    /usb\s*\(\s*a\s*\)\s*(?:male|オス)/i,
  ]

  if (wiredTypeCPatterns.some((re) => re.test(text))) {
    return {
      kind: "type-c",
      detachable: extractDetachable(text),
      pollingHz: extractPollingHz(text),
    }
  }
  if (wiredTypeAPatterns.some((re) => re.test(text))) {
    return { kind: "type-a", pollingHz: extractPollingHz(text) }
  }

  return null
}

/** 確認済みまたは商品説明の明示のみ。接続フィールド内の Type 表記は推測扱いで使わない。 */
export function inferUsbConnectorSpec(gadget: UsbGadgetContext): UsbConnectorSpec | null {
  const verified = getVerifiedUsbConnection(gadget.id)
  if (verified) {
    const kind = parseExplicitKind(verified)
    if (kind) {
      return {
        kind,
        detachable: extractDetachable(verified),
        pollingHz: extractPollingHz(verified),
      }
    }
  }

  if (gadget.category === "audio-interface" && gadget.connectionType) {
    const kind = parseExplicitKind(gadget.connectionType)
    if (kind) {
      return { kind, detachable: extractDetachable(gadget.connectionType) }
    }
  }

  return getStrictExplicitFromListing(gadget)
}

function kindLabel(kind: UsbConnectorKind): string {
  if (kind === "type-c-to-a") return `${USB_TYPE_C} to A`
  if (kind === "type-c") return USB_TYPE_C
  return USB_TYPE_A
}

function formatParenSuffix(spec: UsbConnectorSpec): string {
  const parts: string[] = []
  if (spec.detachable) parts.push("着脱式")
  if (spec.pollingHz) parts.push(`${spec.pollingHz}Hz`)
  return parts.length ? ` (${parts.join(", ")})` : ""
}

export function formatWiredUsbConnection(spec: UsbConnectorSpec): string {
  return `有線 USB ${kindLabel(spec.kind)}${formatParenSuffix(spec)}`
}

/** 推測で付与された Type-A/C を除去し、非規格の括弧（Hz 等）のみ残す */
export function stripSpeculativeUsbType(text: string): string {
  if (!text) return text
  let next = text.replace(/\s+/g, " ").trim()

  if (isStandaloneConnectorListing(next)) return next

  if (!hasExplicitUsbConnectorType(next)) return next

  const pollingHz = extractPollingHz(next)
  const detachable = extractDetachable(next)

  next = next
    .replace(/\s*type-c\s*to\s*a/gi, "")
    .replace(/\s*type-c/gi, "")
    .replace(/\s*type-a/gi, "")
    .replace(/\s*usb-c/gi, "")
    .replace(/\(\s*着脱式\s*,?\s*\)/gi, "")
    .replace(/\(\s*\d+\s*hz\s*\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()

  if (!/^有線\s*usb/i.test(next)) {
    if (/^usb$/i.test(next)) return "USB"
    return next
  }

  const suffixParts: string[] = []
  if (detachable) suffixParts.push("着脱式")
  if (pollingHz) suffixParts.push(`${pollingHz}Hz`)

  if (suffixParts.length === 0) return "有線 USB"
  return `有線 USB (${suffixParts.join(", ")})`
}

function normalizeLegacyExplicitFormat(trimmed: string, gadget: UsbGadgetContext): string | null {
  if (/有線\s*usb\s*\(\s*type-c\s*\)/i.test(trimmed)) {
    const spec = inferUsbConnectorSpec(gadget)
    if (!spec) return stripSpeculativeUsbType(trimmed)
    return formatWiredUsbConnection({ ...spec, kind: "type-c" })
  }
  if (/有線\s*usb-c/i.test(trimmed)) {
    const spec = inferUsbConnectorSpec(gadget)
    if (!spec) return "有線 USB"
    return formatWiredUsbConnection({ ...spec, kind: "type-c" })
  }
  return null
}

function normalizeWiredSegment(segment: string, gadget: UsbGadgetContext): string {
  const trimmed = segment.replace(/\s+/g, " ").trim()
  const verified = getVerifiedUsbConnection(gadget.id)
  if (verified && /有線\s*usb/i.test(trimmed)) return verified

  const legacy = normalizeLegacyExplicitFormat(trimmed, gadget)
  if (legacy) return legacy

  if (!isVagueWiredUsb(trimmed)) {
    if (hasExplicitUsbConnectorType(trimmed)) {
      if (isStandaloneConnectorListing(trimmed)) return trimmed
      const spec = inferUsbConnectorSpec(gadget)
      if (spec) return formatWiredUsbConnection(spec)
      const stripped = stripSpeculativeUsbType(trimmed)
      return stripped || trimmed
    }
    return trimmed
  }

  const spec = inferUsbConnectorSpec(gadget)
  if (spec) return formatWiredUsbConnection(spec)

  const pollingHz = extractPollingHz(trimmed)
  if (pollingHz) return `有線 USB (${pollingHz}Hz)`
  return "有線 USB"
}

/** 接続方式テキストを正規化（推測で Type 付与しない） */
export function normalizeUsbConnectionDisplay(text: string, gadget?: UsbGadgetContext): string {
  if (!text || text === UNSPECIFIED_SPEC || text === "—" || text === "-") return text

  const trimmed = text.replace(/\s+/g, " ").trim()

  if (gadget?.category === "audio-interface" && /^usb$/i.test(trimmed)) {
    return "USB"
  }

  if (!gadget) return trimmed

  if (/[\/／]/.test(trimmed)) {
    return trimmed
      .split(/\s*[\/／]\s*/)
      .map((part) => normalizeWiredSegment(part, gadget))
      .join(" / ")
  }

  return normalizeWiredSegment(trimmed, gadget)
}

/** データ保存用：確認済み / 商品説明明示のみ Type 付き。それ以外は有線 USB */
export function resolveStoredUsbConnection(gadget: UsbGadgetContext): string {
  const verified = getVerifiedUsbConnection(gadget.id)
  if (verified) return verified

  const raw = gadget.connection?.replace(/\s+/g, " ").trim() ?? ""
  if (!raw || raw === UNSPECIFIED_SPEC) return raw

  if (gadget.category === "audio-interface") {
    if (/^usb$/i.test(raw)) {
      const spec = inferUsbConnectorSpec(gadget)
      if (spec?.kind === "type-c") return "USB Type-C"
      if (spec?.kind === "type-a") return "USB Type-A"
      return "USB"
    }
    return raw
  }

  if (!/\b有線\s*usb\b/i.test(raw) && !hasExplicitUsbConnectorType(raw)) {
    return raw
  }

  const stripped = stripSpeculativeUsbType(raw)
  const spec = inferUsbConnectorSpec(gadget)
  if (spec) return formatWiredUsbConnection(spec)

  return stripped
}

/** 一覧・詳細モーダル用の接続表示 */
export function getGadgetConnectionDisplay(gadget: UsbGadgetContext): string {
  const raw = resolveGadgetConnectionSource(gadget)
  if (!raw) return UNSPECIFIED_SPEC

  const normalized = normalizeUsbConnectionDisplay(raw, gadget)
  if (isEmptyConnectionValue(normalized)) return raw
  return normalized
}

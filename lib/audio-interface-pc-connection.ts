export const UNSPECIFIED_PC_CONNECTION = "—"

export type AudioInterfaceGadgetLike = {
  purchaseUrl?: string
  connection?: string
  connectionType?: string
  inputs?: string
  name?: string
  tagline?: string
  highlights?: { label: string; value: string }[]
  specGroups: { rows: { label: string; value: string }[] }[]
}

/** Amazon / メーカー公式で PC 側端子を確認済みの ASIN のみ */
export const AI_PC_CONNECTION_VERIFIED: Record<string, string> = {
  /** RME Babyface Pro FS: USB2 Type-A→B + USB3 Type-C→B ケーブル同梱 */
  B081BVF3DH: "USB Type-A / Type-C",
  /** iRig Stream / Stream Pro: USB-C → mini-DIN ケーブル同梱 */
  B07Z6GWZPV: "USB Type-C",
  B09JZ1N321: "USB Type-C",
  B09D2JWQDY: "USB Type-C",
  /** iRig HD X: PC は USB-C、iOS は Lightning */
  B0CF2V1JNC: "USB Type-C",
  /** UCA202 / UCA222: PC 側 Type-A 一体型 dongle */
  B0023BYDHK: "USB Type-A (USB 1.1)",
  B000KW2YEI: "USB Type-A (USB 1.1)",
  /** 判別不能な汎用ストリーミング IF */
  B0FQNX9GGV: "USB",
}

function extractAsin(purchaseUrl?: string): string | null {
  const match = purchaseUrl?.match(/\/dp\/([A-Z0-9]{10})/i)
  return match ? match[1].toUpperCase() : null
}

function extractUsbVersion(text: string): string | null {
  const match = text.match(/\((USB\s*[\d.]+\s*(?:\/\s*USB\s*[\d.]+)?)\)/i)
  return match ? match[1].replace(/\s+/g, " ") : null
}

function extractSuffix(text: string): string | null {
  const match = text.match(/\(([^)]+)\)\s*$/)
  if (!match) return null
  const inner = match[1]
  if (/USB\s*[\d.]/i.test(inner)) return null
  return inner
}

function appendUsbVersion(base: string, source: string): string {
  const version = extractUsbVersion(source)
  if (version && !base.includes(version)) return `${base} (${version})`
  const suffix = extractSuffix(source)
  if (suffix) return `${base} (${suffix})`
  return base
}

/** 本体側 Type-B 等 → PC 側 Type-A へ（付属 A–B ケーブルが一般的な製品） */
function convertTypeBToPcTypeA(text: string): string {
  const version = extractUsbVersion(text)
  return version ? `USB Type-A (${version})` : "USB Type-A"
}

/**
 * オーディオIFの接続表記を PC 側 USB 端子（Type-A / Type-C）基準へ正規化。
 * PC 側が判別できない場合は「USB」のみ返す（推測で Type を付けない）。
 */
export function normalizeAudioInterfacePcConnection(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim()
  if (!text || text === UNSPECIFIED_PC_CONNECTION || text === "-") return text

  if (/^usb$/i.test(text)) return "USB"

  if (/thunderbolt/i.test(text)) {
    if (/thunderbolt\s*3/i.test(text)) return "Thunderbolt 3"
    if (/thunderbolt\s*4/i.test(text)) return "Thunderbolt 4"
    return "Thunderbolt"
  }

  if (/3\.5mm|trrs|30pin\s*dock/i.test(text) && !/usb type/i.test(text)) {
    return text
  }

  if (/lightning\s*\/\s*usb\s*\(/i.test(text) || /lightning\s*\/\s*usb\s*\(/i.test(text)) {
    return "USB Type-C"
  }

  if (/type-a\s*\/\s*type-c|type-c\s*\/\s*type-a/i.test(text)) {
    const version = extractUsbVersion(text)
    return version ? `USB Type-A / Type-C (${version})` : "USB Type-A / Type-C"
  }

  if (/type-c\s*\/\s*lightning/i.test(text)) {
    return appendUsbVersion("USB Type-C", text)
  }

  if (/mini-din/i.test(text)) {
    return "USB Type-C"
  }

  if (/usb\s*2\.0\s*\/\s*usb\s*3\.0/i.test(text)) {
    return "USB Type-A / Type-C"
  }

  if (/type-b|usb-b/i.test(text)) {
    return convertTypeBToPcTypeA(text)
  }

  if (/type-a|usb-a/i.test(text)) {
    return appendUsbVersion("USB Type-A", text)
  }

  if (/type-c|usb-c/i.test(text)) {
    return appendUsbVersion("USB Type-C", text)
  }

  if (/^usb\s/i.test(text) && !/type[-\s]?[abc]/i.test(text)) {
    return "USB"
  }

  return text
}

export type AudioInterfacePcConnectionInput = {
  purchaseUrl?: string
  connection?: string
  connectionType?: string
  pcConnection?: string
  name?: string
  tagline?: string
}

/** ガジェットから PC 接続表示値を解決（データ保存値・表示の共通ソース） */
export function resolveAudioInterfacePcConnection(
  input: AudioInterfacePcConnectionInput,
): string {
  const asin = extractAsin(input.purchaseUrl)
  if (asin && AI_PC_CONNECTION_VERIFIED[asin]) {
    return AI_PC_CONNECTION_VERIFIED[asin]
  }

  for (const candidate of [
    input.pcConnection,
    input.connectionType,
    input.connection,
  ]) {
    if (!candidate || candidate === UNSPECIFIED_PC_CONNECTION) continue
    const normalized = normalizeAudioInterfacePcConnection(candidate)
    if (normalized && normalized !== UNSPECIFIED_PC_CONNECTION) {
      return normalized
    }
  }

  return "USB"
}

export function getAudioInterfacePcConnectionFromGadget(
  gadget: AudioInterfaceGadgetLike,
): string {
  let pcConnection: string | undefined
  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "PC接続")
    if (row?.value && row.value !== UNSPECIFIED_PC_CONNECTION) {
      pcConnection = row.value
      break
    }
  }

  return resolveAudioInterfacePcConnection({
    purchaseUrl: gadget.purchaseUrl,
    connection: gadget.connection,
    connectionType: gadget.connectionType,
    pcConnection,
    name: gadget.name,
    tagline: gadget.tagline,
  })
}

/** 詳細モーダル・フィルター用の PC 接続表示 */
export function formatAudioInterfacePcConnectionDisplay(
  gadget: AudioInterfaceGadgetLike,
  rawValue?: string,
): string {
  if (rawValue && rawValue !== UNSPECIFIED_PC_CONNECTION) {
    const asin = extractAsin(gadget.purchaseUrl)
    if (asin && AI_PC_CONNECTION_VERIFIED[asin]) {
      return AI_PC_CONNECTION_VERIFIED[asin]
    }
    return normalizeAudioInterfacePcConnection(rawValue)
  }
  return getAudioInterfacePcConnectionFromGadget(gadget)
}

/** PC接続方式フィルター（5項目） */
export type AudioInterfacePcConnectionFilterTag =
  | "conn-usb-c"
  | "conn-usb-b"
  | "conn-bluetooth"
  | "conn-thunderbolt"
  | "conn-35mm"

function normalizePcConnectionHaystack(text: string): string {
  return text.replace(/ｍ/g, "m").replace(/\s+/g, " ").trim()
}

/** フィルター判定用: 正規化前の PC 接続表記を結合（Type-B 等を保持） */
function getRawPcConnectionHaystack(gadget: AudioInterfaceGadgetLike): string {
  const parts: string[] = []
  const asin = extractAsin(gadget.purchaseUrl)
  if (asin && AI_PC_CONNECTION_VERIFIED[asin]) {
    parts.push(AI_PC_CONNECTION_VERIFIED[asin])
  }
  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === "PC接続")
    if (row?.value && row.value !== UNSPECIFIED_PC_CONNECTION) {
      parts.push(row.value)
    }
  }
  if (gadget.connectionType) parts.push(gadget.connectionType)
  if (gadget.connection) parts.push(gadget.connection)
  return normalizePcConnectionHaystack(parts.join(" "))
}

function hasUsbCInPcConnection(hay: string): boolean {
  return /type[\s-]?c\b|usb-c|usb\s*type[\s-]?c|type-a\s*\/\s*type-c|type-c\s*\/\s*type-a/i.test(
    hay,
  )
}

function hasUsbBInPcConnection(hay: string): boolean {
  if (/type[\s-]?b\b|usb-b|usb-mini\s*b|mini[\s-]?b\b|usb\s*2\.0\s*\([^)]*type[\s-]?b/i.test(hay)) {
    return true
  }
  return /type[\s-]?c[\s、,]+\s*b\b/i.test(hay)
}

function has35mmPcConnection(hay: string): boolean {
  if (!/3\.5\s*mm|3\.5mm|trrs/i.test(hay)) return false
  return !/usb\s*type|type[\s-]?[abc]/i.test(hay)
}

const BLUETOOTH_SPEC_LABELS = new Set(["PC接続", "入力端子", "入力端子と数"])

/** Bluetooth 判定用: PC接続・入力端子・スペック表のテキストを結合 */
export function getAudioInterfaceBluetoothHaystack(gadget: AudioInterfaceGadgetLike): string {
  const parts: string[] = [getRawPcConnectionHaystack(gadget)]
  if (gadget.inputs) parts.push(gadget.inputs)
  if (gadget.highlights) {
    for (const highlight of gadget.highlights) {
      if (BLUETOOTH_SPEC_LABELS.has(highlight.label) && highlight.value !== UNSPECIFIED_PC_CONNECTION) {
        parts.push(highlight.value)
      }
    }
  }
  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (BLUETOOTH_SPEC_LABELS.has(row.label) && row.value !== UNSPECIFIED_PC_CONNECTION) {
        parts.push(row.value)
      }
    }
  }
  return normalizePcConnectionHaystack(parts.join(" "))
}

export function hasAudioInterfaceBluetoothSupport(gadget: AudioInterfaceGadgetLike): boolean {
  const hay = getAudioInterfaceBluetoothHaystack(gadget)
  return hay.length > 0 && /bluetooth/i.test(hay)
}

/** ガジェットの PC 接続方式フィルタータグ（USB-C / USB-B / Bluetooth / Thunderbolt / 3.5mm） */
export function getAudioInterfacePcConnectionFilterTags(
  gadget: AudioInterfaceGadgetLike,
): AudioInterfacePcConnectionFilterTag[] {
  const hay = getRawPcConnectionHaystack(gadget)
  if (!hay || hay === UNSPECIFIED_PC_CONNECTION) return []

  const tags: AudioInterfacePcConnectionFilterTag[] = []
  if (hasUsbCInPcConnection(hay)) tags.push("conn-usb-c")
  if (hasUsbBInPcConnection(hay)) tags.push("conn-usb-b")
  if (hasAudioInterfaceBluetoothSupport(gadget)) tags.push("conn-bluetooth")
  if (/thunderbolt/i.test(hay)) tags.push("conn-thunderbolt")
  if (has35mmPcConnection(hay)) tags.push("conn-35mm")
  return tags
}

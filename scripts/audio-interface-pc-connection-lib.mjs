/** PC 側 USB 端子表記への変換（scripts / lib 共通ロジックの Node 版） */

export const AI_PC_CONNECTION_VERIFIED = {
  B081BVF3DH: "USB Type-A / Type-C",
  B07Z6GWZPV: "USB Type-C",
  B09JZ1N321: "USB Type-C",
  B09D2JWQDY: "USB Type-C",
  B0CF2V1JNC: "USB Type-C",
  B0023BYDHK: "USB Type-A (USB 1.1)",
  B000KW2YEI: "USB Type-A (USB 1.1)",
  B0FQNX9GGV: "USB",
  B00UV71Y4I: "3.5mm TRRS / iOS",
  B005M7BCP8: "USB (30pin Dock / iOS)",
  B00R2IPLSY: "Thunderbolt",
  B0DKNPFVZY: "Thunderbolt 3",
}

export function extractAsinFromUrl(url) {
  return url?.match(/\/dp\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase() ?? null
}

function extractUsbVersion(text) {
  const match = text.match(/\((USB\s*[\d.]+\s*(?:\/\s*USB\s*[\d.]+)?)\)/i)
  return match ? match[1].replace(/\s+/g, " ") : null
}

function extractSuffix(text) {
  const match = text.match(/\(([^)]+)\)\s*$/)
  if (!match) return null
  if (/USB\s*[\d.]/i.test(match[1])) return null
  return match[1]
}

function appendUsbVersion(base, source) {
  const version = extractUsbVersion(source)
  if (version && !base.includes(version)) return `${base} (${version})`
  const suffix = extractSuffix(source)
  if (suffix) return `${base} (${suffix})`
  return base
}

function convertTypeBToPcTypeA(text) {
  const version = extractUsbVersion(text)
  return version ? `USB Type-A (${version})` : "USB Type-A"
}

export function normalizeAudioInterfacePcConnection(raw) {
  const text = String(raw ?? "").replace(/\s+/g, " ").trim()
  if (!text || text === "—" || text === "-") return text

  if (/^usb$/i.test(text)) return "USB"

  if (/thunderbolt/i.test(text)) {
    if (/thunderbolt\s*3/i.test(text)) return "Thunderbolt 3"
    if (/thunderbolt\s*4/i.test(text)) return "Thunderbolt 4"
    return "Thunderbolt"
  }

  if (/3\.5mm|trrs|30pin\s*dock/i.test(text) && !/usb type/i.test(text)) {
    return text
  }

  if (/lightning\s*\/\s*usb/i.test(text)) return "USB Type-C"

  if (/type-a\s*\/\s*type-c|type-c\s*\/\s*type-a/i.test(text)) {
    const version = extractUsbVersion(text)
    return version ? `USB Type-A / Type-C (${version})` : "USB Type-A / Type-C"
  }

  if (/type-c\s*\/\s*lightning/i.test(text)) {
    return appendUsbVersion("USB Type-C", text)
  }

  if (/mini-din/i.test(text)) return "USB Type-C"

  if (/usb\s*2\.0\s*\/\s*usb\s*3\.0/i.test(text)) {
    return "USB Type-A / Type-C"
  }

  if (/type-b|usb-b/i.test(text)) return convertTypeBToPcTypeA(text)

  if (/type-a|usb-a/i.test(text)) return appendUsbVersion("USB Type-A", text)

  if (/type-c|usb-c/i.test(text)) return appendUsbVersion("USB Type-C", text)

  if (/^usb\s/i.test(text) && !/type[-\s]?[abc]/i.test(text)) return "USB"

  return text
}

/** 仕様ソース（connectionType 等）から PC 側接続表記を解決 */
export function resolvePcConnectionFromSource({ asin, connectionType, pcConnection, connection }) {
  const normalizedAsin = asin?.toUpperCase?.() ?? asin
  if (normalizedAsin && AI_PC_CONNECTION_VERIFIED[normalizedAsin]) {
    return AI_PC_CONNECTION_VERIFIED[normalizedAsin]
  }

  for (const candidate of [pcConnection, connectionType, connection]) {
    if (!candidate || candidate === "—") continue
    const normalized = normalizeAudioInterfacePcConnection(candidate)
    if (normalized && normalized !== "—") return normalized
  }

  return "USB"
}

export function shortPcConnection(pcConnection) {
  if (!pcConnection || pcConnection === "—") return "—"
  if (/usb type-c/i.test(pcConnection)) return "USB Type-C"
  if (/usb type-a/i.test(pcConnection)) return "USB Type-A"
  if (/trrs|ios/i.test(pcConnection)) return "TRRS / iOS"
  return pcConnection.split("(")[0].trim()
}

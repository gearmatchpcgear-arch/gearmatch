export const UNSPECIFIED_SPEC = "—"

export type PowerGadgetContext = {
  category: string
  name: string
  tagline: string
  connection?: string
  highlights: { label: string; value: string }[]
  specGroups: { title?: string; rows: { label: string; value: string }[] }[]
}

const CONNECTIVITY_POWER_PATTERN =
  /^(?:bluetooth|2\.4\s*ghz|wifi|wireless|lightspeed|unifying|logi\s*bolt|有線\s*usb|usb\s*type|usb-c(?!\s*充電)|type-c(?!\s*充電)|usb\s*有線)/i

function powerHaystack(gadget: PowerGadgetContext): string {
  return [
    gadget.name,
    gadget.tagline,
    gadget.connection ?? "",
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ].join(" ")
}

function usesDisposableBattery(gadget: PowerGadgetContext): boolean {
  return /単[1234]形|単[一二三四]|単三|単四|\bAA\b|\bAAA\b|乾電池|アルカリ電池/i.test(
    powerHaystack(gadget),
  )
}

function isRechargeableGadget(gadget: PowerGadgetContext): boolean {
  if (usesDisposableBattery(gadget)) return false
  return /充電|内蔵|li-po|mah|充電式/i.test(powerHaystack(gadget))
}

function isDisposablePowerText(text: string): boolean {
  if (/リチウム|lithium|li-po|li-ion|充電式/i.test(text)) return false
  return /単[1234]形|単[一二三四]|単三|単四|\bAA\b|\bAAA\b|乾電池|アルカリ/i.test(text)
}

function formatDisposablePower(text: string): string {
  const sizeMatch = text.match(/単([1234])形|単([一二三四])形|\bAAA\b|\bAA\b(?![A-Za-z])/i)
  const size = sizeMatch
    ? sizeMatch[1] ??
      ({ 一: "1", 二: "2", 三: "3", 四: "4" } as Record<string, string>)[sizeMatch[2] ?? ""] ??
      (/\bAAA\b/i.test(text) ? "4" : "3")
    : text.includes("単4")
      ? "4"
      : text.includes("単2")
        ? "2"
        : "3"
  const count =
    text.match(/いずれか\s*(\d+)\s*本/i)?.[1] ??
    text.match(/[×x]\s*(\d+)/i)?.[1] ??
    text.match(/(\d+)\s*本/i)?.[1] ??
    text.match(/(\d+)\s*単[1234]形/i)?.[1] ??
    "1"
  if (/付属|\bx\d+\b/i.test(text)) return `単${size}形 乾電池（付属）`
  if (/単[1234]形.*[×x]\s*\d+/i.test(text)) {
    return text.match(/単[1234]形[^）)]*[×x]\s*\d+本?/i)?.[0]?.replace(/\s+/g, "") ?? `単${size}形乾電池×${count}本`
  }
  return `電池式（単${size}形乾電池 ${count}本）`
}

function isRechargeablePowerText(text: string, gadget: PowerGadgetContext): boolean {
  const context = `${gadget.name} ${gadget.tagline}`
  if (
    /充電式|type-c.*充電|usb.*充電|rechargeable|内蔵リチウム/i.test(context) &&
    !/単[1234]形\s*(乾電池|アルカリ)|電池式\s*[（(]\s*単[1234]/i.test(context)
  ) {
    return true
  }
  if (isDisposablePowerText(text)) return false
  if (/充電式|リチウム|lithium|li-po|内蔵|非標準バッテリ|rechargeable/i.test(text)) {
    return true
  }
  if (/バッテリー式/.test(text) && /リチウム|lithium/i.test(text)) return true
  return isRechargeableGadget(gadget) && !usesDisposableBattery(gadget)
}

function isConnectivityOnlyPower(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true
  if (/^(bluetooth|2\.4\s*ghz|wifi|wireless)$/i.test(trimmed)) return true
  if (/^2\.4\s*ghz\s*\(/i.test(trimmed) && !/[（(].*(単[1234]|乾電池|充電|電池)/i.test(trimmed)) {
    return true
  }
  if (/^bluetooth[（(]\s*給電\s*[）)]$/i.test(trimmed)) return true
  if (/^有線\s*usb/i.test(trimmed) && /給電/.test(trimmed) && !/単[1234]|乾電池|充電式/i.test(trimmed)) {
    return true
  }
  return false
}

/** 接続方式テキストを電源欄から除去し、給電・電池情報のみ残す */
export function stripConnectivityFromPowerText(text: string): string {
  if (!text || text === UNSPECIFIED_SPEC || text === "-") return text

  let next = text.replace(/\s+/g, " ").trim()

  if (/^有線\s*usb/i.test(next) && /給電/.test(next)) return "有線給電"

  const nestedPower = next.match(/[（(]([^）)]*(?:単[1234]|乾電池|充電|電池|給電|mAh)[^）)]*)[）)]/i)
  if (nestedPower && /^(?:bluetooth|2\.4|有線\s*usb|usb)/i.test(next)) {
    const inner = nestedPower[1].trim()
    if (/給電/.test(inner) && !/単[1234]|乾電池|充電/i.test(inner)) return "有線給電"
    return inner
  }

  const segments = next.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean)
  const powerSegments = segments.filter((part) => !CONNECTIVITY_POWER_PATTERN.test(part))
  if (powerSegments.length > 0) {
    next = powerSegments.join(" / ")
  }

  if (isConnectivityOnlyPower(next)) return ""

  return next.replace(/^有線\s*usb[^）)]*[（(]\s*給電\s*[）)]/i, "有線給電").trim()
}

export function readGadgetPowerRaw(gadget: PowerGadgetContext): string {
  const powerGroup = gadget.specGroups.find((g) => /接続|電源/i.test(g.title ?? ""))
  const row = powerGroup?.rows.find((r) => r.label === "電源")
  if (row?.value && row.value !== UNSPECIFIED_SPEC && row.value !== "-") {
    return stripConnectivityFromPowerText(row.value.trim())
  }
  return ""
}

/** 電源スペック行の正規化（給電方式のみ） */
export function formatGadgetPowerDisplay(gadget: PowerGadgetContext, rawValue: string): string {
  const cleaned = stripConnectivityFromPowerText(rawValue.trim())
  const raw = cleaned || rawValue.trim()
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return raw

  if (raw === "乾電池") return raw
  if (/^有線給電$/.test(raw)) return raw

  if (/^単3形\s*乾電池\s*[x×]?\s*1$/i.test(raw.replace(/\s+/g, ""))) return "単3形乾電池x1"
  if (/^単[1234]形乾電池[×x]\d+本?$/i.test(raw.replace(/\s+/g, ""))) {
    return raw.replace(/\s+/g, "")
  }

  if (/^有線\s*usb$/i.test((gadget.connection ?? "").trim()) && !raw) return "有線給電"

  if (/^充電式（内蔵バッテリー）$/.test(raw)) return "充電式"
  if (/^充電式\s*[\(（]/i.test(raw)) return "充電式"
  if (/^充電式$/.test(raw)) return raw
  if (/^電池式（単[1234]形乾電池 \d+本）$/.test(raw)) return raw
  if (/^単[1234]形 乾電池（付属）$/.test(raw)) return raw
  if (/^単[1234]形乾電池/.test(raw)) {
    if (/[×x]\d+/.test(raw)) return raw.replace(/\s+/g, "")
    return raw.replace(/\sx\d+$/, "（付属）")
  }

  if (/^(コード式|電源コード式|ケーブル付き)/.test(raw)) return "有線給電"

  if (/非標準バッテリ|リチウムイオン|リチウムポリマー|lithium\s*ion|li-po/i.test(raw) && !/単[1234]形/i.test(raw)) {
    return "充電式"
  }

  const context = `${gadget.name} ${gadget.tagline}`
  if (
    /充電式|type-c.*充電|usb.*充電|rechargeable/i.test(context) &&
    !/単[1234]形\s*(乾電池|アルカリ)|電池式\s*[（(]\s*単[1234]/i.test(context) &&
    !isDisposablePowerText(raw)
  ) {
    return "充電式"
  }

  const normalized = raw.replace(/^バッテリー式\s*[\/／]\s*/, "").trim()
  const source = normalized || raw

  if (isDisposablePowerText(source)) return formatDisposablePower(source)
  if (isRechargeablePowerText(source, gadget)) return "充電式"

  if (/^バッテリー式$/.test(raw)) {
    if (usesDisposableBattery(gadget)) return formatDisposablePower(raw)
    if (isRechargeableGadget(gadget)) return "充電式"
    return "電池式"
  }

  if (/^給電$/.test(raw)) return "有線給電"

  return raw
}

/** カード・詳細モーダル共通の「電源」表示 */
export function getGadgetPowerDisplay(gadget: PowerGadgetContext): string {
  const raw = readGadgetPowerRaw(gadget)

  if (raw) {
    const formatted = formatGadgetPowerDisplay(gadget, raw)
    if (formatted && formatted !== UNSPECIFIED_SPEC && formatted !== "-") return formatted
  }

  if (
    (gadget.category === "mouse" || gadget.category === "keyboard") &&
    /有線\s*usb|usb\s*有線|有線給電/i.test(gadget.connection ?? "")
  ) {
    return "有線給電"
  }

  return UNSPECIFIED_SPEC
}

export function powerDisplayNeedsDataCleanup(text: string): boolean {
  if (!text || text === UNSPECIFIED_SPEC || text === "-") return false
  if (/bluetooth|2\.4\s*ghz|有線\s*usb|usb type|lightspeed|unifying|logi bolt/i.test(text)) {
    if (!/^充電式\s*[\(（]\s*usb/i.test(text.trim())) return true
  }
  return stripConnectivityFromPowerText(text) !== text.replace(/\s+/g, " ").trim()
}

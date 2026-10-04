import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"

/** モニター壁掛けVESA規格（フィルター・表示用） */
export type MonitorVesaStandard =
  | "100×100 mm"
  | "75×75 mm"
  | "75×75 / 100×100 mm"
  | "200×200 mm以上"
  | "非対応"
  | typeof UNSPECIFIED_SPEC
  | string

export type MonitorVesaFilterTag = "vesa-100" | "vesa-75" | "vesa-200-plus" | "vesa-none"

export const MONITOR_VESA_FILTER_TAG_LABELS: Record<MonitorVesaFilterTag, string> = {
  "vesa-100": "100 × 100 mm",
  "vesa-75": "75 × 75 mm",
  "vesa-200-plus": "200 × 200 mm（200mm以上）",
  "vesa-none": "非対応",
}

function monitorHaystack(gadget: Gadget): string {
  return [
    gadget.name,
    gadget.tagline,
    gadget.connection,
    gadget.vesaStandard ?? "",
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ].join(" ")
}

function isLikelyVesaMountSize(w: number, h: number): boolean {
  const min = Math.min(w, h)
  const max = Math.max(w, h)
  if (min >= 1280 || max >= 2160) return false
  if (min < 50 || max > 800) return false
  if (max / min > 2.5) return false
  return true
}

function sizeKey(w: number, h: number): string {
  const a = Math.min(w, h)
  const b = Math.max(w, h)
  return `${a}×${b}`
}

function collectVesaSizeKeys(hay: string): string[] {
  const keys = new Set<string>()

  for (const m of hay.matchAll(
    /label:\s*"(?:VESA|壁掛け対応(?:（VESA規格）)?)"[^]*?value:\s*"([^"]+)"/gi,
  )) {
    appendSizesFromText(keys, m[1])
  }

  for (const m of hay.matchAll(
    /(?:VESA|壁掛け)[^"\n]{0,40}?(\d{2,3})\s*[x×*]\s*(\d{2,3})(?:\s*mm)?/gi,
  )) {
    addSizeKey(keys, Number(m[1]), Number(m[2]))
  }

  if (/vesa\s*75\b|vesa75\b/i.test(hay)) keys.add("75×75")
  if (/vesa\s*100\b|vesa100\b|vesa\s*100mm\b/i.test(hay)) keys.add("100×100")
  if (
    /vesa[^.\n]{0,32}\(\s*100\s*mm\s*\)|vesa\s*mount[^.\n]{0,32}100\s*mm|VESAマウント[^。]{0,16}\(\s*100\s*mm\s*\)/i.test(
      hay,
    )
  ) {
    keys.add("100×100")
  }
  if (/vesa[^.\n]{0,32}\(\s*75\s*mm\s*\)/i.test(hay)) keys.add("75×75")
  if (/vesa\s*200\b|vesa200\b/i.test(hay)) keys.add("200×200")
  if (/vesa\s*300\b|vesa300\b/i.test(hay)) keys.add("300×300")
  if (/vesa\s*400\b|vesa400\b/i.test(hay)) keys.add("400×400")

  const mountMatch = hay.match(/マウント規格[：:]\s*(\d{2,3})\s*[x×]\s*(\d{2,3})/i)
  if (mountMatch) addSizeKey(keys, Number(mountMatch[1]), Number(mountMatch[2]))

  // カード表示値（例: 100×100 mm / 75×75 / 100×100）を直接パース
  appendSizesFromText(keys, hay)

  return [...keys]
}

function appendSizesFromText(keys: Set<string>, text: string) {
  if (/非対応|不可|なし/i.test(text)) return

  for (const m of text.matchAll(/(\d{2,3})\s*[x×*]\s*(\d{2,3})(?:\s*mm)?/gi)) {
    addSizeKey(keys, Number(m[1]), Number(m[2]))
  }
  if (/100\s*mm\s*ピッチ|100mm\s*ピッチ/i.test(text)) keys.add("100×100")
  if (/75\s*mm\s*ピッチ|75mm\s*ピッチ/i.test(text)) keys.add("75×75")
  const pitch = text.match(/(\d{2,3})\s*mm\s*ピッチ/i)
  if (pitch) addSizeKey(keys, Number(pitch[1]), Number(pitch[1]))
}

function addSizeKey(keys: Set<string>, w: number, h: number) {
  if (!isLikelyVesaMountSize(w, h)) return
  keys.add(sizeKey(w, h))
}

function formatSizeLabel(key: string): string {
  return `${key} mm`
}

function getMonitorVesaStructuredTexts(gadget: Gadget): string[] {
  if (gadget.vesaStandard != null && String(gadget.vesaStandard).trim() !== "") {
    return isFilterSpecFilled(gadget.vesaStandard) ? [gadget.vesaStandard.trim()] : []
  }

  const texts: string[] = []

  for (const h of gadget.highlights) {
    if (/vesa|壁掛け/i.test(h.label) && isFilterSpecFilled(h.value)) {
      texts.push(h.value.trim())
    }
  }

  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (/vesa|壁掛け/i.test(row.label) && isFilterSpecFilled(row.value)) {
        texts.push(row.value.trim())
      }
    }
  }

  return texts
}

/** テキストから VESA 規格文字列を推論 */
export function inferMonitorVesaStandardFromText(hay: string): MonitorVesaStandard {
  const text = hay.trim()
  if (!text) return UNSPECIFIED_SPEC

  if (
    /^非対応$/i.test(text) ||
    /vesa\s*非対応|vesa非|壁掛け不可|壁掛け非対応|非対応\s*[（(]?vesa/i.test(text)
  ) {
    return "非対応"
  }

  const keys = collectVesaSizeKeys(text)
  if (keys.length === 0) {
    if (/vesa\s*対応|vesaマウント|vesa\s*準拠|vesa compatible|vesa mount/i.test(text)) {
      return UNSPECIFIED_SPEC
    }
    return UNSPECIFIED_SPEC
  }

  const has200Plus = keys.some((k) => {
    const max = Math.max(...k.split("×").map(Number))
    return max >= 200
  })

  if (has200Plus && keys.every((k) => Math.max(...k.split("×").map(Number)) >= 200)) {
    const largest = keys.sort((a, b) => {
      const am = Math.max(...a.split("×").map(Number))
      const bm = Math.max(...b.split("×").map(Number))
      return bm - am
    })[0]
    if (Math.max(...largest.split("×").map(Number)) >= 200) {
      return largest === "200×200" ? "200×200 mm" : "200×200 mm以上"
    }
  }

  const ordered = keys.sort((a, b) => {
    const am = Math.max(...a.split("×").map(Number))
    const bm = Math.max(...b.split("×").map(Number))
    return am - bm || a.localeCompare(b)
  })

  if (ordered.length === 1) return formatSizeLabel(ordered[0])
  return ordered.map(formatSizeLabel).join(" / ")
}

export function inferMonitorVesaStandard(gadget: Gadget): MonitorVesaStandard {
  if (gadget.category !== "monitor") return UNSPECIFIED_SPEC
  return inferMonitorVesaStandardFromText(monitorHaystack(gadget))
}

/** 商品の VESA 規格（明示プロパティ優先。`—` 明示時は haystack 推論しない） */
export function getMonitorVesaStandard(gadget: Gadget): MonitorVesaStandard {
  if (gadget.category !== "monitor") return UNSPECIFIED_SPEC
  if (gadget.vesaStandard != null && String(gadget.vesaStandard).trim() !== "") {
    if (!isFilterSpecFilled(gadget.vesaStandard)) return UNSPECIFIED_SPEC
    return gadget.vesaStandard
  }
  return inferMonitorVesaStandard(gadget)
}

export function getMonitorVesaStandardDisplay(gadget: Gadget): string {
  const value = getMonitorVesaStandard(gadget)
  return value === UNSPECIFIED_SPEC ? UNSPECIFIED_SPEC : value
}

function textHasVesa200PlusSize(text: string): boolean {
  if (/200\s*mm\s*以上|200×200\s*mm\s*以上/i.test(text)) return true

  for (const m of text.matchAll(/(\d{2,3})\s*[x×*]\s*(\d{2,3})(?:\s*mm)?/gi)) {
    const w = Number(m[1])
    const h = Number(m[2])
    if (!isLikelyVesaMountSize(w, h)) continue
    if (Math.max(w, h) >= 200) return true
  }

  return false
}

export function getMonitorVesaFilterTags(gadget: Gadget): MonitorVesaFilterTag[] {
  if (gadget.category !== "monitor") return []

  const structuredTexts = getMonitorVesaStructuredTexts(gadget)
  if (structuredTexts.length === 0) return []

  const inferred = structuredTexts.map((text) => inferMonitorVesaStandardFromText(text))
  if (inferred.some((value) => value === "非対応")) return ["vesa-none"]

  const tags: MonitorVesaFilterTag[] = []
  const combined = inferred.join(" ").toLowerCase()

  if (/75\s*[x×]\s*75/.test(combined)) tags.push("vesa-75")
  if (/100\s*[x×]\s*100/.test(combined)) tags.push("vesa-100")
  if (structuredTexts.some(textHasVesa200PlusSize)) tags.push("vesa-200-plus")

  return [...new Set(tags)]
}

export function hasMonitorVesaFilterTag(gadget: Gadget, tag: MonitorVesaFilterTag): boolean {
  if (gadget.category !== "monitor") return false
  if (getMonitorVesaStructuredTexts(gadget).length === 0) return false
  return getMonitorVesaFilterTags(gadget).includes(tag)
}

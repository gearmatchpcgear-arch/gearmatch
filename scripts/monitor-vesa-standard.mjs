/**
 * VESA規格推論（backfill / generate 用。lib/monitor-vesa-standard.ts と同等ロジック）
 */
export const DASH = "—"

function isLikelyVesaMountSize(w, h) {
  const min = Math.min(w, h)
  const max = Math.max(w, h)
  if (min >= 1280 || max >= 2160) return false
  if (min < 50 || max > 800) return false
  if (max / min > 2.5) return false
  return true
}

function sizeKey(w, h) {
  const a = Math.min(w, h)
  const b = Math.max(w, h)
  return `${a}×${b}`
}

function addSizeKey(keys, w, h) {
  if (!isLikelyVesaMountSize(w, h)) return
  keys.add(sizeKey(w, h))
}

function appendSizesFromText(keys, text) {
  if (/非対応|不可|なし/i.test(text)) return
  for (const m of text.matchAll(/(\d{2,3})\s*[x×*]\s*(\d{2,3})(?:\s*mm)?/gi)) {
    addSizeKey(keys, Number(m[1]), Number(m[2]))
  }
  if (/100\s*mm\s*ピッチ|100mm\s*ピッチ/i.test(text)) keys.add("100×100")
  if (/75\s*mm\s*ピッチ|75mm\s*ピッチ/i.test(text)) keys.add("75×75")
  const pitch = text.match(/(\d{2,3})\s*mm\s*ピッチ/i)
  if (pitch) addSizeKey(keys, Number(pitch[1]), Number(pitch[1]))
}

function collectVesaSizeKeys(hay) {
  const keys = new Set()

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

  return [...keys]
}

function formatSizeLabel(key) {
  return `${key} mm`
}

export function inferMonitorVesaStandardFromText(hay) {
  const text = String(hay).trim()
  if (!text) return DASH

  if (/vesa\s*非対応|vesa非|壁掛け不可|壁掛け非対応|非対応\s*[（(]?vesa/i.test(text)) {
    return "非対応"
  }

  const keys = collectVesaSizeKeys(text)
  if (keys.length === 0) {
    return DASH
  }

  const has200Plus = keys.some((k) => Math.max(...k.split("×").map(Number)) >= 200)
  if (has200Plus && keys.every((k) => Math.max(...k.split("×").map(Number)) >= 200)) {
    const largest = keys.sort(
      (a, b) => Math.max(...b.split("×").map(Number)) - Math.max(...a.split("×").map(Number)),
    )[0]
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

export function inferMonitorVesaStandardFromBlock(block) {
  const name = block.match(/^\s*name:\s*"([^"]*)"/m)?.[1] ?? ""
  const tagline = block.match(/^\s*tagline:\s*"([^"]*)"/m)?.[1] ?? ""
  const hay = `${name} ${tagline} ${block.replace(/\\"/g, '"').replace(/\n/g, " ")}`
  return inferMonitorVesaStandardFromText(hay)
}

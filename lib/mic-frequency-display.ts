const UNSPECIFIED_SPEC = "—"

/** Parse numeric Hz value: 18000, 18k, 18 kHz, 18,000 Hz */
function parseHzToken(raw: string): number | null {
  const t = String(raw)
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, "")
  const kMatch = t.match(/^([\d.]+)\s*(?:k(?:hz)?|キロヘルツ|kHz|KHz|KHZ|kHZ)$/i)
  if (kMatch) return Math.round(Number(kMatch[1]) * 1000)
  const hzMatch = t.match(/^([\d.]+)\s*(?:hz|ヘルツ|Hz|HZ)?$/i)
  if (hzMatch) return Math.round(Number(hzMatch[1]))
  return null
}

/** Card / detail display: 20Hz, 17kHz */
export function formatMicFrequencyHz(hz: number): string {
  if (hz >= 1000) {
    const k = hz / 1000
    const val = Number.isInteger(k) ? `${k}` : k.toFixed(1).replace(/\.0$/, "")
    return `${val}kHz`
  }
  return `${hz}Hz`
}

/** Normalize raw frequency range string to { lowHz, highHz } or null */
export function parseMicFrequencyRange(raw: string): { lowHz: number; highHz: number } | null {
  if (!raw) return null
  const text = String(raw)
    .normalize("NFKC")
    .replace(/[〜～~]/g, "–")
    .replace(/\s*to\s*/gi, "–")
    .replace(/\s*-\s*/g, "–")
    .replace(/\s+/g, " ")
    .trim()

  const rangeMatch = text.match(
    /([\d,.]+)\s*(?:Hz|ヘルツ|hz|HZ)?\s*[–—−-]\s*([\d,.]+)\s*(?:kHz|k|KHz|KHZ|キロヘルツ|Hz|ヘルツ|hz|HZ)?/i,
  )
  if (rangeMatch) {
    const low = parseHzToken(rangeMatch[1])
    let high = parseHzToken(rangeMatch[2])
    const afterHigh = text.slice(text.indexOf(rangeMatch[2]) + rangeMatch[2].length)
    if (high !== null && high < 200 && /\bk/i.test(afterHigh)) {
      high = high * 1000
    }
    if (high === null) {
      const n = parseHzToken(rangeMatch[2])
      if (n !== null && n < 200) high = n * 1000
      else high = n
    }
    if (low !== null && high !== null && low < high && low >= 10 && high <= 100000) {
      if (high < 1000) return null
      return { lowHz: low, highHz: high }
    }
  }

  const compact = text.match(/([\d.]+)\s*Hz\s*[–—−-]\s*([\d.]+)\s*kHz/i)
  if (compact) {
    const low = parseHzToken(compact[1])
    const high = parseHzToken(`${compact[2]}kHz`)
    if (low && high && low < high) return { lowHz: low, highHz: high }
  }

  return null
}

/** 周波数特性の統一表記（例: 20Hz-17kHz） */
export function normalizeMicFrequencyResponseDisplay(value: string): string {
  const t = value.trim().normalize("NFKC")
  if (!t || t === UNSPECIFIED_SPEC || t === "-") return t

  const range = parseMicFrequencyRange(t)
  if (range) {
    return `${formatMicFrequencyHz(range.lowHz)}-${formatMicFrequencyHz(range.highHz)}`
  }

  return t
    .replace(/[〜～~–—−]/g, "-")
    .replace(/(\d[\d,.]*)\s*(?:k(?:hz)?|KHz|KHZ|kHZ|キロヘルツ)/gi, (_, n) => `${n.replace(/,/g, "")}kHz`)
    .replace(/(\d[\d,.]*)\s*(?:hz|HZ|ヘルツ)(?![a-z])/gi, (_, n) => `${n.replace(/,/g, "")}Hz`)
    .replace(/\s*-\s*/g, "-")
}

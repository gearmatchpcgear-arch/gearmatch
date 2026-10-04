/**
 * Parse Amazon.co.jp mic frequency response from product detail table / bullets.
 */
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"

export const DASH = "—"

const FREQ_KEY_RE =
  /^(周波数特性|周波数応答|周波数レスポンス|Frequency Response|周波数範囲|周波数帯域)/i

/** Parse numeric Hz value: 18000, 18k, 18 kHz, 18,000 Hz */
function parseHzToken(raw) {
  const t = String(raw)
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, "")
  const kMatch = t.match(/^([\d.]+)\s*(?:k(?:hz)?|キロヘルツ|kHz)$/i)
  if (kMatch) return Math.round(Number(kMatch[1]) * 1000)
  const hzMatch = t.match(/^([\d.]+)\s*(?:hz|ヘルツ|Hz)?$/i)
  if (hzMatch) return Math.round(Number(hzMatch[1]))
  return null
}

function formatHzCompact(hz) {
  if (hz >= 1000 && hz % 1000 === 0) return `${hz / 1000}kHz`
  if (hz >= 1000) return `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)}kHz`
  return `${hz}Hz`
}

function formatHzSpec(hz) {
  if (hz >= 1000) {
    const k = hz / 1000
    const val = Number.isInteger(k) ? `${k}` : k.toFixed(1).replace(/\.0$/, "")
    return `${val} kHz`
  }
  return `${hz} Hz`
}

/** Normalize raw frequency range string to { lowHz, highHz } or null */
export function parseFrequencyRange(raw) {
  if (!raw) return null
  const text = String(raw)
    .replace(/[〜～~]/g, "–")
    .replace(/\s*to\s*/gi, "–")
    .replace(/\s*-\s*/g, "–")
    .replace(/\s+/g, " ")
    .trim()

  // "40Hz–18kHz" or "40 Hz – 18 kHz"
  const rangeMatch = text.match(
    /([\d,.]+)\s*(?:Hz|ヘルツ|hz)?\s*[–—−-]\s*([\d,.]+)\s*(?:kHz|k|キロヘルツ|Hz|ヘルツ|hz)?/i,
  )
  if (rangeMatch) {
    let low = parseHzToken(rangeMatch[1])
    let highRaw = rangeMatch[2]
    const highSuffix = text.slice(rangeMatch.index + rangeMatch[0].length - highRaw.length)
    let high = parseHzToken(highRaw + (/\bk/i.test(text.slice(text.indexOf(highRaw))) ? "kHz" : ""))
    if (high === null) {
      // infer kHz if high < 200 (e.g. "18" meaning 18kHz)
      const n = parseHzToken(highRaw)
      if (n !== null && n < 200) high = n * 1000
      else high = n
    }
    if (low !== null && high !== null && low < high && low >= 10 && high <= 100000) {
      // Reject misparsed sample rates (e.g. "20 Hz - 48 kHz" → 48 Hz)
      if (high < 1000) return null
      return { lowHz: low, highHz: high }
    }
  }

  // Single value like "20Hz-20kHz" without spaces in compact form
  const compact = text.match(/([\d.]+)\s*Hz\s*[–—−-]\s*([\d.]+)\s*kHz/i)
  if (compact) {
    const low = parseHzToken(compact[1])
    const high = parseHzToken(compact[2] + "kHz")
    if (low && high && low < high) return { lowHz: low, highHz: high }
  }

  return null
}

export function formatFrequencyResponse(range) {
  if (!range) return { highlight: DASH, spec: DASH }
  const lowC = formatHzCompact(range.lowHz)
  const highC = formatHzCompact(range.highHz)
  return {
    highlight: `${lowC}-${highC}`,
    spec: `${lowC}-${highC}`,
  }
}

function searchInText(text) {
  const patterns = [
    /周波数(?:特性|応答|レスポンス)[：:\s]*([\d,.]+\s*Hz\s*[–—〜～~\-to]+\s*[\d,.]+\s*(?:kHz|Hz|ヘルツ)?)/i,
    /Frequency Response[：:\s]*([\d,.]+\s*Hz\s*[–—\-to]+\s*[\d,.]+\s*(?:kHz|Hz)?)/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const range = parseFrequencyRange(m[1])
      if (range) return range
    }
  }
  return null
}

export function parseAmazonMicFrequencyResponse(html) {
  const table = parseDetailTable(html)

  for (const [key, val] of Object.entries(table)) {
    if (/^(Frequency Range|周波数範囲|周波数帯域)$/i.test(key)) {
      const range = parseFrequencyRange(val)
      if (range) return { ...formatFrequencyResponse(range), source: "table-range", raw: val }
    }
  }

  const minKey = Object.keys(table).find((k) =>
    /^(Minimum Frequency|最低周波数|最小周波数)$/i.test(k),
  )
  const maxKey = Object.keys(table).find((k) =>
    /^(Maximum Frequency|最高周波数|最大周波数)$/i.test(k),
  )
  if (minKey && maxKey) {
    const lowHz = parseHzToken(table[minKey])
    const highHz = parseHzToken(table[maxKey])
    if (lowHz && highHz && lowHz < highHz) {
      return {
        ...formatFrequencyResponse({ lowHz, highHz }),
        source: "table-minmax",
        raw: `${table[minKey]} – ${table[maxKey]}`,
      }
    }
  }

  for (const [key, val] of Object.entries(table)) {
    if (FREQ_KEY_RE.test(key)) {
      const range = parseFrequencyRange(val)
      if (range) return { ...formatFrequencyResponse(range), source: "table", raw: val }
    }
  }

  // Bullet points / A+ content
  const bullets = html.match(/feature-bullets[\s\S]*?<\/ul>/i)?.[0] ?? ""
  const fromBullets = searchInText(bullets)
  if (fromBullets) return { ...formatFrequencyResponse(fromBullets), source: "bullets" }

  const desc = html.match(/productDescription[\s\S]*?<\/div>/i)?.[0] ?? ""
  const fromDesc = searchInText(desc)
  if (fromDesc) return { ...formatFrequencyResponse(fromDesc), source: "description" }

  return { highlight: DASH, spec: DASH, source: null }
}

import { MIC_FREQUENCY_KNOWN } from "./mic-frequency-known.mjs"

/** @deprecated use MIC_FREQUENCY_KNOWN */
export const MIC_FREQ_OVERRIDES = MIC_FREQUENCY_KNOWN

export function getMicFrequencyForAsin(asin, html) {
  if (MIC_FREQUENCY_KNOWN[asin]) {
    return { ...formatFrequencyResponse(MIC_FREQUENCY_KNOWN[asin]), source: "known" }
  }
  if (html) return parseAmazonMicFrequencyResponse(html)
  return { highlight: DASH, spec: DASH, source: null }
}

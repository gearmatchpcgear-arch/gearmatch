/**
 * Parse max sampling rate from pre-fetched HTML (offline parser only — no network).
 * Used with locally stored HTML snapshots or manual cache entries, not live Amazon requests.
 */
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { DASH } from "./audio-interface-specs-known.mjs"

const SAMPLE_KEY_RE =
  /^(最大)?サンプリングレート|(最大)?サンプルレート|Sampling Rate|Maximum Sampling Rate|Max\.? Sampling Rate|A\/D|デジタル音声|録音フォーマット/i

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function stripTags(s) {
  return decodeHtml(String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

/** Extract highest kHz rate from free text. Returns normalized label e.g. "192kHz". */
export function extractMaxSamplingRateKhz(text) {
  if (!text || text === DASH) return null
  const raw = String(text).trim()
  if (/^[-—–]$/.test(raw)) return null

  const rates = []
  for (const m of raw.matchAll(/(\d+(?:\.\d+)?)\s*[kK][hH][zZ]/g)) {
    rates.push(Number(m[1]))
  }
  if (!rates.length) return null

  const max = Math.max(...rates)
  if (max === 44.1 || max === 44) return "44.1kHz"
  if (Number.isInteger(max)) return `${max}kHz`
  return `${max}kHz`
}

export function parseAmazonMaxSamplingRate(html) {
  if (!html) return { rate: null, source: null }

  const table = parseDetailTable(html)
  for (const [key, val] of Object.entries(table)) {
    if (!SAMPLE_KEY_RE.test(key)) continue
    const rate = extractMaxSamplingRateKhz(val)
    if (rate) return { rate, source: `table:${key}` }
  }

  const specSection =
    html.match(/機能と仕様[\s\S]{0,8000}/i)?.[0] ??
    html.match(/productDetails[\s\S]{0,8000}/i)?.[0] ??
    ""
  if (specSection) {
    const labeled = specSection.match(
      /(?:最大)?サンプリングレート[^0-9]{0,20}(\d+(?:\.\d+)?)\s*[kK][hH][zZ]/i,
    )
    if (labeled) {
      const rate = extractMaxSamplingRateKhz(`${labeled[1]}kHz`)
      if (rate) return { rate, source: "spec-section" }
    }
  }

  const bullets = html.match(/feature-bullets[\s\S]*?<\/ul>/i)?.[0] ?? ""
  const bulletMatch = bullets.match(
    /(?:最大)?サンプリングレート[^0-9]{0,20}(\d+(?:\.\d+)?)\s*[kK][hH][zZ]/i,
  )
  if (bulletMatch) {
    const rate = extractMaxSamplingRateKhz(`${bulletMatch[1]}kHz`)
    if (rate) return { rate, source: "bullets" }
  }

  const title = stripTags(html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "")
  const titleRate = extractMaxSamplingRateKhz(title)
  if (titleRate) return { rate: titleRate, source: "title" }

  const desc = stripTags(html.match(/productDescription[\s\S]{0,12000}/i)?.[0] ?? "")
  const descRate = extractMaxSamplingRateKhz(desc)
  if (descRate) return { rate: descRate, source: "description" }

  return { rate: null, source: null }
}

export function inferSamplingRateFromTitle(title) {
  const rate = extractMaxSamplingRateKhz(title)
  return rate ?? DASH
}

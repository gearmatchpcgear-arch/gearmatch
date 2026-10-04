/**
 * Parse Amazon.co.jp mic card specs (4 fields) + merge known overrides
 */
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { getMicFrequencyForAsin, DASH as FREQ_DASH } from "./amazon-mic-frequency-response.mjs"
import { MIC_CARD_SPECS_KNOWN, DASH, toSpecFormat } from "./mic-card-specs-known.mjs"
import { isJunkSpecValue, inferPolarFromText } from "./spec-value-sanitize.mjs"
import { formatMicConnectionDisplay } from "./mic-connection-format.mjs"
import { MIC_CONNECTION_KNOWN } from "./mic-connection-known.mjs"

const POLAR_KEY_RE =
  /^(指向性|ポーラーパターン|Polar Pattern|マイクの指向性|ピックアップパターン)/i
const CONN_KEY_RE =
  /^(接続|接続方式|接続端子|インターフェース|Interface|Connectivity|コネクタ|端子)/i
const SAMPLE_KEY_RE =
  /^(サンプリング|サンプルレート|Sampling Rate|Bit Depth|ビット深度|デジタル音声|A\/D|D\/A|録音フォーマット)/i

function normalizePolar(raw) {
  if (!raw) return null
  const t = raw.trim()
  if (isJunkSpecValue(t, "指向性")) {
    return inferPolarFromText(t)
  }
  if (/カーディオイド|cardioid/i.test(t) && !/スーパー|超|ハイパー/i.test(t)) {
    if (/双|bi/i.test(t)) return "双指向性"
    if (/全|omni/i.test(t)) return "全指向性"
    if (/ステレオ|stereo/i.test(t)) return "指向性切替対応"
    return "単一指向性"
  }
  if (/スーパーカーディオイド|supercardioid/i.test(t)) return "超単一指向性 (スーパーカーディオイド)"
  if (/ハイパーカーディオイド|hypercardioid/i.test(t)) return "超単一指向性 (ハイパーカーディオイド)"
  if (/超単一|hyper/i.test(t)) return "超単一指向性"
  if (/全指向|omni/i.test(t)) return "全指向性"
  if (/双指向|bidirectional|8/i.test(t)) return "双指向性"
  if (/ステレオ|stereo/i.test(t)) return "指向性切替対応"
  if (/単一|uni/i.test(t)) return "単一指向性"
  if (/ショットガン|shotgun|ライン\+ガン|ライン・ガン|ライン型|line\+gun/i.test(t)) {
    return t.length <= 40 ? t : "超単一指向性 (ライン+ガン)"
  }
  const result = t.length <= 48 ? t : null
  if (result && isJunkSpecValue(result, "指向性")) return inferPolarFromText(t)
  return result
}

function normalizeConnection(raw) {
  if (!raw) return null
  return formatMicConnectionDisplay(raw) === DASH ? null : formatMicConnectionDisplay(raw)
}

function normalizeSampleRate(raw) {
  if (!raw) return null
  const t = raw.trim()
  if (/—|なし|非対応|n\/a/i.test(t)) return DASH
  const bitMatch = t.match(/(\d+)\s*bit/i)
  const rateMatch = t.match(/(\d+(?:\.\d+)?)\s*kHz/i)
  if (bitMatch && rateMatch) {
    return `${bitMatch[1]}bit / ${rateMatch[1]}kHz`
  }
  const rateOnly = t.match(/(\d+(?:\.\d+)?)\s*kHz/i)
  const bitOnly = t.match(/(\d+)\s*bit/i)
  if (rateOnly && bitOnly) return `${bitOnly[1]}bit / ${rateOnly[1]}kHz`
  if (/192.*24|24.*192/i.test(t)) return "192kHz/24bit"
  if (/96.*24|24.*96/i.test(t)) return "96kHz/24bit"
  if (/48.*16|16.*48/i.test(t)) return "48kHz/16bit"
  if (/48.*24|24.*48/i.test(t)) return "48kHz/24bit"
  if (/44\.1.*16|16.*44/i.test(t)) return "44.1kHz/16bit"
  return t.length <= 24 ? t : null
}

function searchBullets(html, re) {
  const bullets = html.match(/feature-bullets[\s\S]*?<\/ul>/i)?.[0] ?? ""
  const m = bullets.match(re)
  return m?.[1]?.trim() ?? null
}

export function parseAmazonMicCardSpecs(html) {
  const table = parseDetailTable(html)
  const out = {}

  for (const [key, val] of Object.entries(table)) {
    if (!out["指向性"] && POLAR_KEY_RE.test(key)) out["指向性"] = normalizePolar(val)
    if (!out["接続方式"] && CONN_KEY_RE.test(key)) out["接続方式"] = normalizeConnection(val)
    if (!out["サンプルレート"] && SAMPLE_KEY_RE.test(key)) out["サンプルレート"] = normalizeSampleRate(val)
  }

  if (!out["指向性"]) {
    const bullets = html.match(/feature-bullets[\s\S]*?<\/ul>/i)?.[0] ?? ""
    out["指向性"] = inferPolarFromText(bullets)
    if (!out["指向性"]) {
      const labeled = searchBullets(html, /(?:^|[。●]\s*)指向性[：:\s]+([^<\n。]+)/im)
      out["指向性"] = normalizePolar(labeled)
    }
  }
  if (!out["サンプルレート"]) {
    const labeled = searchBullets(
      html,
      /(?:^|[。●]\s*)(?:サンプル(?:リング)?レート|Sampling Rate)[：:\s]+(\d+\s*bit\s*[\/／]\s*\d+(?:\.\d+)?\s*kHz|\d+\s*kHz\s*[\/／]\s*\d+\s*bit)/im,
    )
    out["サンプルレート"] = normalizeSampleRate(labeled)
  }

  return out
}

export function getMicCardSpecsForAsin(asin, html, onlyFix = null) {
  const known = MIC_CARD_SPECS_KNOWN[asin] ?? {}
  const amazon = html ? parseAmazonMicCardSpecs(html) : {}
  const freqFromAmazon =
    html && !known["周波数特性"] ? getMicFrequencyForAsin(asin, html) : null

  const fields = ["指向性", "周波数特性", "接続方式", "サンプルレート"]
  const result = {}

  for (const field of fields) {
    if (onlyFix && !onlyFix.includes(field)) continue

    let value =
      known[field] ??
      (field === "接続方式" ? MIC_CONNECTION_KNOWN[asin] : null) ??
      amazon[field] ??
      (field === "周波数特性" &&
      freqFromAmazon?.highlight &&
      freqFromAmazon.highlight !== FREQ_DASH
        ? freqFromAmazon.highlight
        : null)

    if (field === "サンプルレート" && !value && known[field] === undefined) {
      // analog XLR-only: leave dash
      if (html && /xlr/i.test(html) && !/usb|type-c|デジタル/i.test(html.slice(0, 200000))) {
        value = DASH
      }
    }

    if (value) {
      if (field === "指向性" && isJunkSpecValue(value, "指向性")) {
        value = inferPolarFromText(value) ?? null
      }
      if (!value) continue
      result[field] = {
        highlight: value,
        spec: toSpecFormat(value, field),
      }
    }
  }

  return result
}

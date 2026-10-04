/**
 * Shared spec value sanitization for scrapers and bulk-fix scripts.
 */
export const DASH = "—"

/** Natural-language junk that should never appear as a spec value */
export function isJunkSpecValue(value, label = "") {
  if (!value || value === DASH || value === "-") return false
  const t = value.trim()
  if (t.length <= 1) return true
  if (/^(MISSING|不明|未記載|N\/A)$/i.test(t)) return false

  if (/です$|ます$|でした$|ください$|できます$|可能です$|対応しています$|採用/i.test(t)) {
    return true
  }
  if (/^(マイク|キーボード|マウス|モニター|チェア)(です|で)?$/i.test(t)) return true
  if (/^(と|の|を|に|で|が|は)/.test(t)) return true
  if (/[。！？]/.test(t)) return true
  if (/(?:を|は、|により|について|提供し|拾い|集音|抑制|キャプチャ|低減)/.test(t) && t.length > 12) {
    return true
  }

  if (label === "指向性") {
    const validPolar =
      /^(単一指向性|全指向性|双指向性|超単一指向性|指向性切替|可変|マルチ|ショットガン|ライン\+ガン)/i
    if (validPolar.test(t)) return false
    if (/\(/.test(t) && /指向|カーディオイド|cardioid|omni|360/i.test(t)) return false
    if (/^[\u3040-\u30ff\u4e00-\u9fff]{2,12}$/.test(t) && /指向性/.test(t)) return false
    if (t.length > 24 && !/指向性|カーディオイド|cardioid|omni|360|双指向/i.test(t)) return true
  }

  return false
}

export function inferPolarFromText(text) {
  if (!text) return null
  if (/4パターン|4つの指向性|指向性切替|指向性の変更|マルチパターン|multi-pattern|4指向性|multi-direction|multi direction|マルチダイレクション/i.test(text)) {
    return "指向性切替対応 (マルチパターン)"
  }
  if (/超単一指向|スーパーカーディオイド|supercardioid/i.test(text)) {
    return "超単一指向性 (スーパーカーディオイド)"
  }
  if (/ハイパーカーディオイド|hypercardioid/i.test(text)) {
    return "超単一指向性 (ハイパーカーディオイド)"
  }
  if (/全指向性|無指向性|360°|360˚|omnidirectional/i.test(text)) {
    return "全指向性"
  }
  if (/双指向|双方向|bidirectional/i.test(text)) return "双指向性"
  if (/単一指向|カーディオイド|cardioid|unidirectional|正面.*集音|主音声/i.test(text)) {
    return "単一指向性"
  }
  return null
}

export function sanitizeSpecValue(value, label = "") {
  if (!value || value === "-") return DASH
  if (isJunkSpecValue(value, label)) return null
  return value.trim()
}

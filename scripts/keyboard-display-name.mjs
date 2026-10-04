/**
 * Normalize keyboard card titles so folio/case products are not misread as case-only.
 */

const CASE_ONLY_RE =
  /(?:magic keyboard|smart keyboard)\s*用|(?:for|対応)\s*(?:magic keyboard|smart keyboard)|キーボードカバーのみ|カバー単体|ケース単体|cover only|case only|replacement cover|交換用カバー|交換用ケース/i

const KEYBOARD_BODY_RE =
  /キーボード|\bkeyboard\b|bluetooth\s*キーボード|bt\s*キーボード|キーボード付き|キーボード一体|一体型キーボード|着脱式キーボード|分離式キーボード|ワイヤレスキーボード|無線キーボード|smart keyboard|magic keyboard|type cover|folio keyboard|パンタグラフ|シザー|scissor|メンブレン|membrane|タッチパッド|touchpad|トラックパッド|trackpad|バックライト|backlit|ショートカットキー|shortcut key|打鍵|タイピング|jis配列|日本語配列/i

const MISLEADING_CASE_NAME_RE = /キーボードケース|キーボードカバー|保護カバー/

function truncate(name, max = 72) {
  if (name.length <= max) return name
  return name.slice(0, max - 1) + "…"
}

export function isCaseOnlyKeyboardProduct(title, extraHay = "") {
  const t = `${title} ${extraHay}`.trim()
  if (!t) return false

  if (CASE_ONLY_RE.test(t)) return true

  if (/キーボードカバー|keyboard cover|dust cover|防塵カバー/i.test(t)) {
    if (!/一体|付き|ケース|folio|キーボード付/i.test(t)) return true
    if (/magic keyboard/i.test(t) && !/一体|付き|ケース|folio|smart keyboard/i.test(t)) {
      return true
    }
  }

  if (/ケース|case|カバー|cover|folio/i.test(t) && !KEYBOARD_BODY_RE.test(t)) {
    return true
  }

  return false
}

export function hasKeyboardBodySignals(title, extraHay = "") {
  return KEYBOARD_BODY_RE.test(`${title} ${extraHay}`)
}

/** Derive a card title that reflects a keyboard body (optionally with folio). */
export function normalizeKeyboardBodyName(name, fullTitle = name, extraHay = "") {
  const source = String(fullTitle || name || "").trim()
  const hay = `${source} ${extraHay}`

  if (isCaseOnlyKeyboardProduct(source, extraHay)) return null
  if (!MISLEADING_CASE_NAME_RE.test(String(name || ""))) {
    return truncate(String(name || "").trim())
  }
  if (!hasKeyboardBodySignals(source, extraHay)) {
    return null
  }

  const beforePipe = source.split(/\s*\|\s*/)[0].trim()

  if (/キーボード/i.test(beforePipe) && /キーボードケース|キーボードカバー/i.test(beforePipe)) {
    const trimmed = beforePipe
      .replace(/\s*キーボード(?:付き)?ケース.*$/i, "")
      .replace(/\s*キーボードカバー.*$/i, "")
      .replace(/\s*保護カバー.*$/i, "")
      .trim()
    if (/キーボード/i.test(trimmed)) {
      return truncate(trimmed)
    }
  }

  let fixed = String(name || beforePipe)
    .replace(/着脱式キーボードケース/i, "着脱式キーボード")
    .replace(/キーボードケース/i, "キーボード")
    .replace(/キーボードカバー/i, "キーボード")
    .replace(/保護カバー/i, "キーボード")

  if (/ケース|カバー|folio|手帳型|スタンド/i.test(hay) && !/キーボード付きケース/i.test(fixed)) {
    fixed = fixed.replace(/キーボード(?!付き)/i, "キーボード付きケース")
  }

  return truncate(fixed.replace(/\s+/g, " ").trim())
}

export function normalizeKeyboardBodyTagline(tagline, fullTitle = tagline) {
  const source = String(tagline || fullTitle || "").trim()
  if (!source || !MISLEADING_CASE_NAME_RE.test(source)) return source

  const normalized = normalizeKeyboardBodyName(source, fullTitle || source)
  if (!normalized) return source
  return normalized.length > 140 ? normalized.slice(0, 137) + "…" : normalized
}

import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { normalizeMicFrequencyResponseDisplay } from "@/lib/mic-frequency-display"

const USB_TYPE_A = "USB Type-A"
const USB_TYPE_C = "USB Type-C"

const MIC_CONNECTION_TOKEN_ORDER = [
  USB_TYPE_C,
  USB_TYPE_A,
  "XLR",
  "6.3mm",
  "3.5mm",
  "Lightning",
  "2.4GHz ワイヤレス",
  "Bluetooth",
  "AUX",
] as const

function normalizeMicConnectionToken(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, " ")
  if (!t || t === UNSPECIFIED_SPEC || t === "-") return null

  if (/usb.?type.?c|usb-c|^type-c$|^type c$/i.test(t)) return USB_TYPE_C
  if (/usb.?type.?a|usb-a|^type-a$|^type a$/i.test(t)) return USB_TYPE_A
  if (/^usb$/i.test(t) || (/^usb\b/i.test(t) && !/bluetooth|xlr|3\.5|6\.3|lightning|2\.4|type/i.test(t))) {
    return USB_TYPE_A
  }
  if (/xlr/i.test(t)) return "XLR"
  if (/6\.3\s*mm|6\.3mm|1\/4/i.test(t)) return "6.3mm"
  if (/3\.5\s*mm|3\.5mm|ミニプラグ|trs/i.test(t)) return "3.5mm"
  if (/lightning/i.test(t)) return "Lightning"
  if (/2\.4\s*ghz|2\.4ghz|2\.4\s*g/i.test(t)) return "2.4GHz ワイヤレス"
  if (/bluetooth/i.test(t)) return "Bluetooth"
  if (/aux/i.test(t)) return "AUX"

  return t.length <= 40 ? t : null
}

/** マイク「指向性」の統一表記 */
export function normalizeMicDirectivityDisplay(value: string): string {
  const t = value.trim()
  if (!t || t === UNSPECIFIED_SPEC || t === "-") return t

  if (/指向性切替|マルチパターン|4パターン|2モード/i.test(t)) return t
  if (/超単一|スーパーカーディオイド|ハイパーカーディオイド|ショットガン|ライン\+ガン/i.test(t)) {
    return "超単一指向性"
  }
  if (/双指向/i.test(t)) return "双指向性"
  if (/全方向|全指向|無指向|360°|360˚|360°全指向|omnidirectional/i.test(t)) return "全指向性"
  if (/単一指向|指向性ハート型|カーディオイド|cardioid|unidirectional/i.test(t)) return "単一指向性"
  return t
}

/** マイク「接続方式」の統一表記（複数インターフェース対応） */
export function normalizeMicConnectionDisplay(raw?: string | null): string {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return UNSPECIFIED_SPEC
  const text = raw.replace(/\s+/g, " ").trim()
  const parts = text.split(/\s*[\/／,、・]\s*/)
  const found = new Map<string, true>()

  for (const part of parts) {
    const token = normalizeMicConnectionToken(part)
    if (token) found.set(token, true)
  }

  if (found.size === 0) {
    const single = normalizeMicConnectionToken(text)
    return single ?? (text.length <= 48 ? text : UNSPECIFIED_SPEC)
  }

  const ordered = MIC_CONNECTION_TOKEN_ORDER.filter((t) => found.has(t))
  const rest = [...found.keys()].filter(
    (t) => !MIC_CONNECTION_TOKEN_ORDER.includes(t as (typeof MIC_CONNECTION_TOKEN_ORDER)[number]),
  )
  return [...ordered, ...rest].join(" / ")
}

/** マイク「タイプ」の統一表記 */
export function normalizeMicTypeDisplay(value: string, context?: { isStandType?: boolean }): string {
  const t = value.trim()
  if (!t || t === UNSPECIFIED_SPEC) return t
  if (/ワイヤレスピンマイク|ピンマイク|ラベリア|lavali|clip.*マイク|クリップ.*マイク/i.test(t)) {
    return "ピンマイク"
  }
  if (/ハンドヘルド/i.test(t) && (context?.isStandType || /卓上|スタンド|テーブル|デスクトップ|会議|コンデンサ/i.test(t))) {
    return /ダイナミック/i.test(t) ? "ダイナミック" : "コンデンサー"
  }
  if (/^ダイナミック/i.test(t)) return "ダイナミック"
  if (/コンデンサ|condenser|エレクトレット/i.test(t)) return "コンデンサー"
  return t
}

/** モニター「リフレッシュレート」の統一表記 */
export function normalizeMonitorRefreshDisplay(value: string): string {
  const t = value.trim()
  if (!t || t === UNSPECIFIED_SPEC) return t

  const rates = [...t.matchAll(/(\d{2,3})\s*hz/gi)].map((m) => Number(m[1]))
  if (rates.length > 0) {
    return `${Math.max(...rates)}Hz`
  }

  const bare = t.replace(/対応/g, "").replace(/\s+/g, "")
  const m = bare.match(/^(\d{2,3})Hz$/i)
  if (m) return `${m[1]}Hz`

  return t
}

/** ゲーミングチェア「素材」の統一表記 */
export function normalizeGamingChairMaterialDisplay(value: string): string {
  const t = value.trim()
  if (!t || t === UNSPECIFIED_SPEC) return t

  if (/本革|genuine leather|real leather|天然皮革|牛革/i.test(t) && !/pu|合成|フェイク|レザー調|炭素繊維/i.test(t)) {
    return "本革（レザー）"
  }
  if (
    /puレザー|pu皮革|合成皮革|pvc|フェイクレザー|高耐久pu|上質pu|高級pu|pu\s*leather|レザー調|炭素繊維レザー/i.test(
      t,
    )
  ) {
    return "PUレザー（合成皮革）"
  }
  if (/^(?:レザー|leather)$/i.test(t) || /(?:^|[^本])レザー(?:$|[^本])|\bleather\b/i.test(t)) {
    if (!/本革|pu|合成|フェイク|fabric|ファブリック|メッシュ/i.test(t)) {
      return "PUレザー（合成皮革）"
    }
  }
  if (/メッシュ|mesh|ナイロン|ポリエステル|通気性メッシュ/i.test(t) && !/pu|レザー/i.test(t)) {
    return "メッシュ"
  }
  if (/ファブリック|布地|fabric|velvet|クロス|ベルベット|スエード/i.test(t)) return "ファブリック（布地）"
  if (t === "PUレザー") return "PUレザー（合成皮革）"
  if (t === "ファブリック") return "ファブリック（布地）"
  if (t === "メッシュ") return "メッシュ"
  return t
}

const MOUSE_CONNECTION_TOKEN_ORDER = [
  "2.4GHz (USBレシーバー)",
  "Bluetooth",
  "有線 USB",
] as const

function normalizeKanjiDigit(ch: string): string {
  const map: Record<string, string> = {
    一: "1",
    二: "2",
    三: "3",
    四: "4",
    "\uFF11": "1",
    "\uFF12": "2",
    "\uFF13": "3",
    "\uFF14": "4",
  }
  return map[ch] ?? ch
}

function normalizeMouseConnectionToken(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, " ")
  if (!t || t === UNSPECIFIED_SPEC || t === "-") return null

  if (/2\.4\s*ghz|2\.4g|lightspeed|logi\s*bolt|レシーバー|nano\s*receiver|dongle|ドングル/i.test(t)) {
    return "2.4GHz (USBレシーバー)"
  }
  if (/bluetooth/i.test(t)) return "Bluetooth"
  if (/有線|wired|usb有線|usb\s*有線|^usb$/i.test(t) && !/bluetooth|2\.4|wireless|レシーバー/i.test(t)) {
    return "有線 USB"
  }
  if (/^有線\s*usb/i.test(t)) return "有線 USB"
  if (/usb-c|type-c|type c/i.test(t) && /有線|wired/i.test(t)) return "有線 USB"

  return t.length <= 48 ? t : null
}

/** マウス「接続方式」の統一表記 */
export function normalizeMouseConnectionDisplay(raw?: string | null): string {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return UNSPECIFIED_SPEC
  const text = raw.replace(/\s+/g, " ").trim()
  const parts = text.split(/\s*[\/／,、・+]\s*/)
  const found = new Map<string, true>()

  for (const part of parts) {
    const token = normalizeMouseConnectionToken(part)
    if (token) found.set(token, true)
  }

  if (found.size === 0) {
    const single = normalizeMouseConnectionToken(text)
    return single ?? (text.length <= 64 ? text : UNSPECIFIED_SPEC)
  }

  const ordered = MOUSE_CONNECTION_TOKEN_ORDER.filter((t) => found.has(t))
  const rest = [...found.keys()].filter(
    (t) => !MOUSE_CONNECTION_TOKEN_ORDER.includes(t as (typeof MOUSE_CONNECTION_TOKEN_ORDER)[number]),
  )
  return [...ordered, ...rest].join(" / ")
}

/** マウス「電源」の統一表記（保存値） */
export function normalizeMousePowerDisplay(raw?: string | null): string {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return UNSPECIFIED_SPEC
  let t = raw.trim().normalize("NFKC").replace(/\s+/g, " ")

  if (/充電式|rechargeable|リチウム|lithium|li-po|内蔵/i.test(t) && !/単[1234１２３４]形/i.test(t)) {
    return "充電式"
  }
  if (/有線給電|コード式|電源コード|ケーブル付/i.test(t)) return "有線給電"
  if (/^充電式\/有線$/i.test(t.replace(/\s/g, ""))) return "充電式"

  const sizeMatch = t.match(/単([1234１２３４])形/)
  if (sizeMatch) {
    const size = normalizeKanjiDigit(sizeMatch[1])
    if (/付属/.test(t)) return `単${size}形 乾電池（付属）`
    const countMatch = t.match(/[×x]\s*(\d+)|(\d+)\s*本/)
    const count = countMatch?.[1] ?? countMatch?.[2] ?? "1"
    if (/電池式/.test(t) || /乾電池\s*\d+\s*本/.test(t)) {
      return `電池式（単${size}形乾電池 ${count}本）`
    }
    if (/[×x]\d+/.test(t.replace(/\s/g, ""))) return `単${size}形乾電池×${count}本`
  }

  return t
}

/** マウス「重量」の統一表記 */
export function normalizeMouseWeightDisplay(raw?: string | null): string {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return UNSPECIFIED_SPEC
  const text = raw.trim().normalize("NFKC")
  if (!text || text === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC

  const approx = /^約/.test(text)
  const stripped = text.replace(/^約\s*/, "").trim()
  const kgMatch = stripped.match(/^([\d.,]+)\s*kg\b/i)
  const gMatch = stripped.match(/^([\d.,]+)\s*(?:g|ｇ|グラム|gram)?$/i)

  let grams: number | null = null
  if (kgMatch) grams = Math.round(Number(kgMatch[1].replace(/,/g, "")) * 1000)
  else if (gMatch) grams = Math.round(Number(gMatch[1].replace(/,/g, "")))

  if (grams === null || !Number.isFinite(grams) || grams <= 0) return text
  const prefix = approx ? "約 " : ""
  return `${prefix}${grams} g`
}

/** マウス「読み取り方式」の統一表記 */
export function normalizeMouseReadingDisplay(raw?: string | null): string {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return UNSPECIFIED_SPEC
  const t = raw.trim()
  if (/darkfield/i.test(t)) return "Darkfield"
  if (/トラックボール|trackball/i.test(t)) return "トラックボール"
  if (/blueled/i.test(t)) return "BlueLED"
  if (/光学/i.test(t)) return "光学式"
  if (/レーザー|laser/i.test(t)) return "レーザー"
  return t
}

/** マウス「ボタン数」保存値（数字のみ） */
export function normalizeMouseButtonCountStored(raw?: string | null): string | null {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return null
  const t = raw.trim().normalize("NFKC")
  if (!t) return null
  const m = t.match(/(\d+)/)
  if (!m) return null
  return m[1]
}

/** マウス「ボタン数」表示ラベル（例: "3ボタン"） */
export function normalizeMouseButtonCountLabel(raw?: string | null): string | null {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return null
  const stored = normalizeMouseButtonCountStored(raw)
  if (stored) return `${stored}ボタン`
  const labeled = raw.trim().normalize("NFKC").match(/(\d+)\s*ボタン/)
  if (labeled) return `${labeled[1]}ボタン`
  return null
}

/** マウス「最大DPI」ハイライト表記 */
export function normalizeMouseDpiHighlight(raw?: string | null): string | null {
  if (!raw || raw === UNSPECIFIED_SPEC || raw === "-") return null
  const t = raw.trim().normalize("NFKC")
  const m = t.match(/([\d,]+)\s*dpi/i) ?? t.match(/^([\d,]+)$/)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ""))
  if (!Number.isFinite(n) || n <= 0) return null
  return `${n.toLocaleString("ja-JP")} DPI`
}

/** マウス「最大 DPI」スペック行表記 */
export function normalizeMouseDpiSpec(raw?: string | null): string | null {
  const highlight = normalizeMouseDpiHighlight(raw)
  if (!highlight) return null
  return highlight.replace(/\s*DPI$/i, "")
}

/** マイク「サンプルレート / ビット深度」の統一表記（例: 24bit / 48kHz） */
export function normalizeMicSampleRateBitDepthDisplay(value: string): string {
  const t = value.trim().normalize("NFKC")
  if (!t || t === UNSPECIFIED_SPEC || t === "-") return UNSPECIFIED_SPEC

  const bitMatch = t.match(/(\d+)\s*bit/i)
  const khzMatch = t.match(/([\d.]+)\s*kHz/i)
  if (bitMatch && khzMatch) {
    return `${bitMatch[1]}bit / ${khzMatch[1]}kHz`
  }

  if (khzMatch && !bitMatch) {
    return `${khzMatch[1]}kHz`
  }

  return t.replace(/\s*\/\s*/g, " / ").replace(/\s+/g, " ")
}

/** カテゴリ横断のスペック表示正規化 */
export function normalizeSpecDisplayByLabel(
  value: string,
  label: string,
  category?: string,
): string {
  if (!value || value === UNSPECIFIED_SPEC || value === "-") return UNSPECIFIED_SPEC

  if (label === "指向性" || (category === "mic" && /指向/i.test(label))) {
    return normalizeMicDirectivityDisplay(value)
  }
  if (label === "接続方式" || label === "接続方法" || label === "端子" || label === "接続") {
    if (category === "mic") return normalizeMicConnectionDisplay(value)
    if (category === "mouse") return normalizeMouseConnectionDisplay(value)
  }
  if (label === "タイプ" || label === "マイクタイプ") {
    if (category === "mic") return normalizeMicTypeDisplay(value)
  }
  if (label === "電源" && category === "mouse") return normalizeMousePowerDisplay(value)
  if (label === "重量" && category === "mouse") return normalizeMouseWeightDisplay(value)
  if (label === "読み取り方式" && category === "mouse") return normalizeMouseReadingDisplay(value)
  if (label === "ボタン数" && category === "mouse") {
    return normalizeMouseButtonCountLabel(value) ?? value
  }
  if ((label === "最大DPI" || label === "最大 DPI") && category === "mouse") {
    return normalizeMouseDpiHighlight(value) ?? value
  }
  if ((label === "周波数特性" || /周波数/i.test(label)) && category === "mic") {
    return normalizeMicFrequencyResponseDisplay(value)
  }
  if (
    category === "mic" &&
    (label === "サンプルレート" ||
      label === "サンプリングレート" ||
      /サンプルレート|ビット深度|サンプリング/i.test(label))
  ) {
    return normalizeMicSampleRateBitDepthDisplay(value)
  }
  if (/リフレッシュ/i.test(label) && category === "monitor") {
    return normalizeMonitorRefreshDisplay(value)
  }
  if (label === "素材" && category === "gaming-chair") {
    return normalizeGamingChairMaterialDisplay(value)
  }

  return value
}

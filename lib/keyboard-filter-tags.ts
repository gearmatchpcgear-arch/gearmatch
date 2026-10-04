import type { Gadget, KeyboardUsage } from "@/lib/gadgets"
import {
  resolveKeyboardLayoutValue,
  resolveKeyboardSwitchStructureValue,
} from "@/lib/card-spec-field-resolvers"
import {
  getKeyboardLayoutArray,
  getKeyboardSpreadsheetGaming,
  getKeyboardSpreadsheetRapidTrigger,
} from "@/lib/keyboard-spreadsheet-tags"
import { getGadgetPowerDisplay } from "@/lib/power-display"

export type { KeyboardUsage } from "@/lib/gadgets"

/** キーボード絞り込み用タグ（フィルターIDと1:1対応） */
export type KeyboardFilterTag =
  | "tenkeyless"
  | "kb-structure-scissor"
  | "kb-structure-double-gasket"
  | "kb-structure-gasket"
  | "kb-structure-tray"
  | "kb-keycap-spherical"
  | "kb-keycap-pbt-double"
  | "kb-keycap-abs"
  | "kb-keycap-pc"
  | "kb-keycap-low-profile"
  | "rapid-trigger"
  | "kb-power-wired"
  | "kb-power-rechargeable"
  | "kb-power-battery"

export const KEYBOARD_FILTER_TAG_LABELS: Record<KeyboardFilterTag, string> = {
  tenkeyless: "テンキーレス",
  "kb-structure-scissor": "Perfect Stroke シザー",
  "kb-structure-double-gasket": "ダブルガスケット",
  "kb-structure-gasket": "ガスケットマウント",
  "kb-structure-tray": "トレーマウント",
  "kb-keycap-spherical": "球面ディッシュ",
  "kb-keycap-pbt-double": "PBT",
  "kb-keycap-abs": "ABS",
  "kb-keycap-pc": "PC（ポリカーボネート）",
  "kb-keycap-low-profile": "ロープロファイル",
  "rapid-trigger": "ラピッドトリガー",
  "kb-power-wired": "有線",
  "kb-power-rechargeable": "充電式",
  "kb-power-battery": "電池式",
}

function keyboardHaystack(gadget: Gadget) {
  return [
    gadget.name,
    gadget.tagline,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()
}

function isFilledSpecValue(value: string | undefined): value is string {
  return Boolean(value && value !== "—")
}

function keySwitchGroup(gadget: Gadget) {
  return gadget.specGroups.find((g) => /キー|スイッチ/i.test(g.title))
}

function connectionPowerGroup(gadget: Gadget) {
  return gadget.specGroups.find((g) => /接続|電源/i.test(g.title))
}

function readSpecRow(gadget: Gadget, label: string): string {
  const row = keySwitchGroup(gadget)?.rows.find((r) => r.label === label)
  return isFilledSpecValue(row?.value) ? row.value : ""
}

function readInternalStructureRow(gadget: Gadget): string {
  const resolved = resolveKeyboardSwitchStructureValue(gadget)
  if (resolved) return resolved

  const row = keySwitchGroup(gadget)?.rows.find(
    (r) => r.label === "内部構造" || r.label === "マウント",
  )
  return isFilledSpecValue(row?.value) ? row.value : ""
}

function readHighlight(gadget: Gadget, label: string): string {
  const value = gadget.highlights.find((h) => h.label === label)?.value
  return isFilledSpecValue(value) ? value : ""
}

/** キーキャップ欄に接続方式などが入っている誤配置 */
function isMisplacedConnectionInKeycaps(value: string): boolean {
  return (
    /有線|wireless|bluetooth|usb|2\.4|type-c|充電|電池|給電|8000\s*hz|hot.?swap|lightsync|polling/i.test(
      value,
    ) && !/abs|pbt|キーキャップ|keycap|ダブルショット|double.?shot|球面|ロープロ/i.test(value)
  )
}

/** 電源欄に混入しうる機能キーワード（給電・電池情報ではないもの） */
export const KEYBOARD_POWER_FEATURE_KEYWORD =
  /マクロ|chroma|rgb|lightsync|snap tap|hot.?swap|polling|hyperpolling|8000\s*hz|8\s*khz|リストレスト|rest|ダイヤル|dial|ローラー|roller|adjustable|調整可能|pbt|rapid trigger|ラピッド/i

/** 電源欄にマクロキー・RGB等の機能説明が入っている誤配置 */
export function isKeyboardFeaturePowerValue(value: string): boolean {
  return (
    KEYBOARD_POWER_FEATURE_KEYWORD.test(value) &&
    !/^(有線|充電|電池|wired|recharge|battery)/i.test(value.trim()) &&
    !/給電$/.test(value.trim())
  )
}

/** 電源表示から機能説明テキストを抽出（移行用） */
export function extractKeyboardFeatureTextFromPower(value: string): string {
  if (!isFilledSpecValue(value)) return ""
  const parts = value.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean)
  if (parts.length <= 1) {
    return isKeyboardFeaturePowerValue(value) ? value.trim() : ""
  }
  return parts.slice(1).join(" / ")
}

function keyboardPowerValue(gadget: Gadget) {
  return getGadgetPowerDisplay(gadget)
}

/** 内部構造文字列中の最初の開きかっこ（全角・半角）の位置 */
export function findFirstInternalStructureOpenParen(value: string): number {
  const idxFull = value.indexOf("（")
  const idxHalf = value.indexOf("(")
  if (idxFull < 0) return idxHalf
  if (idxHalf < 0) return idxFull
  return Math.min(idxFull, idxHalf)
}

/** カード一覧用：開きかっこ以降をすべて除外（閉じかっこの有無は問わない） */
export function stripInternalStructureParens(value: string): string {
  if (!value || value === "—") return value
  const cutAt = findFirstInternalStructureOpenParen(value)
  const stripped = (cutAt >= 0 ? value.slice(0, cutAt) : value).replace(/\s+/g, " ").trim()
  return stripped || value
}

/** @deprecated 内部構造フィルターは登録値の完全文字列一致を使用 */
export function getInternalStructureFilterTokens(value: string): string[] {
  const trimmed = normalizeStoredInternalStructure(value)
  if (!trimmed || trimmed === "—") return []

  const cutAt = findFirstInternalStructureOpenParen(trimmed)
  if (cutAt < 0) return [trimmed]

  let detail = trimmed.slice(cutAt + 1).trim()
  detail = detail.replace(/[）)]\s*$/, "").trim()
  if (!detail) return []

  const parts = detail
    .split(/[、,/／|]/)
    .map((part) => part.trim())
    .filter(Boolean)
  return [...new Set(parts.length > 0 ? parts : [detail])]
}

/** 廃止表記 → 正規値（内部構造） */
export function normalizeStoredInternalStructure(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === "—") return trimmed

  if (trimmed === "磁器スイッチ") return "磁気スイッチ"

  if (/^メカニカル[（(]磁気スイッチ/u.test(trimmed)) {
    return "磁気スイッチ"
  }

  if (/^静電容量無接点方式[（(]\s*\d+\s*g\s*[）)]?\s*$/iu.test(trimmed)) {
    return "静電容量無接点方式"
  }

  if (/^メカニカル\s*[（(]\s*GX\s*Red\b/i.test(trimmed)) {
    return "メカニカル（赤軸）"
  }

  if (/^メカニカル\s*[（(]\s*イエロー軸\s*[）)]/u.test(trimmed)) {
    return "メカニカル（黄軸）"
  }

  if (trimmed === "イエロー軸") {
    return "メカニカル（黄軸）"
  }

  if (trimmed === "パンダクラフ") {
    return "パンタグラフ"
  }

  if (/^メカニカル[（(]メンブレン(?![）)])/u.test(trimmed)) {
    return "メカニカル（メンブレン）"
  }

  if (/^メカニカル[（(]パンタグラフ(?![）)])/u.test(trimmed)) {
    return "メカニカル（パンタグラフ）"
  }

  return trimmed
}

/** 内部構造フィルター用：表記揺れを正規ラベルへ統一 */
export function normalizeInternalStructureFilterValue(value: string): string {
  const trimmed = normalizeStoredInternalStructure(value).trim()
  if (!trimmed || trimmed === "—") return trimmed

  if (/^メカニカル[（(]ガスケット[）)]?\s*$/u.test(trimmed)) {
    return "メカニカル（ガスケット）"
  }

  return trimmed
}

/** 内部構造フィルターに表示する正規ラベル（個別軸タグは含めない） */
export const KEYBOARD_INTERNAL_STRUCTURE_FILTER_LABELS = [
  "メカニカル",
  "メカニカル（ガスケット）",
  "メカニカル（メンブレン）",
  "パンタグラフ",
  "オプティカル",
  "磁気スイッチ",
  "磁気スイッチ（ガスケット）",
  "静電容量無接点方式",
] as const

export const EXCLUDED_INTERNAL_STRUCTURE_FILTER_LABELS = new Set([
  "磁器スイッチ",
  "メカニカル（磁気スイッチ）",
  "メカニカル(磁気スイッチ)",
  "メカニカル（磁気スイッチ",
  "メカニカル(磁気スイッチ",
  "メカニカル(ガスケット)",
  "メカニカル（ガスケット",
  "メカニカル(ガスケット",
  "静電容量無接点方式（45g）",
  "静電容量無接点方式(45g)",
  "メカニカル (GX Red リニア)",
  "メカニカル（GX Red リニア）",
  "メカニカル (GX Red)",
  "メカニカル（GX Red）",
  "メカニカル（イエロー軸）",
  "メカニカル(イエロー軸)",
  "イエロー軸",
  "メカニカル（黄軸）",
  "メカニカル(黄軸)",
  "メカニカル（青軸）",
  "メカニカル(青軸)",
  "メカニカル（赤軸）",
  "メカニカル(赤軸)",
])

function readInternalStructureRaw(gadget: Gadget): string {
  const row = keySwitchGroup(gadget)?.rows.find(
    (r) => r.label === "内部構造" || r.label === "マウント",
  )
  const fromSpec = isFilledSpecValue(row?.value) ? normalizeStoredInternalStructure(row.value) : ""
  if (fromSpec) return fromSpec
  const fromHighlight = readHighlight(gadget, "内部構造")
  return fromHighlight ? normalizeStoredInternalStructure(fromHighlight) : ""
}

/** 詳細・フィルター用：CSV登録の内部構造（生値・廃止表記は正規化） */
export function getKeyboardInternalStructureRaw(gadget: Gadget): string {
  const raw = readInternalStructureRaw(gadget)
  return raw || "—"
}

function normalizeInternalStructureDisplay(value: string): string {
  if (!isFilledSpecValue(value)) return value
  if (/^メカニカル[（(]/i.test(value)) return value
  if (/switch|スイッチ|軸|メンブレン|シザー|scissor|optical|磁気|magnetic/i.test(value)) {
    const inner = value.replace(/（([^）]+)）$/, " / $1").replace(/\(([^)]+)\)$/, " / $1")
    return `メカニカル（${inner}）`
  }
  return value
}

function layoutValue(gadget: Gadget) {
  return resolveKeyboardLayoutValue(gadget) || readSpecRow(gadget, "レイアウト") || readHighlight(gadget, "レイアウト")
}

function internalStructureValue(gadget: Gadget) {
  const raw = readInternalStructureRow(gadget) || readHighlight(gadget, "内部構造")
  return normalizeInternalStructureDisplay(raw)
}

function keycapsValue(gadget: Gadget) {
  const fromSpec = readSpecRow(gadget, "キーキャップ")
  if (fromSpec) return fromSpec

  const fromHighlight = readHighlight(gadget, "キーキャップ")
  if (fromHighlight && !isMisplacedConnectionInKeycaps(fromHighlight)) return fromHighlight
  return ""
}

/** キーキャップ素材が PC / ポリカーボネートか */
export function matchesPolycarbonateKeycapMaterial(value: string): boolean {
  const t = value.trim()
  if (!t || t === "—") return false
  if (/ポリカーボネート|polycarbonate/i.test(t)) return true
  if (/^pc[（(]/i.test(t)) return true
  if (/^pc$/i.test(t)) return true
  return false
}

function inferTenkeyless(gadget: Gadget): boolean {
  const layout = layoutValue(gadget)
  if (!layout) return false

  if (/104キー|108キー|テンキー付|numpad|数字キーパッド|full.?size|フルサイズ/i.test(layout)) {
    return false
  }

  return /tenkeyless|\btkl\b|テンキーレス|87キー|80%|75%|65%|60%|コンパクト|compact|\bmini\b/i.test(
    layout,
  )
}

function inferStructureTags(gadget: Gadget): KeyboardFilterTag[] {
  const raw = readInternalStructureRow(gadget) || readHighlight(gadget, "内部構造")
  if (!isFilledSpecValue(raw)) return []

  const hay = raw.toLowerCase()
  const tags: KeyboardFilterTag[] = []

  if (/perfect stroke|シザー|scissor/i.test(hay)) tags.push("kb-structure-scissor")
  if (/ダブルガスケット|double\s*gasket/i.test(hay)) tags.push("kb-structure-double-gasket")
  if (
    (/ガスケット|gasket/i.test(hay) && !/ダブル|double/i.test(hay)) ||
    /gasket\s*mount/i.test(hay)
  ) {
    tags.push("kb-structure-gasket")
  }
  if (/トレーマウント|tray\s*mount/i.test(hay)) tags.push("kb-structure-tray")

  return tags
}

function inferKeycapTags(gadget: Gadget): KeyboardFilterTag[] {
  const keycaps = keycapsValue(gadget)
  if (!keycaps) return []

  const hay = keycaps.toLowerCase()
  const tags: KeyboardFilterTag[] = []

  if (/球面ディッシュ|spherical\s*dish/i.test(hay)) tags.push("kb-keycap-spherical")
  if (/pbt\s*ダブル|pbt\s*double|pbt（ダブルショット）|\bpbt\b/i.test(hay)) {
    tags.push("kb-keycap-pbt-double")
  }
  if (/\babs\b/i.test(hay)) tags.push("kb-keycap-abs")
  if (matchesPolycarbonateKeycapMaterial(keycaps)) tags.push("kb-keycap-pc")
  if (/ロープロ|low[\s-]?profile/i.test(hay)) tags.push("kb-keycap-low-profile")

  return tags
}

function inferPowerTags(gadget: Gadget): KeyboardFilterTag[] {
  const power = getKeyboardPower(gadget)
  if (!power || power === "—") return []

  if (/充電|recharge|内蔵.*バッテ|li-po|mAh/i.test(power)) return ["kb-power-rechargeable"]
  if (/電池|乾電池|単[1234]形|battery/i.test(power)) return ["kb-power-battery"]
  if (/有線|wired|usb/i.test(power)) return ["kb-power-wired"]
  return []
}

function productListingHaystack(gadget: Gadget) {
  return `${gadget.name} ${gadget.tagline}`.toLowerCase()
}

/** キーボード本体以外（アクセサリ・工具・Stream Deck 等） */
export function isKeyboardAccessoryProduct(gadget: Gadget): boolean {
  if (gadget.category !== "keyboard") return false
  if (gadget.isKeyboardAccessory === true) return true
  if (gadget.isKeyboardAccessory === false) return false

  const hay = productListingHaystack(gadget)

  if (/stream deck|ストリームデック|streaming deck/i.test(hay)) {
    if (/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(hay)) return false
    return true
  }
  if (
    /ストリームコントローラー|stream controller/i.test(hay) &&
    !/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(hay)
  ) {
    return true
  }
  if (
    /キーキャップ.*\d+個|\d+個.*キーキャップ|キースイッチ.*セット|スイッチ.*\d+個セット|キーボード部品|キーボードdiy/i.test(
      hay,
    )
  ) {
    return true
  }
  if (/引き抜|キープラー|key puller|switch puller/i.test(hay)) return true
  if (/メンテナンスキット|lube kit|潤滑剤/i.test(hay)) return true
  if (/キーキャップセット|keycap set|replacement keycap|スイッチセット|switch pack/i.test(hay)) {
    return true
  }
  if (/キースイッチ|key switch/i.test(hay) && !/キーボード|keyboard/i.test(hay)) return true

  if (
    /tartarus|vsdinside|streaming deck controller|ストリーミングデック/i.test(hay) &&
    !/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(hay)
  ) {
    return true
  }
  if (/左手デバイス|左手用.*コントローラー|one.?handed.*(?:controller|keypad)/i.test(hay)) {
    if (!/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(hay)) return true
  }
  if (/引き抜|引抜|キープラー|key puller|switch puller|キートップ.*工具|引抜工具|2in1.*工具/i.test(hay)) {
    return true
  }
  if (/actionring|ストリームコントローラーデック/i.test(hay)) {
    if (!/キーボード|keyboard/i.test(hay)) return true
  }
  if (/mouserpad|マウサーパッド/i.test(hay) && /左手|left.?hand|fps/i.test(hay)) {
    return true
  }
  if (/タイプスティック|typestick|type stick|ts01|ファーイーストガジェット/i.test(hay)) {
    if (!/キーボード|keyboard/i.test(hay)) return true
  }
  if (/マウスセット|keyboard\s*[&＆]\s*mouse|mouse\s*[&＆]\s*keyboard/i.test(hay)) {
    return true
  }
  if (/キーボード.*マウス.*セット|マウス.*キーボード.*セット/i.test(hay)) return true

  return false
}

function inferRapidTrigger(gadget: Gadget): boolean {
  const fromSheet = getKeyboardSpreadsheetRapidTrigger(gadget)
  if (fromSheet !== null) return fromSheet
  if (gadget.hasRapidTrigger === true) return true
  if (gadget.hasRapidTrigger === false) return false
  if (isKeyboardAccessoryProduct(gadget)) return false

  const hay = productListingHaystack(gadget)
  if (
    /赤軸|青軸|茶軸|銀軸|黒軸/i.test(hay) &&
    !/ラピッドトリガー|rapid trigger|磁気|magnetic|hall effect/i.test(hay)
  ) {
    return false
  }

  return (
    /ラピッドトリガー|rapid trigger|\brt0?\.?\d/i.test(hay) ||
    (/g515\s*rapid|g515-.*rt|huntsman v3 he|pcmk 3he|fun60|matataki|\baim1\b|cool68|x68he|mercury v60/i.test(
      hay,
    ) &&
      /磁気|magnetic|0\.0\d\s*mm/i.test(hay))
  )
}

const PRODUCTIVITY_KEYBOARD =
  /mx keys(?!\s*mini\s*mechanical)|signature slim|\bk295\b|\bk275\b|\bk120\b|\bk780\b|\bk950\b|\bk400\b|hhkb|realforce|magic keyboard|amazonベーシック|anker.*keyboard|有線キーボード.*メンブレン/i

const GAMING_BRAND =
  /logicool g|logitech g|\brazer\b|レイザー|corsair|steelseries|hyperx|redragon|attack shark|asus rog|\brog\b|msi.*keyboard|v custom|v-cust/i

/** 名称・スペックからキーボード用途を推論 */
export function inferKeyboardUsage(gadget: Gadget): KeyboardUsage {
  if (gadget.category !== "keyboard") return "productivity"
  if (gadget.keyboardUsage) return gadget.keyboardUsage

  const hay = keyboardHaystack(gadget)

  if (GAMING_BRAND.test(hay)) return "gaming"
  if (/ゲーミング|gaming keyboard|\bgaming\b/i.test(hay)) return "gaming"
  if (/mx mechanical|alto keys|leggero|tk-mc30/i.test(hay)) return "gaming"
  if (/nキーロールオーバー|n-key rollover|anti-ghost/i.test(hay)) return "gaming"
  if (/keychron q\d|keychron k[0-9]|keychron v[0-9]/i.test(hay)) return "gaming"
  if (
    /(1000|8000)\s*hz/i.test(hay) &&
    /ポーリング|polling|リフレッシュ/i.test(hay)
  ) {
    return "gaming"
  }
  if (
    /rgb|ライティング|イルミネーション/i.test(hay) &&
    /メカニカル|mechanical|ゲーム|gaming/i.test(hay)
  ) {
    return "gaming"
  }
  if (
    (/ホットスワップ|hot.?swap/i.test(hay) || /ダブルガスケット|double gasket/i.test(hay)) &&
    /メカニカル|mechanical|qmk|via/i.test(hay)
  ) {
    return "gaming"
  }

  if (PRODUCTIVITY_KEYBOARD.test(hay)) return "productivity"

  return "productivity"
}

export function isGamingKeyboard(gadget: Gadget): boolean {
  if (gadget.category !== "keyboard") return false
  if (isKeyboardAccessoryProduct(gadget)) return false
  const fromSheet = getKeyboardSpreadsheetGaming(gadget)
  if (fromSheet !== null) return fromSheet
  return inferKeyboardUsage(gadget) === "gaming"
}

/** 明示タグ + データから推論したタグをマージ（重複除去） */
export function inferKeyboardFilterTags(gadget: Gadget): KeyboardFilterTag[] {
  if (gadget.category !== "keyboard") return []

  const inferred: KeyboardFilterTag[] = [
    ...(inferTenkeyless(gadget) ? (["tenkeyless"] as const) : []),
    ...inferStructureTags(gadget),
    ...inferKeycapTags(gadget),
    ...inferPowerTags(gadget),
    ...(inferRapidTrigger(gadget) ? (["rapid-trigger"] as const) : []),
  ]
  const explicit = gadget.keyboardFilterTags ?? []
  return [...new Set([...explicit, ...inferred])]
}

export function hasKeyboardFilterTag(gadget: Gadget, tag: KeyboardFilterTag): boolean {
  return inferKeyboardFilterTags(gadget).includes(tag)
}

export function hasRapidTrigger(gadget: Gadget): boolean {
  if (gadget.category !== "keyboard") return false
  return inferRapidTrigger(gadget)
}

export function getKeyboardLayout(gadget: Gadget): string {
  return layoutValue(gadget) || "—"
}

export function getKeyboardInternalStructure(gadget: Gadget): string {
  return internalStructureValue(gadget) || "—"
}

/** 一覧カード用：開きかっこ以降を除外した内部構造 */
export function getKeyboardInternalStructureForCard(gadget: Gadget): string {
  const raw = getKeyboardInternalStructureRaw(gadget)
  if (raw === "—") return raw
  return stripInternalStructureParens(raw)
}

/** 絞り込み用：CSV登録の内部構造（フィルター正規化済み） */
export function getKeyboardInternalStructureFilterValue(gadget: Gadget): string | null {
  if (gadget.category !== "keyboard") return null
  const value = getKeyboardInternalStructureRaw(gadget)
  if (!value || value === "—") return null
  return normalizeInternalStructureFilterValue(value)
}

export function matchesKeyboardInternalStructureFilterLabel(
  gadget: Gadget,
  filterLabel: string,
): boolean {
  const raw = getKeyboardInternalStructureFilterValue(gadget)
  if (!raw) return false

  const value = normalizeInternalStructureFilterValue(raw)
  const label = normalizeInternalStructureFilterValue(filterLabel)
  if (value === label) return true

  switch (label) {
    case "メカニカル":
      return /メカニカル|mechanical|ロープロファイル/i.test(value)
    case "メカニカル（ガスケット）":
      return /ガスケット|gasket/i.test(value)
    case "メカニカル（メンブレン）":
      return /^メンブレン$|メンブレン|membrane/i.test(value)
    case "パンタグラフ":
      return /パン[タダ]グラフ|pantograph/i.test(value)
    case "オプティカル":
      return /オプティカル|optical/i.test(value)
    case "磁気スイッチ":
      return /磁気(?:スイッチ|式)|magnetic/i.test(value)
    case "磁気スイッチ（ガスケット）":
      return /磁気(?:スイッチ|式)|magnetic/i.test(value) && /ガスケット|gasket/i.test(value)
    case "静電容量無接点方式":
      return /静電容量|capacitive/i.test(value)
    default:
      return false
  }
}

export function getKeyboardKeycaps(gadget: Gadget): string {
  return keycapsValue(gadget) || "—"
}

export function getKeyboardPower(gadget: Gadget): string {
  return keyboardPowerValue(gadget) || "—"
}

export const KEYBOARD_CARD_SPEC_LABELS = [
  "レイアウト",
  "内部構造",
  "キーキャップ",
  "配列",
] as const

/** 一覧カード2×2用：固定ラベル順のスペック値 */
export function getKeyboardCardHighlightEntries(
  gadget: Gadget,
): { label: (typeof KEYBOARD_CARD_SPEC_LABELS)[number]; value: string }[] {
  return KEYBOARD_CARD_SPEC_LABELS.map((label) => ({
    label,
    value:
      label === "レイアウト"
        ? getKeyboardLayout(gadget)
        :       label === "内部構造"
          ? getKeyboardInternalStructureForCard(gadget)
          : label === "キーキャップ"
            ? getKeyboardKeycaps(gadget)
            : getKeyboardLayoutArray(gadget),
  }))
}

function keyboardConnectionSpecText(gadget: Gadget): string {
  const fromSpec = gadget.specGroups
    .flatMap((g) => g.rows)
    .find((r) => r.label === "接続方法" || r.label === "接続方式")?.value
  return `${gadget.connection ?? ""} ${fromSpec ?? ""}`.replace(/\s+/g, " ").trim()
}

/** 商品説明に有線データ通信としての USB Type-C 明示があるか */
function hasWiredTypeCDataInListing(text: string): boolean {
  return (
    /usb[\s-]?type[\s-]?c\s*(?:有線|接続|ケーブル|ポート)/i.test(text) ||
    /type[\s-]?c\s*有線/i.test(text) ||
    /type-c有線/i.test(text) ||
    /usb[\s-]?c\s*有線/i.test(text) ||
    /usb[\s-]?type[\s-]?c接続/i.test(text) ||
    /usb-c\s*有線接続/i.test(text) ||
    /bt5?\.0\s*[\/／]\s*2\.4\s*g(?:hz)?\s*[\/／]\s*usb-c/i.test(text) ||
    /2\.4\s*g(?:hz)?\s*[\/／]\s*bluetooth\s*[\/／]\s*usb-c/i.test(text) ||
    /bluetooth\s*[\/／]\s*2\.4\s*g(?:hz)?\s*[\/／]\s*usb-c/i.test(text) ||
    /(?:^|[\/／\s])usb-c\s*[\/／]|\/\s*usb-c(?:\s|[\/／]|$)/i.test(text) ||
    /3モード.*usb-c|usb-c.*3モード|usb-c接続3モード/i.test(text) ||
    /usb有線.*(?:type-c|usb-c)|(?:type-c|usb-c).*usb有線/i.test(text)
  )
}

/** Type-C が充電専用としてのみ言及されているか（有線データ通信の記述がない場合） */
function isTypeCChargingOnlyListing(gadget: Gadget): boolean {
  const listing = `${gadget.name} ${gadget.tagline}`
  if (!/type-c|usb-c/i.test(listing)) return false
  if (hasWiredTypeCDataInListing(listing)) return false
  return /type-c\s*充電|type-c充電|usb-c\s*充電|usb-c充電|充電式.*type-c|type-c\s*急速充電|usb type-c充電/i.test(
    listing,
  )
}

/** 接続方法トークンが有線接続を示すか（USBレシーバー専用は除外） */
function isKeyboardWiredConnectionToken(token: string): boolean {
  const t = token.trim().replace(/\s+/g, " ")
  if (!t || t === "—") return false

  if (/有線|wired/i.test(t)) return true
  if (/^有線\s*usb/i.test(t)) return true
  if (/usb[\s-]?type[\s-]?c|type[\s-]?c|usb-c/i.test(t)) return true
  if (/^usb$/i.test(t)) return true

  if (/\busb\b/i.test(t) && !/レシーバー|receiver|dongle|ドングル|lightspeed|logi bolt|2\.4/i.test(t)) {
    return true
  }

  return false
}

/**
 * 接続方法フィルター「有線」用。
 * 接続方法に「有線」「USB」「USB-C」「USB Type-C」「有線 USB」等が含まれる製品に一致。
 */
export function matchesKeyboardWiredConnectionFilter(gadget: Gadget): boolean {
  if (gadget.category !== "keyboard") return false

  const connText = keyboardConnectionSpecText(gadget)
  if (!connText || connText === "—") return false

  if (/有線|wired/i.test(connText)) return true
  if (/usb[\s-]?type[\s-]?c|type[\s-]?c|usb-c/i.test(connText)) return true

  const parts = connText
    .split(/[/／,、・+]/)
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.some(isKeyboardWiredConnectionToken)
}

/**
 * 接続方式フィルター「USB Type-C」用。
 * 充電専用 Type-C の完全ワイヤレス製品は除外し、有線データ通信対応の Type-C のみ一致。
 */
export function matchesKeyboardUsbTypeCConnectionFilter(gadget: Gadget): boolean {
  if (gadget.category !== "keyboard") return false

  const connText = keyboardConnectionSpecText(gadget)
  if (/有線\s*usb\s*type-c|有線\s*usb-c/i.test(connText)) return true
  if (/有線/i.test(connText) && /type-c|usb-c/i.test(connText)) return true
  if (/type-c|usb-c/i.test(connText) && /有線|wired/i.test(connText)) return true

  if (isTypeCChargingOnlyListing(gadget)) return false

  const listing = `${gadget.name} ${gadget.tagline}`
  return hasWiredTypeCDataInListing(listing)
}

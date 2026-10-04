import type { Gadget } from "./gadgets"
import { getProductImageCandidates } from "./gadget-images"

/** 指定 Amazon 商品画像（B0G7RLC8BB） */
export const KEYBOARD_REALFORCE_GX1PLUS_IMAGE =
  "https://m.media-amazon.com/images/I/61b17q96N2L._AC_SL1500_.jpg"

/** 画像読み込み失敗時の Amazon 現行メイン画像 */
export const KEYBOARD_REALFORCE_GX1PLUS_IMAGE_FALLBACK =
  "https://m.media-amazon.com/images/I/61eo+Z-XUbL._AC_SL1500_.jpg"

export const KEYBOARD_REALFORCE_GX1PLUS_AMAZON_URL =
  "https://www.amazon.co.jp/dp/B0G7RLC8BB"

export const KEYBOARD_REALFORCE_GX1PLUS_PRICE = 35200

export const KEYBOARD_REALFORCE_GX1PLUS_TAGLINE =
  "選べる配列 ブラック ダークグレー | 静電容量無接点方式 | ラピッドトリガー | 8000Hz | 最速0.1mm作動 | PBT | リアルフォース | 日本製 | かな無し | X1PC11"

export const KEYBOARD_REALFORCE_GX1PLUS_IMAGE_CANDIDATES = getProductImageCandidates(
  KEYBOARD_REALFORCE_GX1PLUS_IMAGE,
  "keyboard",
  [KEYBOARD_REALFORCE_GX1PLUS_IMAGE_FALLBACK],
)

/** REALFORCE GX1Plus（X1PC11）— 一覧用マスターデータ */
export const keyboardRealforceGx1plus: Gadget[] = [
  {
    id: "realforce-gx1plus-x1pc11",
    category: "keyboard",
    name: "REALFORCE GX1Plus",
    brand: "REALFORCE (リアルフォース)",
    tagline: KEYBOARD_REALFORCE_GX1PLUS_TAGLINE,
    price: KEYBOARD_REALFORCE_GX1PLUS_PRICE,
    rating: 3.9,
    reviews: 15,
    image: KEYBOARD_REALFORCE_GX1PLUS_IMAGE,
    connection: "有線 (USB 着脱式)",
    purchaseUrl: KEYBOARD_REALFORCE_GX1PLUS_AMAZON_URL,
    keyboardUsage: "gaming",
    keyboardFilterTags: ["rapid-trigger", "kb-keycap-pbt", "kb-power-wired"],
    hasRapidTrigger: true,
    keyboardSpreadsheetGaming: true,
    keyboardPollingRate: "8000Hz",
    keyboardSpreadsheetRapidTrigger: true,
    keyboardLayoutArray: "JIS日本語配列",
    keyboardSpreadsheetFeatures: [],
    highlights: [
      { label: "レイアウト", value: "日本語配列" },
      { label: "内部構造", value: "静電容量無接点方式" },
      { label: "キーキャップ", value: "PBT" },
      { label: "配列", value: "JIS日本語配列" },
    ],
    compat: [],
    specGroups: [
      {
        title: "仕様 / 機能",
        rows: [
          { label: "ゲーミングキーボード", value: "ゲーミングキーボード" },
          { label: "ポーリングレート", value: "8000Hz" },
          { label: "ラピッドトリガー", value: "ラピッドトリガー" },
          { label: "配列", value: "JIS日本語配列" },
        ],
      },
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: "日本語配列" },
          { label: "内部構造", value: "静電容量無接点方式" },
          { label: "キーキャップ", value: "PBT" },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方法", value: "有線 (USB 着脱式)" },
          { label: "電源", value: "有線給電" },
        ],
      },
    ],
  },
]

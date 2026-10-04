import type { Gadget } from "./gadgets"

export const KEYBOARD_HYPERX_ALLOY_CORE_RGB_AMAZON_URL =
  "https://www.amazon.co.jp/dp/B07L4XGCFH"

export const KEYBOARD_HYPERX_ALLOY_CORE_RGB_IMAGE =
  "https://m.media-amazon.com/images/I/61JA8uoaa-L._AC_SL1500_.jpg"

export const KEYBOARD_HYPERX_ALLOY_CORE_RGB_PRICE = 4991

export const KEYBOARD_HYPERX_ALLOY_CORE_RGB_TAGLINE =
  "HyperX Alloy Core RGB ゲーミングキーボード 日本語配列 LEDバックライト 日本正規代理店品 4P4F5AJ#ABJ | アンチゴースト機能,防滴,専用メディアコントロール,キーボードロックモード,バックライト付き,耐水性,タクタイル,QWERTY"

/** HyperX Alloy Core RGB — スプレッドシート・一覧用マスターデータ */
export const keyboardHyperxAlloyCoreRgb: Gadget[] = [
  {
    id: "k-gmg-hyperx-alloy-core",
    category: "keyboard",
    name: "HyperX Alloy Core RGB",
    brand: "HyperX",
    tagline: KEYBOARD_HYPERX_ALLOY_CORE_RGB_TAGLINE,
    price: KEYBOARD_HYPERX_ALLOY_CORE_RGB_PRICE,
    rating: 4.3,
    reviews: 1230,
    image: KEYBOARD_HYPERX_ALLOY_CORE_RGB_IMAGE,
    connection: "有線 USB",
    purchaseUrl: KEYBOARD_HYPERX_ALLOY_CORE_RGB_AMAZON_URL,
    keyboardUsage: "gaming",
    keyboardSpreadsheetGaming: true,
    keyboardLayoutArray: "JIS日本語配列",
    keyboardSpreadsheetFeatures: [
      "耐水性（防滴）",
      "バックライト付き",
      "専用メディアコントロール",
    ],
    keyboardFilterTags: ["kb-power-wired"],
    highlights: [
      { label: "レイアウト", value: "フルサイズ" },
      { label: "内部構造", value: "メンブレン" },
      { label: "キーキャップ", value: "一体成型（非推薦/着脱非対応）" },
      { label: "配列", value: "JIS日本語配列" },
    ],
    compat: [],
    specGroups: [
      {
        title: "仕様 / 機能",
        rows: [
          { label: "ゲーミングキーボード", value: "ゲーミングキーボード" },
          { label: "ポーリングレート", value: "—" },
          { label: "ラピッドトリガー", value: "—" },
          { label: "配列", value: "JIS日本語配列" },
          {
            label: "特徴",
            value: "耐水性（防滴） / バックライト付き / 専用メディアコントロール",
          },
        ],
      },
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: "フルサイズ" },
          { label: "内部構造", value: "メンブレン" },
          { label: "キーキャップ", value: "一体成型（非推薦/着脱非対応）" },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方法", value: "有線 USB" },
          { label: "電源", value: "有線給電" },
        ],
      },
    ],
  },
]

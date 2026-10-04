import type { Gadget } from "./gadgets"
import { getProductImageCandidates } from "./gadget-images"

/** Amazon 商品ページの現行メイン画像（B0FGCDSH1J） */
export const KEYBOARD_G515_RAPID_IMAGE =
  "https://m.media-amazon.com/images/I/61wSOwpxaQL._AC_SL1500_.jpg"

export const KEYBOARD_G515_RAPID_AMAZON_URL = "https://www.amazon.co.jp/dp/B0FGCDSH1J"

export const KEYBOARD_G515_RAPID_IMAGE_CANDIDATES = getProductImageCandidates(
  KEYBOARD_G515_RAPID_IMAGE,
  "keyboard",
)

export const KEYBOARD_G515_RAPID_PRICE = 28800

/** Logicool G G515 RAPID TKL（G515-TKL-RTBKd）— ガイド・一覧用マスターデータ */
export const keyboardLogicoolG515Rapid: Gadget[] = [
  {
    id: "g515-rapid",
    category: "keyboard",
    name: "Logicool G G515 RAPID TKL",
    brand: "ロジクール G (Logicool G)",
    tagline:
      "Logicool G ラピッドトリガー G515 RAPID ゲーミングキーボード G515-TKL-RTBKd 磁気式アナログスイッチ 薄型22mmロープロファイル 日本語配列 テンキーレス KEY PRIORITY SOCD",
    price: KEYBOARD_G515_RAPID_PRICE,
    rating: 4.5,
    reviews: 234,
    image: KEYBOARD_G515_RAPID_IMAGE,
    connection: "有線 (USB)",
    purchaseUrl: KEYBOARD_G515_RAPID_AMAZON_URL,
    keyboardUsage: "gaming",
    keyboardFilterTags: ["tenkeyless", "kb-keycap-low-profile", "rapid-trigger", "kb-power-wired"],
    hasRapidTrigger: true,
    keyboardSpreadsheetGaming: true,
    keyboardPollingRate: "1000Hz",
    keyboardSpreadsheetRapidTrigger: true,
    keyboardLayoutArray: "JIS日本語配列",
    keyboardSpreadsheetFeatures: [],
    highlights: [
      { label: "レイアウト", value: "テンキーレス (TKL)" },
      { label: "内部構造", value: "磁気式アナログ (ロープロ)" },
      { label: "キーキャップ", value: "PBT" },
      { label: "配列", value: "JIS日本語配列" },
    ],
    compat: [],
    specGroups: [
      {
        title: "仕様 / 機能",
        rows: [
          { label: "ゲーミングキーボード", value: "ゲーミングキーボード" },
          { label: "ポーリングレート", value: "1000Hz" },
          { label: "ラピッドトリガー", value: "ラピッドトリガー" },
          { label: "配列", value: "JIS日本語配列" },
        ],
      },
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: "テンキーレス (TKL)" },
          { label: "内部構造", value: "磁気式アナログ (ロープロ)" },
          { label: "キーキャップ", value: "PBT" },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方法", value: "有線 (USB)" },
          { label: "電源", value: "有線給電" },
        ],
      },
    ],
  },
]

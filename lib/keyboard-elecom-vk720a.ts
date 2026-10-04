import type { Gadget } from "./gadgets"
import { getProductImageCandidates } from "./gadget-images"

/** ローカル商品画像（斜めカット・付属品・RGBライティング付きメイン画像） */
export const KEYBOARD_ELECOM_VK720A_LOCAL_IMAGE = "/images/keyboards/vk720a.jpg"

/** Amazon 商品ページの現行メイン画像（ローカル読み込み失敗時のフォールバック） */
export const KEYBOARD_ELECOM_VK720A_AMAZON_IMAGE =
  "https://m.media-amazon.com/images/I/71ZXroF8jAL._AC_SL1500_.jpg"

/** ガイド・一覧・詳細で参照する主画像（Hotlink 回避のためローカル優先） */
export const KEYBOARD_ELECOM_VK720A_IMAGE_URL = KEYBOARD_ELECOM_VK720A_LOCAL_IMAGE

export const KEYBOARD_ELECOM_VK720A_AMAZON_URL = "https://www.amazon.co.jp/dp/B0D6XWD6JB"

export const KEYBOARD_ELECOM_VK720A_IMAGE_CANDIDATES = getProductImageCandidates(
  KEYBOARD_ELECOM_VK720A_IMAGE_URL,
  "keyboard",
  [KEYBOARD_ELECOM_VK720A_AMAZON_IMAGE],
)

export const KEYBOARD_ELECOM_VK720A_PRICE = 29979

/** ガイド・カード共通の表示用価格ラベル */
export const KEYBOARD_ELECOM_VK720A_PRICE_LABEL = `￥${KEYBOARD_ELECOM_VK720A_PRICE.toLocaleString("ja-JP")}`

/** エレコム V custom VK720A（TK-VK720ABK）— ガイド・一覧用マスターデータ */
export const keyboardElecomVk720a: Gadget[] = [
  {
    id: "vk720a",
    category: "keyboard",
    name: "ゲーミングキーボード V custom VK720A",
    brand: "エレコム (ELECOM)",
    tagline:
      "エレコム ゲーミングキーボード V custom VK720A ラピッドトリガー 磁気スイッチ 75%サイズ 日本語配列 着脱式有線 USB Type-C TK-VK720ABK ブラック",
    price: KEYBOARD_ELECOM_VK720A_PRICE,
    rating: 4.6,
    reviews: 65,
    image: KEYBOARD_ELECOM_VK720A_IMAGE_URL,
    connection: "有線 (着脱式)",
    purchaseUrl: KEYBOARD_ELECOM_VK720A_AMAZON_URL,
    keyboardUsage: "gaming",
    keyboardFilterTags: ["tenkeyless", "rapid-trigger", "kb-power-wired"],
    hasRapidTrigger: true,
    keyboardSpreadsheetGaming: true,
    keyboardPollingRate: "1000Hz",
    keyboardSpreadsheetRapidTrigger: true,
    keyboardLayoutArray: "JIS日本語配列",
    keyboardSpreadsheetFeatures: [],
    highlights: [
      { label: "レイアウト", value: "75％" },
      { label: "内部構造", value: "磁気スイッチ" },
      { label: "キーキャップ", value: "PBT（ダブルショット）" },
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
          { label: "レイアウト", value: "75％" },
          { label: "内部構造", value: "磁気スイッチ" },
          { label: "キーキャップ", value: "PBT（ダブルショット）" },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方法", value: "有線 (着脱式)" },
          { label: "電源", value: "有線給電" },
        ],
      },
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "783 g" }],
      },
    ],
  },
]

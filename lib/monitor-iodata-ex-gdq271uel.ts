import type { Gadget } from "./gadgets"

export const MONITOR_IODATA_EX_GDQ271UEL_ASIN = "B0FMR8HZP1"

export const MONITOR_IODATA_EX_GDQ271UEL_AMAZON_URL =
  "https://www.amazon.co.jp/dp/B0FMR8HZP1?th=1"

export const MONITOR_IODATA_EX_GDQ271UEL_IMAGE =
  "https://m.media-amazon.com/images/I/71unFkvo9hL._AC_SL1500_.jpg"

export const MONITOR_IODATA_EX_GDQ271UEL_IMAGE_FALLBACKS = [
  "https://m.media-amazon.com/images/I/71unFkvo9hL._AC_SX679_.jpg",
] as const

/** IODATA GigaCrysta EX-GDQ271UEL — ローカル登録（GearMatch） */
export const monitorIodataExGdq271uel: Gadget[] = [
  {
    id: "mon-iodata-ex-gdq271uel",
    category: "monitor",
    name: "EX-GDQ271UEL",
    brand: "IO DATA",
    tagline:
      "IODATA GigaCrysta ゲーミングモニター 27インチ WQHD 280Hz QD-OLED (HDMI/DP)",
    price: 77800,
    rating: 4.0,
    reviews: 66,
    image: MONITOR_IODATA_EX_GDQ271UEL_IMAGE,
    connection: "HDMI ×2 / DisplayPort ×1",
    purchaseUrl: MONITOR_IODATA_EX_GDQ271UEL_AMAZON_URL,
    vesaStandard: "100×100 mm",
    monitorFilterTags: [
      "size-27",
      "res-wqhd",
      "refresh-240-plus",
      "port-hdmi",
      "port-dp",
      "vesa-100",
      "panel-oled",
    ],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "27\"" },
      { label: "解像度", value: "WQHD (2560 x 1440)" },
      { label: "リフレッシュ", value: "280Hz" },
      { label: "パネル", value: "QD-OLED" },
    ],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: "27\"" },
          { label: "解像度", value: "WQHD (2560 x 1440)" },
          { label: "パネル", value: "OLED (QD-OLED)" },
          { label: "リフレッシュレート", value: "280Hz" },
        ],
      },
      {
        title: "接続端子",
        rows: [
          { label: "HDMI", value: "×2 (HDCP 2.3)" },
          { label: "DisplayPort", value: "×1 (HDCP 2.2)" },
        ],
      },
      {
        title: "本体",
        rows: [
          { label: "VESA", value: "100×100 mm" },
          { label: "重量", value: "8.46 kg" },
        ],
      },
    ],
  },
]

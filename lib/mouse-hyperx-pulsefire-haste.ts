import type { Gadget } from "./gadgets"

/** HyperX Pulsefire Haste（Amazon B09QXG3132） */
export const mouseHyperxPulsefireHaste: Gadget[] = [
  {
    id: "hyperx-pulsefire-haste-white",
    category: "mouse",
    name: "HyperX Pulsefire Haste",
    brand: "HyperX",
    tagline:
      "ハイパーエックス(HyperX) HyperX Pulsefire Hasteゲーミングマウス ゲーマー向け 超軽量六角シェルデザイン 60グラム ホワイト 2年保証 4P5E4AA",
    price: 6093,
    rating: 4.3,
    reviews: 8072,
    image: "https://m.media-amazon.com/images/I/61rinkkulVL._AC_SL1500_.jpg",
    connection: "有線 USB",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    mouseUsage: "gaming",
    mouseSensitivity: "16000DPI",
    purchaseUrl:
      "https://www.amazon.co.jp/dp/B09QXG3132/ref=nosim?tag=gmec-22&ec_product_id=106507&th=1",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "60 g" },
      { label: "最大DPI", value: "16,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "電源", value: "有線給電" },
      { label: "ポーリングレート", value: "—" },
    ],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "60 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "最大 DPI", value: "16,000" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" },
          { label: "センサー", value: "Pixart PAW 3335" },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "有線 USB" },
          { label: "電源", value: "有線給電" },
          { label: "通信インターフェース（Amazon記載）", value: "USB" },
        ],
      },
    ],
  },
]

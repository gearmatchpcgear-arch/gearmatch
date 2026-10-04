import type { Gadget } from "./gadgets"

export const MONITOR_DELL_S2725QC_ASIN = "B0GR4NR53Y"

export const MONITOR_DELL_S2725QC_AMAZON_URL =
  "https://www.amazon.co.jp/dp/B0GR4NR53Y"

export const MONITOR_DELL_S2725QC_IMAGE =
  "https://m.media-amazon.com/images/I/71y4hLcha6L._AC_SL1500_.jpg"

/** Dell S2725QC — ローカル登録（GearMatch） */
export const monitorDellS2725qc: Gadget[] = [
  {
    id: "mon-dell-s2725qc",
    category: "monitor",
    name: "S2725QC",
    brand: "Dell",
    tagline:
      "27インチ 4K モニター 無輝点3年保証/4K/IPS非光沢/USB Type-C×1,HDMI×2/sRGB 99%/4ms,120Hz/FreeSync Premium/HDR10/内蔵スピーカー/縦横回転,高さ調整",
    price: 47980,
    rating: 4.5,
    reviews: 128,
    image: MONITOR_DELL_S2725QC_IMAGE,
    connection: "USB Type-C ×1 / HDMI ×2",
    purchaseUrl: MONITOR_DELL_S2725QC_AMAZON_URL,
    vesaStandard: "100×100 mm",
    monitorFilterTags: [
      "size-27",
      "res-4k",
      "refresh-100",
      "port-hdmi",
      "port-usb-c",
      "vesa-100",
      "panel-ips-matte",
    ],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "27\"" },
      { label: "解像度", value: "4K (3840 x 2160)" },
      { label: "リフレッシュ", value: "120Hz" },
      { label: "重量", value: "4.85 kg" },
    ],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: "27\"" },
          { label: "解像度", value: "4K (3840 x 2160)" },
          { label: "液晶パネルの種類", value: "IPS（非光沢）" },
          { label: "リフレッシュレート", value: "120Hz" },
          { label: "応答速度", value: "4ms" },
        ],
      },
      {
        title: "接続端子",
        rows: [{ label: "接続端子", value: "HDMI / USB Type-C" }],
      },
      {
        title: "本体",
        rows: [
          { label: "VESA規格", value: "100×100 mm" },
          { label: "重量", value: "4.85 kg" },
          { label: "保証", value: "無輝点3年保証" },
        ],
      },
    ],
  },
]

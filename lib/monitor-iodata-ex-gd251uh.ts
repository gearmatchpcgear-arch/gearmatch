import type { Gadget } from "./gadgets"

export const MONITOR_IODATA_EX_GD251UH_ASIN = "B0FLC2Y42B"

export const MONITOR_IODATA_EX_GD251UH_AMAZON_URL =
  "https://www.amazon.co.jp/dp/B0FLC2Y42B"

export const MONITOR_IODATA_EX_GD251UH_IMAGE =
  "https://m.media-amazon.com/images/I/71S7-I5j9NL._AC_SL1500_.jpg"

/** IODATA GCFX EX-GD251UH — ローカル登録（GearMatch） */
export const monitorIodataExGd251uh: Gadget[] = [
  {
    id: "mon-iodata-ex-gd251uh",
    category: "monitor",
    name: "IODATA GCFX EX-GD251UH",
    brand: "IO DATA",
    tagline:
      "24.5型FHD 240Hz・HFSパネル・ダイナミックOD 1ms(GTG)・AdaptiveSync・HDMI/DisplayPort",
    price: 19980,
    rating: 4.5,
    reviews: 484,
    image: MONITOR_IODATA_EX_GD251UH_IMAGE,
    connection: "HDMI / DisplayPort",
    purchaseUrl: MONITOR_IODATA_EX_GD251UH_AMAZON_URL,
    vesaStandard: "100×100 mm",
    monitorFilterTags: [
      "size-24",
      "res-fhd",
      "refresh-144-plus",
      "refresh-240-plus",
      "port-hdmi",
      "port-dp",
      "vesa-100",
    ],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "24.5\"" },
      { label: "解像度", value: "FHD (1920 x 1080)" },
      { label: "リフレッシュ", value: "240Hz" },
      { label: "パネル", value: "HFS (高速応答)" },
    ],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: "24.5\"" },
          { label: "解像度", value: "FHD (1920 x 1080)" },
          { label: "パネル", value: "HFS (高速応答)" },
          { label: "リフレッシュレート", value: "240Hz" },
          { label: "応答速度", value: "1ms [GTG]（ダイナミックOD設定時）" },
        ],
      },
      {
        title: "接続端子",
        rows: [
          { label: "HDMI", value: "対応（240Hz）" },
          { label: "DisplayPort", value: "対応（240Hz）" },
        ],
      },
      {
        title: "本体",
        rows: [
          { label: "VESA", value: "100×100 mm" },
          { label: "重量", value: "約 2.8 kg" },
        ],
      },
    ],
  },
]

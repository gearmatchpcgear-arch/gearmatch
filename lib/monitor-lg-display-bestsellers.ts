import type { Gadget } from "./gadgets"

/** Amazon.co.jp ディスプレイ売れ筋（5595709051）LGモニター全件。 */
export const monitorLgDisplayBestsellers: Gadget[] = [
  {
    id: "mon-lg-011",
    category: "monitor",
    name: "32UD60-B",
    brand: "LG",
    tagline: "LG モニター ディスプレイ 32UD60-B 31.5インチ/4K/VA 非光沢/HDMI、DisplayPort/スピーカー搭載/高さ調節対応",
    price: 29800,
    rating: 3.6,
    reviews: 53,
    image: "https://m.media-amazon.com/images/I/61MZAwzvX1L._AC_SL1500_.jpg",
    connection: "HDMI / DisplayPort 対応",
    purchaseUrl: "https://www.amazon.co.jp/dp/B078YHRHQ7",
    vesaStandard: "100×100 mm",
    monitorFilterTags: ["size-315-plus","res-4k","refresh-60","port-hdmi","port-dp","vesa-100","panel-va-matte"],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "31.5\"" },
      { label: "解像度", value: "4K (3840×2160)" },
      { label: "リフレッシュ", value: "60Hz" },
      { label: "パネル", value: "VA 非光沢" },
    ],
    compat: [],
    specGroups: [
      { title: "ディスプレイ", rows: [
          { label: "画面サイズ", value: "31.5\"" },
          { label: "解像度", value: "4K (3840×2160)" },
          { label: "パネル", value: "VA 非光沢" },
          { label: "リフレッシュレート", value: "60Hz" },
          { label: "応答速度", value: "5ms (GTG)" },
          { label: "Amazon売れ筋", value: "ディスプレイ #11" },
        ]},
      { title: "接続端子", rows: [
          { label: "HDMI×1", value: "対応" },
          { label: "DisplayPort×1", value: "対応" },
        ]},
      { title: "本体", rows: [
          { label: "壁掛け対応（VESA規格）", value: "100×100 mm" },
          { label: "寸法", value: "—" },
          { label: "重量", value: "5.3Kg" },
        ]},
    ],
  },
  {
    id: "mon-lg-012",
    category: "monitor",
    name: "24GM79G-B",
    brand: "LG",
    tagline: "LG ゲーミング モニター ディスプレイ 24GM79G-B 24インチ/フルHD/TN非光沢/144Hz/2ms(1ms MBR)/DisplayPort×1・HDMI×2",
    price: 29800,
    rating: 4.2,
    reviews: 44,
    image: "https://m.media-amazon.com/images/I/71h2f0j5BxL._AC_SL1500_.jpg",
    connection: "DisplayPort / HDMI",
    purchaseUrl: "https://www.amazon.co.jp/dp/B06ZYNGK21",
    vesaStandard: "100×100 mm",
    monitorFilterTags: ["size-24","res-fhd","refresh-144-plus","port-hdmi","port-dp","vesa-100","panel-tn"],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "24\"" },
      { label: "解像度", value: "FHD (1920×1080)" },
      { label: "リフレッシュ", value: "144Hz" },
      { label: "パネル", value: "TN 非光沢" },
    ],
    compat: [],
    specGroups: [
      { title: "ディスプレイ", rows: [
          { label: "画面サイズ", value: "24\"" },
          { label: "解像度", value: "FHD (1920×1080)" },
          { label: "パネル", value: "TN 非光沢" },
          { label: "リフレッシュレート", value: "144Hz" },
          { label: "応答速度", value: "2ms (1ms MBR)" },
          { label: "Amazon売れ筋", value: "ディスプレイ #12" },
        ]},
      { title: "接続端子", rows: [
          { label: "DisplayPort×1", value: "対応" },
          { label: "HDMI×2", value: "対応" },
        ]},
      { title: "本体", rows: [
          { label: "壁掛け対応（VESA規格）", value: "100×100 mm" },
          { label: "寸法", value: "—" },
          { label: "重量", value: "4.6 kg" },
        ]},
    ],
  },
]

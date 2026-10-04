import type { Gadget } from "./gadgets"

/** Amazon.co.jp ダイナミックマイク新着（2130075051）。マイク本体のみ。 */
export const micDynamicNewReleases: Gadget[] = [
  {
    id: "mic-dyn-nr-01",
    category: "mic",
    name: "USB/XLR ダイナミックマイク",
    brand: "—",
    tagline: "プロ用有線ダイナミックマイク。XLR接続・スーパーカーディオイド・スイッチなし（大型ライブステージ向け）",
    price: 8800,
    rating: 5,
    reviews: 1,
    image: "https://m.media-amazon.com/images/I/61LUfjHQQXL._AC_SL1500_.jpg",
    connection: "USB Type-C / XLR",
    purchaseUrl: "https://www.amazon.co.jp/dp/B0HCYFPHYC",
    micFilterTags: ["dynamic","stand"],
                micUseTags: ["Web会議・オンライン授業・通話", "ゲーム実況・配信・ラジオ録音", "歌・楽器の録音（DTM）"],
                micFeatureTags: ["ミュートボタン（タッチミュート）", "イヤホンジャック（ダイレクトモニタリング）", "ゲインノブ（音量調節ノブ）"],
    micSpreadsheetJTags: [],
    micSpreadsheetKTags: [],
    highlights: [
      { label: "指向性", value: "単一指向性" },
      { label: "周波数特性", value: "50Hz-18kHz" },
      { label: "接続方式", value: "USB Type-C / XLR" },
      { label: "サンプルレート", value: "—" },
      { label: "タイプ", value: "ダイナミック" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "ダイナミック" },
          { label: "指向性", value: "単一指向性" },
          { label: "周波数特性", value: "50Hz-18kHz" },
          { label: "サンプルレート", value: "—" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "USB Type-C / XLR" },
          { label: "電源", value: "有線給電" },
          { label: "ダイレクトモニタリング", value: "対応" },
          { label: "ミュート", value: "対応" },
          { label: "音量調整", value: "対応" },
          { label: "スタンド付属", value: "対応" },
          { label: "Amazon新着", value: "ダイナミックマイク #1" },
        ],
      },
    ],
  },
      {
    id: "mic-dyn-nr-04",
    category: "mic",
    name: "AC-930",
    brand: "CAROL",
    tagline: "プロ用有線ダイナミックマイク。XLR接続・スーパーカーディオイド・スイッチなし（大型ライブステージ向け）",
    price: 17590,
    rating: 4.4,
    reviews: 39,
    image: "https://m.media-amazon.com/images/I/71TRjwMv1eL._AC_SL1500_.jpg",
    connection: "XLR",
    purchaseUrl: "https://www.amazon.co.jp/dp/B0FS6CK6C8",
    micFilterTags: ["dynamic"],
                micUseTags: ["歌・楽器の録音（DTM）"],
                micFeatureTags: [],
    micSpreadsheetJTags: [],
    micSpreadsheetKTags: [],
    highlights: [
      { label: "指向性", value: "超単一指向性" },
      { label: "周波数特性", value: "50Hz-18kHz" },
      { label: "接続方式", value: "XLR" },
      { label: "サンプルレート", value: "—" },
      { label: "タイプ", value: "ダイナミック" },
    ],
    compat: [],
    specGroups: [
      {
        title: "オーディオ",
        rows: [
          { label: "タイプ", value: "ダイナミック" },
          { label: "指向性", value: "超単一指向性" },
          { label: "周波数特性", value: "50Hz-18kHz" },
          { label: "サンプルレート", value: "—" },
        ],
      },
      {
        title: "接続 / 機能",
        rows: [
          { label: "接続方式", value: "XLR" },
          { label: "電源", value: "有線給電" },
          { label: "Amazon新着", value: "ダイナミックマイク #4" },
        ],
      },
    ],
  }
]

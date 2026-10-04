import { mouseBestsellers } from "./mouse-bestsellers"
import { mouseGamingBestsellers } from "./mouse-gaming-bestsellers"
import { mouseGamingNewReleases } from "./mouse-gaming-new-releases"
import { mouseGamingNewReleasesPage2 } from "./mouse-gaming-new-releases-page2"
import { mouseGProSearch } from "./mouse-g-pro-search"
import { mouseGproPage3 } from "./mouse-gpro-page3"
import { mouseHyperxPulsefireHaste } from "./mouse-hyperx-pulsefire-haste"
import { mousePopularBrands } from "./mouse-popular-brands"
import { mouseNewReleases } from "./mouse-new-releases"
import { mouseNewReleasesPage2 } from "./mouse-new-releases-page2"
import { keyboardBestsellers } from "./keyboard-bestsellers"
import { keyboardBestsellersPage2 } from "./keyboard-bestsellers-page2"
import { keyboardTabletBestsellers } from "./keyboard-tablet-bestsellers"
import { keyboardGamingBestsellers } from "./keyboard-gaming-bestsellers"
import { keyboardGamingBestsellersPage2 } from "./keyboard-gaming-bestsellers-page2"
import { keyboardGamingMostGifted } from "./keyboard-gaming-most-gifted"
import { keyboardGamingMostGiftedPage2 } from "./keyboard-gaming-most-gifted-page2"
import { keyboardGamingNewReleasesPage1 } from "./keyboard-gaming-new-releases-page1"
import { keyboardGamingNewReleasesPage2 } from "./keyboard-gaming-new-releases-page2"
import { keyboardGproPage3 } from "./keyboard-gpro-page3"
import { keyboardNewReleases } from "./keyboard-new-releases"
import { keyboardNewReleasesPage2 } from "./keyboard-new-releases-page2"
import { keyboardElecomVk720a } from "./keyboard-elecom-vk720a"
import { keyboardLogicoolG515Rapid } from "./keyboard-logicool-g515-rapid"
import { keyboardRealforceGx1plus } from "./keyboard-realforce-gx1plus"
import { keyboardHyperxAlloyCoreRgb } from "./keyboard-hyperx-alloy-core-rgb"
import { monitorBestsellers } from "./monitor-bestsellers"
import { monitorBestsellersPage2 } from "./monitor-bestsellers-page2"
import { monitorPremiumGaming } from "./monitor-premium-gaming"
import { monitorNewReleases } from "./monitor-new-releases"
import { monitorNewReleasesPage2 } from "./monitor-new-releases-page2"
import { monitorMostGifted } from "./monitor-most-gifted"
import { monitorSearch22120 } from "./monitor-search-22-120"
import { monitorLgDisplayBestsellers } from "./monitor-lg-display-bestsellers"
import { monitorAsusSearch } from "./monitor-asus-search"
import { monitorAcerSearch } from "./monitor-acer-search"
import { monitorRefresh144Search } from "./monitor-refresh144-search"
import { monitorRefresh144SearchPage2 } from "./monitor-refresh144-search-page2"
import { monitorDellSearch } from "./monitor-dell-search"
import { monitorPhilipsSearch } from "./monitor-philips-search"
import { monitorLenovoSearch } from "./monitor-lenovo-search"
import { monitorLenovoSearchPage2 } from "./monitor-lenovo-search-page2"
import { monitorLenovoSearch26Plus } from "./monitor-lenovo-search-26plus"
import { monitorLenovoSearch26PlusPage2 } from "./monitor-lenovo-search-26plus-page2"
import { monitorLenovoSearch1822 } from "./monitor-lenovo-search-1822"
import { monitorIodataExGdq271uel } from "./monitor-iodata-ex-gdq271uel"
import { monitorIodataExGd251uh } from "./monitor-iodata-ex-gd251uh"
import { monitorDellS2725qc } from "./monitor-dell-s2725qc"
import { audioInterfaceBestsellers } from "./audio-interface-bestsellers"
import { micBestsellers } from "./mic-bestsellers"
import { micBestsellersPage2 } from "./mic-bestsellers-page2"
import { micMostGifted } from "./mic-most-gifted"
import { micMostGiftedPage2 } from "./mic-most-gifted-page2"
import { micComputersSearch } from "./mic-computers-search"
import { micComputersSearchStreaming } from "./mic-computers-search-streaming"
import { micCondenserBestsellers } from "./mic-condenser-bestsellers"
import { micCondenserBestsellersPage2 } from "./mic-condenser-bestsellers-page2"
import { micDynamicBestsellers } from "./mic-dynamic-bestsellers"
import { micDynamicBestsellersPage2 } from "./mic-dynamic-bestsellers-page2"
import { micDynamicNewReleases } from "./mic-dynamic-new-releases"
import { micHeadsetNewReleases } from "./mic-headset-new-releases"
import { cameraBestsellers } from "./camera-bestsellers"
import { cameraStreamingSearch } from "./camera-streaming-search"
import { getCameraCardHighlights } from "./camera-filter-tags"
import { monitorArmBestsellers } from "./monitor-arm-bestsellers"
import { monitorArmNewReleases } from "./monitor-arm-new-releases"
import { monitorArmNewReleasesPage2 } from "./monitor-arm-new-releases-page2"
import { gamingChairs } from "./gaming-chairs"
import { gamingChairAkracingStore } from "./gaming-chair-akracing-store"
import { gamingChairNewReleases } from "./gaming-chair-new-releases"
import { gamingChairSearch } from "./gaming-chair-search"
import { gamingChairSearchPage3 } from "./gaming-chair-search-page3"
import { gamingChairSearchPage4 } from "./gaming-chair-search-page4"
import type { MouseFilterTag } from "./mouse-filter-tags"
import type { KeyboardFilterTag } from "./keyboard-filter-tags"
import type { KeyboardUseTag } from "./keyboard-use-tags"
import type { MicFilterTag } from "./mic-filter-tags"
import type { MicFeatureTag } from "./mic-feature-tags"
import type { MicUseTag } from "./mic-use-tags"
import type { MonitorArmFilterTag } from "./monitor-arm-filter-tags"
import { getMouseButtonCountDisplay } from "./mouse-button-count"
import type { GamingChairFilterTag } from "./gaming-chair-filter-tags"
import { sanitizeSpecDisplayValue } from "./spec-display-sanitize"
import {
  normalizeMicTypeDisplay,
  normalizeMonitorRefreshDisplay,
  normalizeSpecDisplayByLabel,
} from "./spec-display-normalize"
import { getMicConnectionDisplay } from "./mic-connection-display"
import { getMouseSensitivityDisplay } from "./mouse-sensitivity-display"
import {
  resolveMicDirectivityValue,
  resolveMonitorRefreshRateValue,
} from "./card-spec-field-resolvers"
import { isKeyboardAccessoryProduct } from "./keyboard-filter-tags"
import {
  getGadgetConnectionDisplay,
  normalizeUsbConnectionDisplay,
} from "./usb-connection-display"
import { formatGadgetPowerDisplay, getGadgetPowerDisplay } from "./power-display"
import {
  getKeyboardCardHighlightEntries,
  getKeyboardInternalStructure,
  getKeyboardInternalStructureRaw,
  getKeyboardKeycaps,
  getKeyboardLayout,
  getKeyboardPower,
} from "./keyboard-filter-tags"
import { getKeyboardLayoutArray } from "./keyboard-spreadsheet-tags"
import { isMicAccessoryProduct } from "./mic-accessory-filter"
import {
  getMonitorResolutionDisplay,
  getMonitorPanelDisplay,
  formatMonitorResolutionRaw,
} from "./monitor-filter-tags"
import { getMonitorVesaStandardDisplay } from "./monitor-vesa-standard"
import {
  getAudioInterfaceCardSpec,
  getAudioInterfaceDetailSpec,
} from "./audio-interface-filter-tags"
import { formatAudioInterfacePcConnectionDisplay } from "./audio-interface-pc-connection"
import {
  getGamingChairFrameMaterial,
  getGamingChairMaterial,
  getGamingChairMaxRecliningAngle,
  getGamingChairStyle,
  GAMING_CHAIR_FRAME_CARD_LABEL,
  GAMING_CHAIR_OTTOMAN_CARD_LABEL,
  formatFrameMaterialDisplay,
  gamingChairHasOttoman,
  getGamingChairOttomanFilterValue,
} from "./gaming-chair-filter-tags"
import {
  formatDimensionsNumbersOnly,
  GAMING_CHAIR_DIMENSION_CARD_LABEL,
  getGamingChairDimensionCardDisplay,
  isGamingChairDimensionCardLabel,
} from "./gaming-chair-dimension-display"
import {
  getGamingChairCsvCardHighlights,
  getGamingChairCsvRow,
  isGamingChairListedInCsv,
  withGamingChairCsvOverlay,
} from "./gaming-chairs-csv-data"
import { isRepositoryExcludedGadgetId } from "./repository-excluded-gadget-ids"

export { withGamingChairCsvOverlay }
export type { MouseFilterTag } from "./mouse-filter-tags"
export type { KeyboardFilterTag } from "./keyboard-filter-tags"
export type { KeyboardUseTag } from "./keyboard-use-tags"
export type { MonitorFilterTag, MonitorResolutionTag } from "./monitor-filter-tags"
export type { MicFilterTag } from "./mic-filter-tags"
export type { MicFeatureTag } from "./mic-feature-tags"
export type { MicUseTag } from "./mic-use-tags"
export type { MonitorArmFilterTag } from "./monitor-arm-filter-tags"
export type { GamingChairFilterTag } from "./gaming-chair-filter-tags"
export type { AudioInterfaceFilterTag, AudioInterfacePrimaryUse } from "./audio-interface-filter-tags"

export type CategoryId =
  | "mouse"
  | "keyboard"
  | "mic"
  | "camera"
  | "monitor-arm"
  | "monitor"
  | "gaming-chair"
  | "audio-interface"

export type MouseUsage = "gaming" | "productivity"

export type KeyboardUsage = "gaming" | "productivity"

export type Category = {
  id: CategoryId
  label: string
}

export const categories: Category[] = [
  { id: "mouse", label: "マウス" },
  { id: "keyboard", label: "キーボード" },
  { id: "mic", label: "マイク" },
  { id: "camera", label: "カメラ" },
  { id: "monitor-arm", label: "モニターアーム" },
  { id: "monitor", label: "モニター" },
  { id: "gaming-chair", label: "ゲーミングチェア" },
  { id: "audio-interface", label: "オーディオインターフェイス" }]

export type SpecRow = {
  label: string
  value: string
}

export type SpecGroup = {
  title: string
  rows: SpecRow[]
}

export type CompatTag = {
  label: string
  /** ok = 対応 / warn = 条件付き / none = 非対応 */
  status: "ok" | "warn" | "none"
  /** 絞り込み条件と連動するタグ */
  filterLinked?: boolean
}

export type Gadget = {
  id: string
  category: CategoryId
  name: string
  brand: string
  tagline: string
  price: 58800
  /** 定価（表示用。listPrice がなければ price を使用） */
  listPrice?: number
  rating: number
  /** レビュー件数 */
  reviews: number
  /** 接続方式・端子等（ゲーミングチェア等、該当しないカテゴリーでは省略） */
  connection?: string
  image: string
  /** カード・詳細のスペック値（公式明記のみ。未公表は {@link UNSPECIFIED_SPEC}） */
  highlights: { label: string; value: string }[]
  compat: CompatTag[]
  specGroups: SpecGroup[]
  /** 商品ページURL（Amazon等） */
  purchaseUrl: string
  /** マウス用途（gaming = ゲーミング / productivity = ビジネス・作業用） */
  mouseUsage?: MouseUsage
  /** マウス絞り込み用タグ（未指定時は名称・スペックから推論） */
  mouseFilterTags?: MouseFilterTag[]
  /** キーボード絞り込み用タグ（未指定時は名称・スペックから推論） */
  keyboardFilterTags?: KeyboardFilterTag[]
  /** キーボード用途別タグ（タブレット用キーボード等） */
  keyboardUseTags?: KeyboardUseTag[]
  /** キーボード用途（gaming = ゲーミング / productivity = ビジネス・作業用） */
  keyboardUsage?: KeyboardUsage
  /** ラピッドトリガー対応（未指定時は名称・スペックから推論） */
  hasRapidTrigger?: boolean
  /** モニター絞り込み用タグ（未指定時は名称・スペックから推論） */
  monitorFilterTags?: MonitorFilterTag[]
  /** 壁掛けVESA規格（モニターのみ。未判明は {@link UNSPECIFIED_SPEC}） */
  vesaStandard?: string
  /** マイク絞り込み用タグ（未指定時は名称・スペックから推論） */
  micFilterTags?: MicFilterTag[]
  /** マイク用途別タグ（Web会議 / 配信 / DTM / Vlog 等） */
  micUseTags?: MicUseTag[]
  /** マイク機能別タグ（ミュート / イヤホンジャック / ゲインノブ / ノイズキャンセリング等） */
  micFeatureTags?: MicFeatureTag[]
  /** スプレッドシート J欄（その他機能） */
  micSpreadsheetJTags?: import("./mic-spreadsheet-tags").MicSpreadsheetJTag[]
  /** スプレッドシート K欄 */
  micSpreadsheetKTags?: import("./mic-spreadsheet-tags").MicSpreadsheetKTag[]
  /** スプレッドシート K列（ゲーミングキーボード） */
  keyboardSpreadsheetGaming?: boolean
  /** スプレッドシート L列（ポーリングレート） */
  keyboardPollingRate?: string
  /** スプレッドシート M列（ラピッドトリガー） */
  keyboardSpreadsheetRapidTrigger?: boolean
  /** スプレッドシート N列（配列） */
  keyboardLayoutArray?: string
  /** スプレッドシート O列（特徴） */
  keyboardSpreadsheetFeatures?: string[]
  /** スプレッドシート I欄（マイク感度） */
  micSensitivity?: string
  /** スプレッドシート I列（カメラ特徴・タグ） */
  cameraSpreadsheetITags?: import("./camera-spreadsheet-tags").CameraSpreadsheetITag[]
  /** スプレッドシート L列（モニター追加絞り込みタグ） */
  monitorSpreadsheetLTags?: import("./monitor-spreadsheet-tags").MonitorSpreadsheetLTag[]
  /** 生産終了・販売終了モデル（一覧からデフォルト非表示） */
  isDiscontinued?: boolean
  /** 中古品（一覧からデフォルト非表示） */
  isUsed?: boolean
  /** キーボード本体以外（スイッチ・キーキャップ単体、工具等。一覧から除外） */
  isKeyboardAccessory?: boolean
  /** マイク本体以外（ヘッドセット、スピーカーフォン、周辺機器セット等。一覧から除外） */
  isMicAccessory?: boolean
  /** モニターアーム絞り込み用タグ（未指定時は名称・スペックから推論） */
  monitorArmFilterTags?: MonitorArmFilterTag[]
  /** スプレッドシート I列（アームタイプ） */
  monitorArmSpreadsheetArmType?: import("./monitor-arm-spreadsheet-tags").MonitorArmSpreadsheetArmType
  /** スプレッドシート H列（ボタン数・例: "3ボタン"） */
  mouseSpreadsheetButtonCount?: string
  /** スプレッドシート J列（最大DPI / 感度） */
  mouseSensitivity?: string
  /** スプレッドシート K列（用途/その他の仕様） */
  mouseSpreadsheetUsageSpecs?: import("./mouse-spreadsheet-tags").MouseSpreadsheetUsageTag[]
  /** ゲーミングチェア絞り込み用タグ（未指定時は名称・スペックから推論） */
  gamingChairFilterTags?: GamingChairFilterTag[]
  /** ゲーミングチェア: 最大リクライニング角度（例: "135°", "180°"） */
  maxRecliningAngle?: string
  /** ゲーミングチェア: フレームの種類（例: "合金鋼", "スチール（鋼鉄）"） */
  frameMaterial?: string
  /** ゲーミングチェア: オットマン（足置き）の有無 */
  hasOttoman?: boolean
  /** ゲーミングチェア: 本体寸法（奥行×幅×高さ / D×W×H） */
  dimensions?: string
  /** ゲーミングチェア: 座面の奥行 */
  seatDepth?: string
  /** ゲーミングチェア: 座面の幅 */
  seatWidth?: string
  /** ゲーミングチェア: 背もたれの幅 */
  backrestWidth?: string
  /** オーディオIF: 入力端子と数 */
  inputs?: string
  /** オーディオIF: PC接続方法 */
  connectionType?: string
  /** オーディオIF: ファンタム電源 */
  phantomPower?: string
  /** オーディオIF: システム要件 */
  systemRequirements?: string
  /** オーディオIF: ダイレクトモニタリング */
  directMonitoring?: boolean | "対応" | "非対応"
  /** オーディオIF: ループバック */
  loopback?: boolean | "対応" | "非対応"
  /** オーディオIF: 主な用途 */
  primaryUses?: import("./audio-interface-filter-tags").AudioInterfacePrimaryUse[]
  /** オーディオIF: サンプリングレート */
  samplingRate?: string
  /** オーディオIF: 入力数区分（スプレッドシート J 列。フィルター専用・非表示） */
  audioInterfaceInputTier?: string
  /** オーディオIF: スプレッドシート K 列（内部メモ・非表示） */
  audioInterfaceSpreadsheetKNote?: string
  /** オーディオIF: ビット深度 */
  bitDepth?: string
  /** オーディオIF絞り込み用タグ */
  audioInterfaceFilterTags?: import("./audio-interface-filter-tags").AudioInterfaceFilterTag[]
}

/** 公式未公表スペックのプレースホルダー（全カテゴリ共通） */
export const UNSPECIFIED_SPEC = "—" as const

/** スペック値はメーカー公式（サイト・仕様書・取扱説明書）の明記のみ。未公表・推測・標準値は {@link UNSPECIFIED_SPEC} */
const allGadgets: Gadget[] = [
  {
    id: "m-mx-master-3s",
    category: "mouse",
    name: "Logicool MX MASTER 3S",
    brand: "Logicool",
    tagline:
      "ロジクール MX MASTER3s アドバンスド ワイヤレス マウス 静音 MX2300GR Logi Bolt Bluetooth Unifying非対応 8000dpi 高速スクロールホイール USB-C 充電式 無線 MX2300 グラファイト 国内正規品",
    price: 18800,
    rating: 4.5,
    reviews: 926,
    image: "https://m.media-amazon.com/images/I/51tJ0JISpeL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー) / Bluetooth",
    mouseSpreadsheetButtonCount: "7ボタン",
    mouseSpreadsheetUsageSpecs: ["silent", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B0B1Q6VB16",
    mouseUsage: "productivity",
    mouseSensitivity: "8000DPI",
    mouseFilterTags: ["reading-laser", "side-buttons", "side-wheel"],
    highlights: [
      { label: "重量", value: "141 g" },
      { label: "最大DPI", value: "8,000 DPI" },
      { label: "読み取り方式", value: "Darkfield" },
      { label: "ポーリングレート", value: "—" },
    ],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "141 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "Darkfield 光学式" },
          { label: "最大 DPI", value: "8,000" },
          { label: "ポーリングレート", value: "—" },
          { label: "ボタン数", value: "7ボタン" },
          { label: "スクロール", value: "MagSpeed 電磁気" },
        ],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "Logi Bolt (2.4GHz) / Bluetooth" },
          { label: "電源", value: "充電式" },
          { label: "充電端子", value: "USB-C" },
          { label: "バッテリー", value: "充電式 / 最大 70 日" },
          { label: "Easy-Switch", value: "最大3台" },
        ],
      },
    ],
  },
  {
    id: "m-g-pro-x-sl2",
    category: "mouse",
    name: "G PRO X SUPERLIGHT 2",
    brand: "Logicool G",
    tagline: "Logicool G 8000Hz ポーリングレート PRO X SUPERLIGHT 2 ワイヤレス ゲーミングマウス G-PPD-004WL-BK軽量 60g LIGHTFORCE ハイブリッドスイッチ LIGHTSPEED HERO2 センサー USB Type-C 充電 POWERPLAY 対応 ゲーミング マウス ブラック",
    price: 21980,
    listPrice: 26950,
    rating: 4.5,
    reviews: 730,
    image: "https://m.media-amazon.com/images/I/51aHtlvwrGL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー)",
    mouseSpreadsheetButtonCount: "5ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B0CGR5B9FS",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "60 g" },
      { label: "最大DPI", value: "32,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "8,000 Hz" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "幅", value: "63.5 mm" },
          { label: "奥行き", value: "125.0 mm" },
          { label: "高さ", value: "39.9 mm" },
          { label: "重量", value: "60 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "HERO 2 光学式" },
          { label: "最大 DPI", value: "32,000" },
          { label: "ポーリングレート", value: "8,000 Hz" },
          { label: "スイッチ", value: "LIGHTFORCE ハイブリッド" },
          { label: "ボタン数", value: "5ボタン" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー)" },
          { label: "電源", value: "充電式" },
          { label: "充電端子", value: "USB-C" },
          { label: "バッテリー", value: "内蔵 Li-Po / 95h" }],
      }],
  },
  {
    id: "m-logicool-g304",
    category: "mouse",
    name: "Logicool G G304 LIGHTSPEED ワイヤレス ゲーミングマウス",
    brand: "Logicool G",
    tagline: "HERO 12Kセンサー（光学式）・99g・LIGHTSPEED 2.4GHz。6個のプログラム可能ボタン・最大250時間駆動",
    price: 4718,
    rating: 4.4,
    reviews: 6047,
    image: "https://m.media-amazon.com/images/I/51uIMsNFRHL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー)",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B07DVC25R2",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "99 g" },
      { label: "最大DPI", value: "12,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "99 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "HERO 12K 光学式" },
          { label: "最大 DPI", value: "12,000" },
          { label: "ポーリングレート", value: "—" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー)" },
          { label: "電源", value: "単3形乾電池×1本" },
          { label: "電池持続", value: "最大 250 時間" }],
      }],
  },
  {
    id: "m-logicool-g304rwh",
    category: "mouse",
    name: "Logicool G G304rWH LIGHTSPEED ワイヤレス ゲーミングマウス (ホワイト)",
    brand: "Logicool G",
    tagline: "HERO 12K（光学式）・99g・ホワイト・LIGHTSPEED 2.4GHz。6個のプログラム可能ボタン・最大250時間駆動",
    price: 4922,
    rating: 4.5,
    reviews: 2402,
    image: "https://m.media-amazon.com/images/I/51r5COeijCL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー)",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B07D3GRQC8",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "99 g" },
      { label: "最大DPI", value: "12,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "重量", value: "99 g" },
          { label: "カラー", value: "ホワイト" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "HERO 12K（光学式）" },
          { label: "最大 DPI", value: "12,000" },
          { label: "ポーリングレート", value: "—" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー)" },
          { label: "電源", value: "単3形乾電池×1本" },
          { label: "電池持続", value: "最大 250 時間" }],
      }],
  },
  {
    id: "m-logicool-g304-bl",
    category: "mouse",
    name: "Logicool G G304 LIGHTSPEED ワイヤレス ゲーミングマウス (ブルー)",
    brand: "Logicool G",
    tagline: "HERO 12K（光学式）・99g・ブルー・LIGHTSPEED 2.4GHz。6個のプログラム可能ボタン・最大250時間駆動",
    price: 4718,
    rating: 4.3,
    reviews: 422,
    image: "https://m.media-amazon.com/images/I/51UME9BRjJL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー)",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B099MXK6P8",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "99 g" },
      { label: "最大DPI", value: "12,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "重量", value: "99 g" },
          { label: "カラー", value: "ブルー" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "HERO 12K（光学式）" },
          { label: "最大 DPI", value: "12,000" },
          { label: "ポーリングレート", value: "—" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー)" },
          { label: "電源", value: "単3形乾電池×1本" },
          { label: "電池種別", value: "単3形乾電池×1本" },
          { label: "電池持続", value: "最大 250 時間" }],
      }],
  },
  {
    id: "m-logicool-g703h",
    category: "mouse",
    name: "Logicool G ワイヤレス ゲーミングマウス G703h",
    brand: "Logicool G",
    tagline: "95g・HERO 25K（光学式）・6ボタン・LIGHTSPEED 2.4GHz・充電式（POWERPLAY対応）",
    price: 8455,
    rating: 4.6,
    reviews: 12797,
    image: "https://m.media-amazon.com/images/I/41I--98xeJL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー)",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B07SYKKP47",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "95 g" },
      { label: "最大DPI", value: "25,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "1,000 Hz" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "95 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "HERO 25K（光学式）" },
          { label: "最大 DPI", value: "25,000" },
          { label: "ポーリングレート", value: "1,000 Hz" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー)" },
          { label: "電源", value: "充電式" },
          { label: "充電持続", value: "最大 60 時間" },
          { label: "備考", value: "POWERPLAY ワイヤレス充電対応" }],
      }],
  },{
    id: "m-msi-forge-gm340w",
    category: "mouse",
    name: "MSI FORGE GM340 W NAVY ワイヤレスゲーミングマウス",
    brand: "MSI",
    tagline: "57g・充電式・光学式（PAW3311）・6ボタン・2.4GHz / Bluetooth / USB有線（MS0808）",
    price: 3336,
    rating: 4.5,
    reviews: 14,
    image: "https://m.media-amazon.com/images/I/61bOQtX41UL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー) / Bluetooth / 有線 USB",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B0FXCCV2NQ",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "57 g" },
      { label: "最大DPI", value: "12,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "1,000 Hz" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "57 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "PixArt PAW3311 光学式（オプティカル）" },
          { label: "最大 DPI", value: "12,000" },
          { label: "ポーリングレート", value: "1,000 Hz" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー) / Bluetooth / 有線 USB" },
          { label: "電源", value: "充電式" },
          { label: "充電持続", value: "最大 82 時間" }],
      }],
  },{
    id: "m-msi-versa-300w",
    category: "mouse",
    name: "MSI VERSA 300 W ワイヤレス ゲーミングマウス",
    brand: "MSI",
    tagline: "60g超軽量・充電式（USB Type-C）・光学式（PAW-3104DB）・6ボタン・2.4GHz / Bluetooth / 有線USB・左右対称（MS0731）",
    price: 2818,
    rating: 3.8,
    reviews: 186,
    image: "https://m.media-amazon.com/images/I/51hGVqdfDEL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー) / Bluetooth / 有線 USB",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B0DKT8S1XC",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "60 g" },
      { label: "最大DPI", value: "8,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "1,000 Hz" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "重量", value: "60 g" },
          { label: "形状", value: "左右対称" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "PixArt PAW-3104DB 光学式" },
          { label: "最大 DPI", value: "8,000" },
          { label: "ポーリングレート", value: "1,000 Hz" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー) / Bluetooth / 有線 USB" },
          { label: "電源", value: "充電式" },
          { label: "充電持続", value: "最大 50 時間" }],
      }],
  },{
    id: "m-bengoo-wired-gaming",
    category: "mouse",
    name: "BENGOO ゲーミングマウス (有線)",
    brand: "BENGOO",
    tagline: "138g・有線USB・光学式（1200〜3600 DPI 4段階）・6ボタン・RGBライト",
    price: 1799,
    rating: 4.1,
    reviews: 13427,
    image: "https://m.media-amazon.com/images/I/61tZtPJmEmL._AC_SL1500_.jpg",
    connection: "有線 USB",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B00Z9V0NKC",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "120 g" },
      { label: "最大DPI", value: "3,600 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "120 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "光学式（オプティカル）" },
          { label: "最大 DPI", value: "3,600" },
          { label: "DPI切替", value: "1,200 / 1,600 / 2,400 / 3,600（4段階）" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり（戻る・進む）" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "有線 USB" },
          { label: "電源", value: "有線給電" }],
      }],
  },
  {
    id: "m-elecom-vm500",
    category: "mouse",
    name: "エレコム ゲーミングマウス V custom VM500 (M-VM500BK)",
    brand: "ELECOM",
    tagline: "75g・充電式（USB Type-C）・光学式（PAW3311 / 12,000DPI）・8ボタン・2.4GHz / 有線USB",
    price: 3155,
    rating: 3.6,
    reviews: 200,
    image: "https://m.media-amazon.com/images/I/51d0FmoGVLL._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー) / 有線 USB",
    mouseSpreadsheetButtonCount: "8ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B0BB5S6DYD",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "75 g" },
      { label: "最大DPI", value: "12,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "75 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "PixArt PAW3311（光学式）" },
          { label: "最大 DPI", value: "12,000" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "8ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー) / 有線 USB" },
          { label: "電源", value: "充電式" }],
      }],
  },
  {
    id: "m-asus-tuf-m3-gen2",
    category: "mouse",
    name: "ASUS TUF Gaming M3 Gen II",
    brand: "ASUS",
    tagline: "ASUS ゲーミングマウス TUF Gaming M3 Gen II (59g / P56防塵・防水/ASUS抗菌ガード / 8000dpi / 有線 / 6000万回クリック / PTFEマウスソール / 6つのプログラム可能ボタン / 国内正規品)",
    price: 3336,
    rating: 4.2,
    reviews: 113,
    image: "https://m.media-amazon.com/images/I/815fm88gq2L._AC_SL1500_.jpg",
    connection: "有線 USB",
    mouseSpreadsheetButtonCount: "6ボタン",
    mouseSpreadsheetUsageSpecs: ["gaming", "side-button"],
    purchaseUrl: "https://www.amazon.co.jp/dp/B0BY1R8DSZ",
        mouseUsage: "gaming",
    mouseFilterTags: ["reading-optical", "side-buttons"],
    highlights: [
      { label: "重量", value: "59 g" },
      { label: "最大DPI", value: "8,000 DPI" },
      { label: "読み取り方式", value: "光学式" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [{ label: "重量", value: "59 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "光学式（オプティカル）" },
          { label: "最大 DPI", value: "8,000" },
          { label: "読み取り方式", value: "光学式" },
          { label: "ボタン数", value: "6ボタン" },
          { label: "サイドボタン", value: "あり" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "有線 USB" },
          { label: "電源", value: "有線給電" }],
      }],
  },
  {
    id: "m-logicool-m185",
    category: "mouse",
    name: "M185",
    brand: "LOGICOOL",
    tagline: "【Amazon.co.jp限定】 ロジクール ワイヤレスマウス 無線 マウス M185CG M185 グレー 国内正規品",
    price: 849,
    rating: 4.2,
    reviews: 21529,
    image: "https://m.media-amazon.com/images/I/41gi5BVUmDS._AC_SL1500_.jpg",
    connection: "2.4GHz (USBレシーバー)",

    purchaseUrl: "https://www.amazon.co.jp/dp/B0956X785M",
    mouseUsage: "productivity",
    mouseFilterTags: ["reading-optical"],
    mouseSpreadsheetUsageSpecs: [],
    highlights: [
      { label: "重量", value: "75 g" },
      { label: "最大DPI", value: "1,000 DPI" },
      { label: "読み取り方式", value: "オプティカル" },
      { label: "ポーリングレート", value: "—" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "幅", value: "99 mm" },
          { label: "奥行き", value: "60 mm" },
          { label: "高さ", value: "39 mm" },
          { label: "重量", value: "75 g" }],
      },
      {
        title: "センサー / 入力",
        rows: [
          { label: "センサー", value: "オプティカル（オプティカルトラッキング）" },
          { label: "最大 DPI", value: "1,000" },
          { label: "ポーリングレート", value: "—" },
          { label: "ボタン数", value: "3ボタン" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "2.4GHz (USBレシーバー)" },
          { label: "電源", value: "単3形 乾電池（付属）" },
          { label: "電池持続", value: "最大 12 ヶ月" },
          { label: "操作距離", value: "最大 10 m" }],
      }],
  },
  ...mouseBestsellers.filter(
    (g) =>
      !mouseNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mousePopularBrands.filter(
    (g) =>
      !mouseBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseNewReleases.filter(
    (g) =>
      !mouseNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseNewReleasesPage2.filter(
    (g) =>
      !mouseGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseGamingBestsellers.filter(
    (g) =>
      !mouseGamingNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGamingNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseGamingNewReleases.filter(
    (g) =>
      !mouseGamingNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseGamingNewReleasesPage2.filter(
    (g) =>
      !mouseGProSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseGProSearch.filter(
    (g) => !mouseGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...mouseGproPage3,
  ...mouseHyperxPulsefireHaste,
  {
    id: "k-keychron-q1-pro",
    category: "keyboard",
    name: "Keychron Q1 Pro",
    brand: "Keychron",
    tagline: "【国内正規品】Keychron Q1 Pro カスタムメカニカルキーボード カーボンブラック US配列 有線/Bluetooth無線 茶軸",
    price: 39930,
    listPrice: 42900,
    rating: 0,
    reviews: 0,
    image: "https://m.media-amazon.com/images/I/61w9DLlSmxL._AC_SL1500_.jpg",
    connection: "有線 USB",
    purchaseUrl: "https://www.amazon.co.jp/dp/B0C2125FZK",
    keyboardUsage: "gaming",
    keyboardFilterTags: [
      "tenkeyless",
      "kb-structure-double-gasket",
      "kb-keycap-pbt-double"],
    highlights: [
      { label: "レイアウト", value: "75% (81キー US ANSI)" },
      { label: "内部構造", value: "ダブルガスケット" },
      { label: "キーキャップ", value: "PBT" },
      { label: "電源", value: "充電式（内蔵バッテリー）" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "幅", value: "145 mm" },
          { label: "奥行き", value: "327.5 mm" },
          { label: "高さ", value: "35.8 mm" },
          { label: "重量", value: "1,736 g" }],
      },
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: "75% (81キー US ANSI)" },
          { label: "内部構造", value: "ダブルガスケット" },
          { label: "マウント", value: "ダブルガスケット" },
          { label: "スイッチ", value: "Gateron K Pro (交換可)" },
          { label: "キーキャップ", value: "PBT" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方式", value: "XLR" },
          { label: "ポーリングレート", value: "1,000 Hz (有線)" },
          { label: "電源", value: "充電式（内蔵バッテリー）" },
          { label: "ファームウェア", value: "QMK / VIA" }],
      }],
  },
  {
    id: "k-mx-keys-mini",
    category: "keyboard",
    name: "MX Keys Mini",
    brand: "Logicool",
    tagline: "ロジクール MX KEYS mini KX700GR ミニマリスト ワイヤレス イルミネイテッド キーボード グラファイト 充電式 bluetooth Logi Bolt Unifying非対応 USB-C-A 日本語配列 windows mac chrome ios Android 無線 KX700 国内正規品",
    price: 17152,
    rating: 4.5,
    reviews: 1692,
    image: "https://m.media-amazon.com/images/I/71lv30kG5PL._AC_SL1500_.jpg",
    connection: "2.4GHz (Logi Bolt) / Bluetooth",
    purchaseUrl: "https://www.amazon.co.jp/dp/B09HQCW3P8",
    keyboardUsage: "productivity",
    keyboardLayoutArray: "JIS日本語配列",
    keyboardSpreadsheetFeatures: [],
    keyboardFilterTags: [
      "tenkeyless",
      "kb-structure-scissor",
      "kb-keycap-spherical"],
    highlights: [
      { label: "レイアウト", value: "75%" },
      { label: "内部構造", value: "パンタグラフ" },
      { label: "キーキャップ", value: "ABS" },
      { label: "配列", value: "JIS日本語配列" }],
    compat: [],
    specGroups: [
      { title: "仕様 / 機能", rows: [
          { label: "配列", value: "JIS日本語配列" }]},
      {
        title: "サイズ / 重量",
        rows: [
          { label: "幅", value: "296 mm" },
          { label: "奥行き", value: "132 mm" },
          { label: "高さ", value: "20.5 mm" },
          { label: "重量", value: "506 g" }],
      },
      {
        title: "キー / スイッチ",
        rows: [
          { label: "レイアウト", value: "75%" },
          { label: "内部構造", value: "パンタグラフ" },
          { label: "キーキャップ", value: "ABS" },
          { label: "バックライト", value: "近接/照度センサー連動" }],
      },
      {
        title: "接続 / 電源",
        rows: [
          { label: "接続方法", value: "2.4GHz (Logi Bolt) / Bluetooth" },
          { label: "ポーリングレート", value: "—" },
          { label: "充電端子", value: "USB-C" },
          { label: "バッテリー", value: "10日 (BL ON) / 5ヶ月 (BL OFF)" }],
      }],
  },
  ...keyboardBestsellers.filter(
    (g) =>
      !keyboardBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardTabletBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardBestsellersPage2.filter(
    (g) =>
      !keyboardTabletBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardTabletBestsellers.filter(
    (g) =>
      !keyboardGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardGamingBestsellers.filter(
    (g) =>
      !keyboardGamingBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardGamingBestsellersPage2.filter(
    (g) =>
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardGamingMostGifted.filter(
    (g) => !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardGamingMostGiftedPage2.filter(
    (g) => g.purchaseUrl !== "https://www.amazon.co.jp/dp/B0FGCDSH1J",
  ),
  ...keyboardGamingNewReleasesPage1.filter(
    (g) =>
      !keyboardBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardTabletBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardGamingNewReleasesPage2.filter(
    (g) =>
      !keyboardBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardTabletBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGamingNewReleasesPage1.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !keyboardGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardNewReleases.filter(
    (g) => !keyboardNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardNewReleasesPage2.filter(
    (g) => !keyboardGproPage3.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...keyboardGproPage3,
  ...keyboardElecomVk720a,
  ...keyboardLogicoolG515Rapid,
  ...keyboardRealforceGx1plus,
  ...keyboardHyperxAlloyCoreRgb,
  {
    id: "mic-blue-yeti",
    category: "mic",
    name: "Blue Yeti",
    brand: "Logicool G",
    tagline: "ゲーミングマイク BM400BK USB コンデンサーマイク ゲーミング 実況 ストリーミング 配信 マイク ブラックアウト ブラック 黒 PC Mac",
    price: 18480,
    listPrice: 22418,
    rating: 4.4,
    reviews: 1411,
    image: "https://m.media-amazon.com/images/I/61G00A6mxTL._AC_SL1500_.jpg",
    connection: "USB Type-A",
    purchaseUrl: "https://www.amazon.co.jp/dp/B0822PMBTZ",
    micFilterTags: ["stand", "condenser"],
                                                    micUseTags: [],







                                                        micFeatureTags: [],
    micSpreadsheetJTags: [],
    micSpreadsheetKTags: [],







    highlights: [
      { label: "指向性", value: "指向性切替対応 (マルチパターン)" },
      { label: "周波数特性", value: "20Hz-20kHz" },
      { label: "接続方式", value: "USB Type-A" },
      { label: "サンプルレート", value: "48 kHz" },
      { label: "タイプ", value: "コンデンサー" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "幅", value: "120 mm" },
          { label: "奥行き", value: "125 mm" },
          { label: "高さ", value: "295 mm (スタンド展開時)" },
          { label: "重量", value: "550 g (マイク本体)" }],
      },
      {
        title: "オーディオ",
        rows: [
          { label: "指向性", value: "指向性切替対応 (マルチパターン)" },
          { label: "タイプ", value: "コンデンサー" },
          { label: "サンプルレート", value: "48 kHz" },
          { label: "周波数特性", value: "20Hz-20kHz" },
          { label: "最大SPL", value: "120 dB" }],
      },
      {
        title: "接続 / マウント",
        rows: [
          { label: "接続方式", value: "USB Type-A" },
          { label: "ネジ穴", value: "3/8インチ (5/8\" 変換付属)" },
          { label: "ヘッドホン端子", value: "3.5 mm" }],
      }],
  },
  {
    id: "mic-shure-sm7b",
    category: "mic",
    name: "SM7B",
    brand: "Shure",
    tagline: "ダイナミックマイク カーディオイド 単一指向性 XLR 有線 ノイズ除去 配信 ストリーミング 音声 音楽 演奏 録音 レコーディング YouTube 実況 ゲーミング ボーカル ポッドキャスト DTM 宅録【国内正規品/メーカー保証2年】",
    price: 58800,
    rating: 4.6,
    reviews: 11913,
    image: "https://m.media-amazon.com/images/I/71ZrCVTIZ-L._AC_SL1351_.jpg",
    connection: "XLR",
    purchaseUrl: "https://www.amazon.co.jp/dp/B0002E4Z8M",
    micFilterTags: ["dynamic"],
                                                    micUseTags: ["ゲーム実況・配信・ラジオ録音", "歌・楽器の録音（DTM）"],







                                                        micFeatureTags: ["ゲインノブ（音量調節ノブ）"],
    micSpreadsheetJTags: [],
    micSpreadsheetKTags: [],







    highlights: [
      { label: "指向性", value: "単一指向性" },
      { label: "周波数特性", value: "50Hz-20kHz" },
      { label: "接続方式", value: "XLR" },
      { label: "サンプルレート", value: "—" },
      { label: "タイプ", value: "ダイナミック" }],
    compat: [],
    specGroups: [
      {
        title: "サイズ / 重量",
        rows: [
          { label: "長さ", value: "189.7 mm" },
          { label: "高さ", value: "148 mm" },
          { label: "幅", value: "96 mm" },
          { label: "重量", value: "765 g" }],
      },
      {
        title: "オーディオ",
        rows: [
          { label: "指向性", value: "単一指向性" },
          { label: "タイプ", value: "ダイナミック" },
          { label: "サンプルレート", value: "—" },
          { label: "周波数特性", value: "50Hz-20kHz" },
          { label: "推奨ゲイン", value: "60 dB 以上のプリアンプ" }],
      },
      {
        title: "接続 / マウント",
        rows: [
          { label: "接続方式", value: "XLR" },
          { label: "ネジ穴", value: "5/8インチ" },
          { label: "付属品", value: "ウインドスクリーン / スイッチカバー" }],
      }],
  },
  {
    id: "mon-dell-s2722qc",
    category: "monitor",
    name: "S2722QC",
    brand: "Dell",
    tagline: "27インチ4K・USB-C 65W給電対応のクリエイター向けIPSモニター",
    price: 42800,
    listPrice: 49800,
    rating: 4.4,
    reviews: 2994,
    image: "https://m.media-amazon.com/images/I/71a9hbfk12L._AC_SL1500_.jpg",
    connection: "USB Type-C / HDMI x2",
    purchaseUrl: "https://www.amazon.co.jp/dp/B09CGY99X5",
    vesaStandard: "100×100 mm",
    monitorFilterTags: ["size-27","res-4k","refresh-60","port-hdmi","port-usb-c","port-usb-c-pd","vesa-100","panel-ips-matte"],
    highlights: [
      { label: "画面サイズ", value: "27\"" },
      { label: "解像度", value: "4K UHD" },
      { label: "リフレッシュ", value: "60Hz" },
      { label: "重量", value: "4.7 kg" }],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: "27 インチ (16:9)" },
          { label: "解像度", value: "3840 x 2160 (4K UHD)" },
          { label: "パネル", value: "IPS非光沢" },
          { label: "リフレッシュレート", value: "60Hz" },
          { label: "応答速度", value: "4 ms (GtG)" },
          { label: "色域", value: "sRGB 99%" },
          { label: "輝度", value: "350 cd/m²" }],
      },
      {
        title: "接続端子",
        rows: [
          { label: "USB Type-C", value: "x1 (映像/データ/65W PD)" },
          { label: "HDMI", value: "2.0 x2" },
          { label: "USB-A", value: "3.2 Gen1 x2 (ハブ)" },
          { label: "音声", value: "ラインアウト x1" }],
      },
      {
        title: "その他",
        rows: [
          { label: "高さ調整", value: "110 mm" },
          { label: "回転 / ピボット", value: "±90°" },
          { label: "VESA", value: "100 x 100 mm" },
          { label: "スピーカー", value: "3W x2 内蔵" },
          { label: "重量", value: "4.7 kg" }],
      },
      { title: "本体", rows: [
          { label: "寸法", value: "61.2 × 51 × 17.5 cm" },
          { label: "重量", value: "4.7 kg" }]}],
  },
  {
    id: "mon-lg-24gn65r",
    category: "monitor",
    name: "UltraGear 24GN65R-B",
    brand: "LG",
    tagline: "【Amazon.co.jp 限定】LG ゲーミングモニター UltraGear 24GN65R-B 23.8インチ/ フルHD/IPS/ 144Hz/ 1ms(GTG)/ HDR/AMD FreeSync Premium/高さ調整、ピボット対応/HDMI、DisplayPort/ 3年安心・無輝点保証",
    price: 24800,
    listPrice: 32800,
    rating: 4.3,
    reviews: 96,
    image: "https://m.media-amazon.com/images/I/71YssgB-MTL._AC_SL1500_.jpg",
    connection: "HDMI: x1 / DisplayPort: x1",
    purchaseUrl: "https://www.amazon.co.jp/dp/B0BHY4HKJ9",
    vesaStandard: "100×100 mm",
    monitorFilterTags: ["size-238","res-fhd","refresh-144-plus","port-hdmi","port-dp","vesa-100","panel-ips-matte"],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "23.8\"" },
      { label: "解像度", value: "FHD (1920×1080)" },
      { label: "リフレッシュ", value: "144Hz" },
      { label: "重量", value: "5.6 kg" }],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: "23.8\"" },
          { label: "解像度", value: "FHD (1920×1080)" },
          { label: "パネル", value: "IPS 非光沢" },
          { label: "リフレッシュレート", value: "144Hz" },
          { label: "応答速度", value: "1 ms (GtG)" },
          { label: "輝度", value: "300 cd/m²" }],
      },
      {
        title: "接続端子",
        rows: [
          { label: "HDMI", value: "x1" },
          { label: "DisplayPort", value: "x1" },
          { label: "ヘッドホン", value: "3.5 mm x1" }],
      },
      {
        title: "その他",
        rows: [
          { label: "高さ調整", value: "対応" },
          { label: "ピボット", value: "対応" },
          { label: "保証", value: "3年安心・無輝点保証" },
          { label: "VESA", value: "100 x 100 mm" },
          { label: "重量", value: "5.6 kg" }],
      },
      { title: "本体", rows: [
          { label: "寸法", value: "54.1 × 44.1 × 29.1 cm" },
          { label: "重量", value: "5.6 kg" }]}],
  },
  {
    id: "mon-asus-pa279cv-j",
    category: "monitor",
    name: "ProArt PA279CV-J",
    brand: "ASUS",
    tagline: "ASUS 4K モニター ProArt PA279CV-J 27インチ(無輝点交換保証 HDR IPS Type-C 65W PD Display Port HDMIx2 高さ調整 縦横回転 SRGB100% Rec.709 Calman Verified ProArt パレット搭載)",
    price: 56480,
    rating: 4.4,
    reviews: 481,
    image: "https://m.media-amazon.com/images/I/61X52-6tsOL._AC_SL1500_.jpg",
    connection: "65W PD)",
    purchaseUrl: "https://www.amazon.co.jp/dp/B093VZKJQF",
    vesaStandard: "100×100 mm",
    monitorFilterTags: ["size-27","res-4k","refresh-60","port-hdmi","port-dp","port-usb-c","port-usb-c-pd","vesa-100","panel-ips-matte"],
    monitorSpreadsheetLTags: [],
    highlights: [
      { label: "画面サイズ", value: "27\"" },
      { label: "解像度", value: "4K (3840×2160)" },
      { label: "リフレッシュ", value: "60Hz" },
      { label: "重量", value: "8.6 kg" }],
    compat: [],
    specGroups: [
      {
        title: "ディスプレイ",
        rows: [
          { label: "画面サイズ", value: "27\"" },
          { label: "解像度", value: "4K (3840×2160)" },
          { label: "パネル", value: "IPS 非光沢" },
          { label: "リフレッシュレート", value: "60Hz" },
          { label: "色域", value: "100% sRGB / 100% Rec.709" },
          { label: "輝度", value: "350 cd/m² (HDR 400)" },
          { label: "ΔE", value: "< 2 (Calman 認証)" }],
      },
      {
        title: "接続端子",
        rows: [
          { label: "USB Type-C", value: "x1 (DP Alt" },
          { label: "DisplayPort", value: "1.2 x1" },
          { label: "HDMI", value: "2.0 x2" },
          { label: "USB-A", value: "3.1 x4 (ハブ)" }],
      },
      {
        title: "その他",
        rows: [
          { label: "高さ調整", value: "150 mm" },
          { label: "ピボット", value: "±90°" },
          { label: "保証", value: "3年 (無輝点交換保証)" },
          { label: "VESA", value: "100 x 100 mm" },
          { label: "重量", value: "8.6 kg" }],
      },
      { title: "本体", rows: [
          { label: "寸法", value: "61.4 × 52.4 × 22.8 cm" },
          { label: "重量", value: "8.6 kg" }]}],
  },
  ...micBestsellers.filter(
    (g) =>
      !micBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micBestsellersPage2.filter(
    (g) =>
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micMostGifted.filter(
    (g) =>
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micMostGiftedPage2.filter(
    (g) =>
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micComputersSearch.filter(
    (g) => !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micComputersSearchStreaming,
  ...micCondenserBestsellers.filter(
    (g) =>
      !micBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micCondenserBestsellersPage2.filter(
    (g) =>
      !micBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micDynamicBestsellers.filter(
    (g) =>
      !micBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micDynamicNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micDynamicBestsellersPage2.filter(
    (g) =>
      !micBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micDynamicBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micDynamicNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...micDynamicNewReleases,
  ...micHeadsetNewReleases.filter(
    (g) =>
      !micBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micMostGiftedPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micComputersSearchStreaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micCondenserBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micDynamicBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micDynamicBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !micDynamicNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorBestsellers.filter(
    (g) =>
      !monitorLenovoSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26Plus.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26PlusPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch1822.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorBestsellersPage2.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26Plus.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26PlusPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch1822.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorPremiumGaming.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorNewReleases.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorNewReleasesPage2.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorMostGifted.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorSearch22120.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorLgDisplayBestsellers.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorSearch22120.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorAsusSearch.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorSearch22120.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLgDisplayBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorDellSearch.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorSearch22120.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLgDisplayBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAsusSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorPhilipsSearch.filter(
    (g) =>
      !monitorBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorBestsellersPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorPremiumGaming.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorNewReleasesPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorMostGifted.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorSearch22120.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLgDisplayBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAsusSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorDellSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26Plus.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26PlusPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch1822.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorLenovoSearch.filter(
    (g) =>
      !monitorLenovoSearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26Plus.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26PlusPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch1822.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorLenovoSearchPage2.filter(
    (g) =>
      !monitorLenovoSearch26Plus.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch26PlusPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch1822.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorLenovoSearch26Plus.filter(
    (g) =>
      !monitorLenovoSearch26PlusPage2.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorLenovoSearch1822.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorAcerSearch.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144Search.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorLenovoSearch26PlusPage2,
  ...monitorLenovoSearch1822,
  ...monitorAcerSearch,
  ...monitorRefresh144Search.filter(
    (g) => !monitorRefresh144SearchPage2.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorRefresh144SearchPage2,
  ...cameraBestsellers,
  ...cameraStreamingSearch.filter(
    (g) => !cameraBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorArmBestsellers,
  ...monitorArmNewReleases.filter(
    (g) => !monitorArmBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...monitorArmNewReleasesPage2.filter(
    (g) =>
      !monitorArmBestsellers.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !monitorArmNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...gamingChairAkracingStore,
  ...gamingChairs.filter(
    (g) => !gamingChairAkracingStore.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...gamingChairNewReleases.filter(
    (g) =>
      !gamingChairAkracingStore.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairs.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...gamingChairSearch.filter(
    (g) =>
      !gamingChairAkracingStore.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairs.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairNewReleases.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairSearchPage3.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairSearchPage4.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...gamingChairSearchPage3.filter(
    (g) =>
      !gamingChairAkracingStore.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairs.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairSearchPage4.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...gamingChairSearchPage4.filter(
    (g) =>
      !gamingChairAkracingStore.some((b) => b.purchaseUrl === g.purchaseUrl) &&
      !gamingChairs.some((b) => b.purchaseUrl === g.purchaseUrl),
  ),
  ...audioInterfaceBestsellers,
  ...monitorIodataExGdq271uel,
  ...monitorIodataExGd251uh,
  ...monitorDellS2725qc,
]

/** レビュー件数がこの値以上で「人気」バッジを表示 */
export const POPULAR_REVIEW_THRESHOLD = 1000

/** 表示用バッジ（レビュー1,000件以上で「人気」のみ） */
export function getDisplayBadge(gadget: Gadget): "人気" | undefined {
  if (gadget.reviews >= POPULAR_REVIEW_THRESHOLD) return "人気"
  return undefined
}

export function formatPrice(price: number) {
  return `￥${price.toLocaleString("ja-JP")}`
}

/** 価格が一覧・詳細に表示可能か（未取得・プレースホルダーは false） */
export function hasDisplayPrice(gadget: Gadget): boolean {
  const p = gadget.listPrice ?? gadget.price
  return p != null && p > 0
}

/** レビュー件数が1件以上あるか（0件の場合は星評価を非表示） */
export function hasDisplayReviews(gadget: Gadget): boolean {
  if (gadget.category === "gaming-chair") {
    const row = getGamingChairCsvRow(gadget.id)
    if (row?.reviewCount != null && row.reviewCount > 0) return true
  }
  return Number.isFinite(gadget.reviews) && gadget.reviews > 0
}

/** 一覧・詳細の星評価（gaming_chairs.csv L列） */
export function getDisplayRating(gadget: Gadget): number {
  if (gadget.category === "gaming-chair" && hasDisplayReviews(gadget)) {
    const row = getGamingChairCsvRow(gadget.id)
    if (row?.rating != null && Number.isFinite(row.rating)) return row.rating
  }
  return gadget.rating
}

/** 一覧・詳細のレビュー件数（gaming_chairs.csv M列） */
export function getDisplayReviewCount(gadget: Gadget): number {
  if (gadget.category === "gaming-chair") {
    const row = getGamingChairCsvRow(gadget.id)
    if (row?.reviewCount != null && Number.isFinite(row.reviewCount)) {
      return row.reviewCount
    }
  }
  return gadget.reviews
}

/** カード・詳細のレビュー表示ラベル（0件は「レビューなし」） */
export function getReviewDisplayLabel(gadget: Gadget): string {
  if (!hasDisplayReviews(gadget)) return "レビューなし"
  return `${getDisplayReviewCount(gadget).toLocaleString("ja-JP")}件のレビュー`
}

/** ソート用の実効評価（0件レビューは 0 点として最下位扱い） */
export function getEffectiveRating(gadget: Gadget): number {
  return hasDisplayReviews(gadget) ? getDisplayRating(gadget) : 0
}

/** 表示用の定価（listPrice がなければ price。未取得時は null） */
export function getDisplayPrice(gadget: Gadget): number | null {
  const p = gadget.listPrice ?? gadget.price
  return p != null && p > 0 ? p : null
}

/** 一覧カードに表示する価格（CSV 反映後・listPrice 優先）。絞り込み・ソートもこの値 */
export function getCardDisplayPrice(gadget: Gadget): number | null {
  return getDisplayPrice(withGamingChairCsvOverlay(gadget))
}

export function hasCardDisplayPrice(gadget: Gadget): boolean {
  const p = getCardDisplayPrice(gadget)
  return p != null && p > 0
}

/** @deprecated {@link getCardDisplayPrice} を使用 */
export function getEffectiveFilterPrice(gadget: Gadget): number | null {
  return getCardDisplayPrice(gadget)
}

/** 一覧カード・詳細用の接続表示（PCとの通信方式。充電端子は含めない） */
export function getCardConnectionDisplay(connection?: string, gadget?: Gadget): string {
  if (!connection || connection === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC
  const trimmed = connection.replace(/\s+/g, " ").trim()
  if (gadget) return getGadgetConnectionDisplay(gadget)
  return trimmed
}

export { getGadgetConnectionDisplay, normalizeUsbConnectionDisplay } from "./usb-connection-display"

/** カード・詳細モーダルに接続欄を表示するか */
export function showsGadgetConnection(gadget: Gadget): boolean {
  if (gadget.category === "gaming-chair" || gadget.category === "audio-interface") return false
  const display = getGadgetConnectionDisplay(gadget)
  return display !== UNSPECIFIED_SPEC
}

function gadgetPowerHaystack(gadget: Gadget) {
  return [
    gadget.tagline,
    gadget.connection ?? "",
    ...gadget.compat.map((c) => c.label),
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value]))].join(" ")
}

/** 乾電池式（単3/単4等）かどうか */
export function usesDisposableBattery(gadget: Gadget): boolean {
  return /単[1234]形|単[一二三四]|単三|単四|\bAA\b|\bAAA\b|乾電池|アルカリ電池/i.test(
    gadgetPowerHaystack(gadget),
  )
}

/** 重量表示を g 単位に統一（kg → g 換算） */
export function formatWeightDisplay(value: string): string {
  if (!value || value === UNSPECIFIED_SPEC) return value
  return value.replace(/(約\s*)?([\d.]+)\s*kg\b/gi, (_, prefix = "", numStr) => {
    const num = Number(numStr.replace(/,/g, ""))
    if (!Number.isFinite(num) || num <= 0) return `${prefix}${numStr} kg`
    const grams = Math.round(num * 1000)
    const formatted = grams >= 1000 ? grams.toLocaleString("ja-JP") : String(grams)
    return `${prefix}${formatted} g`
  })
}

/** 詳細モーダルの行ラベル → カード2×2と同じ表示値（未設定なら null） */
export function getCardAlignedSpecDisplay(gadget: Gadget, label: string): string | null {
  const cardLabelAliases: Record<string, string> = {
    VESA規格: "VESA",
    "壁掛け対応（VESA規格）": "VESA",
    壁掛け対応: "VESA",
    感度: "感度",
    最大DPI: "感度",
    "最大 DPI": "感度",
    マウス最大感度: "感度",
    パネル: "パネル種類",
    タイプ: "マイクタイプ",
    端子: "接続方式",
    サンプルレート: "サンプリングレート",
    入力端子: "入力端子と数",
    PC接続: "接続方式",
    形状: "形状/構造",
    [GAMING_CHAIR_DIMENSION_CARD_LABEL]: GAMING_CHAIR_DIMENSION_CARD_LABEL,
    寸法: GAMING_CHAIR_DIMENSION_CARD_LABEL,
    "寸法/重量": GAMING_CHAIR_DIMENSION_CARD_LABEL,
    [GAMING_CHAIR_FRAME_CARD_LABEL]: GAMING_CHAIR_FRAME_CARD_LABEL,
    "アームレスト/保証": GAMING_CHAIR_FRAME_CARD_LABEL,
    フレームの種類: GAMING_CHAIR_FRAME_CARD_LABEL,
  }

  const cardLabels = getCardHighlights(gadget)
  const cardLabel = cardLabelAliases[label] ?? label
  const fromCard = cardLabels.find((h) => h.label === cardLabel)
  if (fromCard && isCardSpecValueFilled(fromCard.value)) return fromCard.value

  if (gadget.category === "mouse") {
    if (label === "感度" || label === "最大DPI" || label === "最大 DPI" || label === "マウス最大感度") {
      const sensitivity = getMouseSensitivityDisplay(gadget)
      if (isCardSpecValueFilled(sensitivity)) return sensitivity
    }
    if (label === "センサー") {
      const reading = getMouseReadingMethod(gadget)
      if (reading && isCardSpecValueFilled(reading)) return reading
    }
    if (label === "ボタン数") {
      const buttons = getMouseButtonCountDisplay(gadget)
      if (isCardSpecValueFilled(buttons)) return buttons
    }
    if (label === "読み取り方式") {
      const reading = getMouseReadingMethod(gadget)
      if (reading && isCardSpecValueFilled(reading)) return reading
    }
    if (label === "電源") {
      const power = getMouseCardPowerDisplay(gadget)
      if (isCardSpecValueFilled(power)) return power
    }
  }

  if (gadget.category === "keyboard") {
    if (label === "レイアウト") {
      const v = getKeyboardLayout(gadget)
      if (isCardSpecValueFilled(v)) return v
    }
    if (label === "内部構造") {
      const v = getKeyboardInternalStructureRaw(gadget)
      if (isCardSpecValueFilled(v)) return v
    }
    if (label === "配列") {
      const v = getKeyboardLayoutArray(gadget)
      if (isCardSpecValueFilled(v)) return v
    }
    if (label === "キーキャップ") {
      const v = getKeyboardKeycaps(gadget)
      if (isCardSpecValueFilled(v)) return v
    }
  }

  if (gadget.category === "mic" && /周波数/i.test(label)) {
    const freq = cardLabels.find((h) => h.label === "周波数特性")
    if (freq && isCardSpecValueFilled(freq.value)) return freq.value
  }

  if (gadget.category === "monitor") {
    if (label === "解像度") {
      const resolution = getMonitorResolutionDisplay(gadget)
      if (isCardSpecValueFilled(resolution)) return formatMonitorResolutionRaw(resolution)
    }
    if (label === "重量") {
      for (const group of gadget.specGroups) {
        const row = group.rows.find((r) => r.label === "重量")
        if (row?.value && isCardSpecValueFilled(row.value)) return row.value
      }
      const fromHighlight = gadget.highlights.find((h) => h.label === "重量")?.value
      if (fromHighlight && isCardSpecValueFilled(fromHighlight)) return fromHighlight
    }
    if (label === "画面サイズ") {
      const size = gadget.highlights.find((h) => h.label === "画面サイズ")?.value
      if (size && isCardSpecValueFilled(size)) return size
    }
    if (label === "リフレッシュレート" || label === "リフレッシュ") {
      const refresh =
        gadget.highlights.find((h) => /リフレッシュ/i.test(h.label))?.value ?? UNSPECIFIED_SPEC
      const normalized = normalizeMonitorRefreshDisplay(refresh)
      if (isCardSpecValueFilled(normalized)) return normalized
    }
    if (label === "パネル" || label === "パネル種類") {
      const panel = getMonitorPanelDisplay(gadget)
      if (isCardSpecValueFilled(panel)) return panel
    }
  }

  if (gadget.category === "audio-interface") {
    const aiLabels = ["入力端子と数", "サンプリングレート", "ファンタム電源", "システム要件"] as const
    if (aiLabels.includes(label as (typeof aiLabels)[number])) {
      const v = getAudioInterfaceCardSpec(gadget, label as (typeof aiLabels)[number])
      if (isCardSpecValueFilled(v)) return v
    }
  }

  if (
    gadget.category !== "audio-interface" &&
    (label === "接続" || label === "接続方式" || label === "接続方法" || label === "端子")
  ) {
    const display = getGadgetConnectionDisplay(gadget)
    if (isCardSpecValueFilled(display)) return display
  }

  return null
}

function formatSpecRowDisplayValueInner(
  gadget: Gadget,
  label: string,
  value: string,
  aligned: string | null,
): string {
  if (aligned !== null) {
    if (label === "電源") return aligned
    if (label === "重量" && gadget.category !== "monitor") return formatWeightDisplay(aligned)
    if (label === "PC接続" && gadget.category === "audio-interface") {
      return formatAudioInterfacePcConnectionDisplay(gadget, aligned)
    }
    if (label === "接続方式" || label === "接続方法" || label === "接続" || label === "PC接続") {
      return normalizeUsbConnectionDisplay(aligned, gadget)
    }
    return aligned
  }

  const sanitized = sanitizeSpecDisplayValue(value, label, gadget)
  if (label === "電源") return getGadgetPowerDisplay(gadget)
  if (label === "重量") {
    if (gadget.category === "monitor") {
      if (/\bkg\b/i.test(sanitized)) return sanitized
      const gMatch = sanitized.match(/(約\s*)?([\d]+)\s*g\b/i)
      if (gMatch) {
        const grams = Number(gMatch[2].replace(/,/g, ""))
        if (Number.isFinite(grams) && grams > 0) {
          const kg = grams / 1000
          const formatted = Number.isInteger(kg) ? String(kg) : kg.toFixed(1)
          return `${gMatch[1] ?? ""}${formatted} kg`
        }
      }
      return sanitized
    }
    return formatWeightDisplay(sanitized)
  }
  if (gadget.category === "monitor" && label === "解像度") {
    return formatMonitorResolutionRaw(sanitized)
  }
  if (label === GAMING_CHAIR_FRAME_CARD_LABEL || label === "フレームの種類") {
    return formatFrameMaterialDisplay(sanitized.replace(/^フレーム:\s*/, ""))
  }
  if (label === "PC接続" && gadget.category === "audio-interface") {
    return formatAudioInterfacePcConnectionDisplay(gadget, sanitized)
  }
  if (label === "接続方式" || label === "接続" || label === "PC接続") {
    return normalizeUsbConnectionDisplay(sanitized, gadget)
  }
  return normalizeSpecDisplayByLabel(sanitized, label, gadget.category)
}

/** スペック行の表示値（一覧カード2×2と同一ソース） */
export function formatSpecRowDisplayValue(
  gadget: Gadget,
  label: string,
  value: string,
): string {
  return formatSpecRowDisplayValueInner(gadget, label, value, getCardAlignedSpecDisplay(gadget, label))
}

/** 詳細モーダル用：省略せず spec 行・フィールドの全文を優先 */
export function formatDetailSpecRowDisplayValue(
  gadget: Gadget,
  label: string,
  value: string,
): string {
  if (isCardSpecValueFilled(value)) {
    return formatSpecRowDisplayValueInner(gadget, label, value, null)
  }
  return formatSpecRowDisplayValueInner(
    gadget,
    label,
    value,
    getDetailAlignedSpecDisplay(gadget, label),
  )
}

function getDetailAlignedSpecDisplay(gadget: Gadget, label: string): string | null {
  if (gadget.category === "audio-interface") {
    const aiLabels = ["入力端子と数", "サンプリングレート", "ファンタム電源", "システム要件"] as const
    const aiLabel =
      label === "入力端子"
        ? "入力端子と数"
        : aiLabels.includes(label as (typeof aiLabels)[number])
          ? (label as (typeof aiLabels)[number])
          : null
    if (aiLabel) {
      const v = getAudioInterfaceDetailSpec(gadget, aiLabel)
      if (isCardSpecValueFilled(v)) return v
    }
  }

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === label)
    if (row?.value && isCardSpecValueFilled(row.value)) return row.value
  }

  const cardLabels = getCardHighlights(gadget)
  const fromCard = cardLabels.find((h) => h.label === label)
  if (fromCard && isCardSpecValueFilled(fromCard.value) && !/[…\.]{3}$/.test(fromCard.value.trim())) {
    return fromCard.value
  }

  return getCardAlignedSpecDisplay(gadget, label)
}

/** 接続 / 電源グループの「電源」表示を正規化 */
export function formatPowerSpecDisplay(gadget: Gadget, rawValue: string): string {
  return formatGadgetPowerDisplay(gadget, rawValue)
}

/** カード・詳細モーダル共通の「電源」表示 */
export { getGadgetPowerDisplay } from "./power-display"

/** 一覧カード用の電源表示（詳細モーダルと同一ソース + 表記揺れフォールバック） */
export function getMouseCardPowerDisplay(gadget: Gadget): string {
  if (gadget.category !== "mouse") return getGadgetPowerDisplay(gadget)

  const extended = gadget as Gadget & {
    powerSource?: string
    powerType?: string
    battery?: string
  }

  for (const candidate of [extended.powerSource, extended.powerType, extended.battery]) {
    if (isCardSpecValueFilled(candidate)) {
      const formatted = formatGadgetPowerDisplay(gadget, candidate!)
      if (isCardSpecValueFilled(formatted)) return formatted
    }
  }

  const fromHighlight = gadget.highlights.find((h) => h.label === "電源")?.value
  if (isCardSpecValueFilled(fromHighlight)) {
    const formatted = formatGadgetPowerDisplay(gadget, fromHighlight!)
    if (isCardSpecValueFilled(formatted)) return formatted
  }

  return getGadgetPowerDisplay(gadget)
}

export { getMouseButtonCountDisplay } from "./mouse-button-count"

export function isCardSpecValueFilled(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  const v = value.trim()
  return v !== UNSPECIFIED_SPEC && v !== "-"
}

export function isMouseCardSpecFilled(value: string | null | undefined): boolean {
  return isCardSpecValueFilled(value)
}

const MONITOR_CORE_SPEC_LABELS = [
  "画面サイズ",
  "解像度",
  "リフレッシュレート",
  "パネル種類"] as const

/** 一覧除外判定用：モニター主要4スペック（画面サイズ/解像度/リフレッシュ/パネル）の表示値 */
function getMonitorCoreSpecValues(gadget: Gadget): string[] {
  const screenSize =
    gadget.highlights.find((h) => h.label === "画面サイズ")?.value ?? UNSPECIFIED_SPEC
  const resolution = getMonitorResolutionDisplay(gadget)
  const refresh =
    gadget.highlights.find((h) => /リフレッシュ/i.test(h.label))?.value ?? UNSPECIFIED_SPEC
  const panel = getMonitorPanelDisplay(gadget)
  return [screenSize, resolution, refresh, panel]
}

/** モニター主要4スペックの入力済み数 */
export function countMonitorCoreSpecsFilled(gadget: Gadget): number {
  if (gadget.category !== "monitor") return MONITOR_CORE_SPEC_LABELS.length
  return getMonitorCoreSpecValues(gadget).filter(isCardSpecValueFilled).length
}

/** 一覧表示対象（モニターは主要4項目中2項目未満しか入力がない場合は除外） */
export function passesMonitorListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "monitor") return true
  return countMonitorCoreSpecsFilled(gadget) >= 2
}

/** 一覧カード4項目（重量・感度・電源・ボタン数）の入力済み数 */
export function countMouseCardSpecsFilled(gadget: Gadget): number {
  if (gadget.category !== "mouse") return 4

  return [
    gadget.highlights.find((h) => h.label === "重量")?.value,
    getMouseSensitivityDisplay(gadget),
    getMouseCardPowerDisplay(gadget),
    getMouseButtonCountDisplay(gadget),
  ].filter(isMouseCardSpecFilled).length
}

/** 一覧表示対象（マウスは4項目中2項目以上が入力済み） */
export function passesMouseListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "mouse") return true
  return countMouseCardSpecsFilled(gadget) >= 2
}

/** 中古・整備済み品のキーワード（name / tagline 判定） */
const USED_OR_REFURBISHED_PATTERNS: RegExp[] = [
  /整備済み品/,
  /整備済み/,
  /再生品/,
  /中古品/,
  /(?:^|\s)中古(?:\s|$|[\[\(])/,
  /\[Refurbished\]/i,
  /\bRefurbished\b/i,
  /\bUsed\b/i,
  /\(Renewed\)/i,
  /\bRenewed\b/i,
  /\bAmazon Renewed\b/i,
  /\bAmazon Warehouse\b/i]

/** 中古・整備済み品か（タイトル・説明または isUsed フラグ） */
export function isUsedOrRefurbishedProduct(gadget: Gadget): boolean {
  if (gadget.isUsed === true) return true
  const hay = `${gadget.name} ${gadget.tagline}`
  return USED_OR_REFURBISHED_PATTERNS.some((pattern) => pattern.test(hay))
}

/** 生産終了・中古品（一覧のデフォルト非表示対象） */
export function isHiddenFromDefaultListing(gadget: Gadget): boolean {
  return gadget.isDiscontinued === true || isUsedOrRefurbishedProduct(gadget)
}

/** 一覧表示対象か（includeHidden=false がデフォルト） */
export function passesListingVisibility(gadget: Gadget, includeHidden = false): boolean {
  if (includeHidden) return true
  return !isHiddenFromDefaultListing(gadget)
}

/** 一覧・カテゴリ件数用の表示対象ガジェット */
export function getListableGadgets(
  list: Gadget[],
  includeHidden = false,
): Gadget[] {
  return list.filter((g) => passesListingVisibility(g, includeHidden))
}

/** 一覧表示対象（キーボード本体のみ。アクセサリ・工具は除外） */
export function passesKeyboardListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "keyboard") return true
  return !isKeyboardAccessoryProduct(gadget)
}

/** 一覧表示対象（マイク本体のみ。ヘッドセット・周辺機器セット等は除外） */
export function passesMicListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "mic") return true
  return !isMicAccessoryProduct(gadget)
}

/** 一覧表示対象（`gaming_chairs.csv` 登録 ID のみ） */
export function passesGamingChairListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "gaming-chair") return true
  return isGamingChairListedInCsv(gadget)
}

/** ゴミ箱でリポジトリから除外した ID（件数・一覧から外す） */
export function passesRepositoryExcludedFilter(gadget: Gadget): boolean {
  return !isRepositoryExcludedGadgetId(gadget.id)
}

/** 一覧表示対象（オーディオIF本体のみ。マイク単体・ケーブル・セット等は除外） */
export function passesAudioInterfaceListFilter(gadget: Gadget): boolean {
  if (gadget.category !== "audio-interface") return true
  const hay = `${gadget.name} ${gadget.tagline} ${gadget.brand}`
  return !(
    /INMP441|I2S.*モジュール|PCM5102|DAC Decoder Module|Voice Player Board|USB Digital Interface DDC|Digital Bridge|DAC Cable Interface|ADA8200|Amplifier Board|Sound Card Kit|Distribution Starter Set|live sound card converter|サウンドカードコンバータ|Scarlett Solo Studio|Solo Studio 3rd Gen|Tourmate Hard Case|Hard Case Replacement|Mixer Case Only|Ultra Encode|HDMI.*Encoder|DMX Interface|SoundSwitch Micro|Stage Box|S32 Stage Box|Banana Plug|Inline Attachment Switch|A15AS|MIDIMATE eX|MONITOR1|AT2020.*Set|Top Handle|XLR-H1|Storage Case|ケースのみ|Vocal set and CONNECT|RAY and CONNECT|Video Switcher|Road Caster Video S|option card|X-DANTE|Karaoke Set|Gaming Chair|ゲーミングチェア|Guitar Interface Converter Tuner Audio Cable|Multi Effector GP-200|Cubilux CB5|usb audio capture sound card|USB Audio Converter for Mobile|Portable Built-in Recording Sound Card|Set Purchase|Streaming Equipment Set|Equipment Set.*Microphone|Semi-Hard Case Set|Soft Shell Case Set|G10 Live Distribution Set|All-in-One Podcast Set|Podcast Equipment Set|P17 Podcast|ポッドキャスト機材セット|with XLR Microphone|Large Capsule Microphone|Pop Blocker.*Arm Stand|Boom Arm Stand|Mic Cable XLR|Android Users Distributed/i.test(
      hay,
    )
  )
}

/** purchaseUrl または id で重複排除（同一商品の二重登録防止） */
function dedupeGadgetsByPurchaseUrl(list: Gadget[]): Gadget[] {
  const seen = new Set<string>()
  const out: Gadget[] = []
  for (const g of list) {
    const key = g.purchaseUrl?.trim() || g.id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(g)
  }
  return out
}

/** 選択カテゴリと一致するガジェットのみ（"all" は全件） */
export function filterGadgetsByCategory(
  list: Gadget[],
  category: CategoryId | "all",
): Gadget[] {
  if (category === "all") return list
  return list.filter((g) => g.category === category)
}

/** 充電式（内蔵バッテリー）かどうか */
export function isRechargeableGadget(gadget: Gadget): boolean {
  if (usesDisposableBattery(gadget)) return false
  return /充電|内蔵|Li-Po|mAh|充電式/i.test(gadgetPowerHaystack(gadget))
}

const MONITOR_CARD_SPECS = ["画面サイズ", "解像度", "リフレッシュレート", "VESA"] as const
const MONITOR_ARM_CARD_SPECS = ["対応サイズ", "耐荷重", "駆動方式", "取付方式"] as const
const MIC_CARD_SPECS = ["指向性", "接続方式", "周波数特性", "マイクタイプ"] as const
const MOUSE_CARD_SPECS = ["重量", "感度", "電源", "ボタン数"] as const
/** ゲーミングチェア一覧・詳細上部の4項目（座椅子含め全件共通） */
const GAMING_CHAIR_CARD_SPECS = ["素材", "最大リクライニング角度", GAMING_CHAIR_DIMENSION_CARD_LABEL, GAMING_CHAIR_OTTOMAN_CARD_LABEL] as const

function finalizeGamingChairCardHighlightValue(label: string, value: string): string {
  if (isGamingChairDimensionCardLabel(label)) {
    const formatted = formatDimensionsNumbersOnly(value === UNSPECIFIED_SPEC ? undefined : value)
    return formatted === "-" ? UNSPECIFIED_SPEC : formatted
  }
  return value
}

function getGamingChairCardSpecLabels(_gadget: Gadget): readonly string[] {
  return GAMING_CHAIR_CARD_SPECS
}

function getGamingChairCardSpecValue(gadget: Gadget, label: string): string {
  if (isGamingChairDimensionCardLabel(label) || label === "寸法" || label === "寸法/重量") {
    return getGamingChairDimensionCardDisplay(gadget)
  }

  const fromHighlight = gadget.highlights.find((h) => h.label === label)?.value
  if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) return fromHighlight

  for (const group of gadget.specGroups) {
    const row = group.rows.find((r) => r.label === label)
    if (row?.value && row.value !== UNSPECIFIED_SPEC) return row.value
  }

  if (label === "素材") return getGamingChairMaterial(gadget)
  if (label === "最大リクライニング角度") return getGamingChairMaxRecliningAngle(gadget)
  if (label === GAMING_CHAIR_OTTOMAN_CARD_LABEL || label === "オットマン") {
    const fromFilter = getGamingChairOttomanFilterValue(gadget)
    if (fromFilter) return fromFilter
    return gamingChairHasOttoman(gadget) ? "あり" : "なし"
  }
  if (label === GAMING_CHAIR_FRAME_CARD_LABEL || label === "アームレスト/保証") {
    return getGamingChairFrameMaterial(gadget)
  }
  return UNSPECIFIED_SPEC
}
const AUDIO_INTERFACE_CARD_SPECS = ["入力端子と数", "サンプリングレート", "ファンタム電源", "システム要件"] as const

/** 一覧カード・詳細モーダル上部の主要4スペック（カテゴリ別） */
export function getCardHighlights(gadget: Gadget): { label: string; value: string }[] {
  if (gadget.category === "camera") {
    return getCameraCardHighlights(gadget).map(({ label, value }) => ({
      label,
      value: sanitizeSpecDisplayValue(value, label, gadget),
    }))
  }

  if (gadget.category === "monitor") {
    return MONITOR_CARD_SPECS.map((label) => {
      if (label === "VESA") {
        return {
          label,
          value: sanitizeSpecDisplayValue(getMonitorVesaStandardDisplay(gadget), label, gadget),
        }
      }
      const found = gadget.highlights.find(
        (h) =>
          h.label === label ||
          (label === "リフレッシュレート" && /リフレッシュ/i.test(h.label)) ||
          (label === "パネル種類" && h.label === "パネル"),
      )
      let value = found?.value ?? UNSPECIFIED_SPEC
      if (label === "パネル種類") {
        value = getMonitorPanelDisplay(gadget)
      } else if (label === "解像度") {
        value = getMonitorResolutionDisplay(gadget)
      } else if (label === "リフレッシュレート") {
        value = resolveMonitorRefreshRateValue(gadget) ?? normalizeMonitorRefreshDisplay(value)
      }
      return {
        label,
        value: sanitizeSpecDisplayValue(
          label === "重量" ? formatWeightDisplay(value) : value,
          label,
          gadget,
        ),
      }
    })
  }

  if (gadget.category === "monitor-arm") {
    return MONITOR_ARM_CARD_SPECS.map((label) => {
      const found = gadget.highlights.find(
        (h) =>
          h.label === label ||
          (label === "取付方式" && /取付|クランプ|グロメット/i.test(h.label)),
      )
      if (found) {
        return {
          label,
          value: sanitizeSpecDisplayValue(found.value, label, gadget),
        }
      }
      if (label === "取付方式") {
        const mountRow = gadget.specGroups
          .flatMap((g) => g.rows)
          .find((r) => /取付方式/i.test(r.label))
        if (mountRow) {
          return {
            label,
            value: sanitizeSpecDisplayValue(mountRow.value, label, gadget),
          }
        }
        if (gadget.connection) {
          return {
            label,
            value: sanitizeSpecDisplayValue(gadget.connection, label, gadget),
          }
        }
      }
      if (label === "駆動方式") {
        const driveRow = gadget.specGroups
          .flatMap((g) => g.rows)
          .find((r) => r.label === "駆動方式")
        if (driveRow) {
          return {
            label,
            value: sanitizeSpecDisplayValue(driveRow.value, label, gadget),
          }
        }
      }
      return { label, value: UNSPECIFIED_SPEC }
    })
  }

  if (gadget.category === "mic") {
    return MIC_CARD_SPECS.map((label) => {
      if (label === "接続方式") {
        return {
          label,
          value: sanitizeSpecDisplayValue(getMicConnectionDisplay(gadget), label, gadget),
        }
      }
      if (label === "マイクタイプ") {
        return {
          label,
          value: sanitizeSpecDisplayValue(getMicTypeLabel(gadget) ?? UNSPECIFIED_SPEC, label, gadget),
        }
      }
      if (label === "指向性") {
        return {
          label,
          value: sanitizeSpecDisplayValue(
            resolveMicDirectivityValue(gadget) ?? UNSPECIFIED_SPEC,
            label,
            gadget,
          ),
        }
      }
      const found = gadget.highlights.find(
        (h) =>
          h.label === label ||
          (label === "接続方式" && h.label === "端子") ||
          (label === "周波数特性" && /周波数/i.test(h.label)),
      )
      const raw = found?.value ?? UNSPECIFIED_SPEC
      return { label, value: sanitizeSpecDisplayValue(raw, label, gadget) }
    })
  }

  if (gadget.category === "keyboard") {
    return getKeyboardCardHighlightEntries(gadget).map(({ label, value }) => ({
      label,
      value: sanitizeSpecDisplayValue(value || UNSPECIFIED_SPEC, label, gadget),
    }))
  }

  if (gadget.category === "mouse") {
    return MOUSE_CARD_SPECS.map((label) => {
      if (label === "電源") {
        return { label, value: getMouseCardPowerDisplay(gadget) }
      }
      if (label === "感度") {
        return { label, value: getMouseSensitivityDisplay(gadget) }
      }
      if (label === "ボタン数") {
        return { label, value: getMouseButtonCountDisplay(gadget) }
      }
      const found = gadget.highlights.find((h) => h.label === label)
      let value = found?.value ?? UNSPECIFIED_SPEC
      if (label === "重量" && value === UNSPECIFIED_SPEC) {
        const weightRow = gadget.specGroups
          .flatMap((g) => g.rows)
          .find((r) => r.label === "重量")
        if (weightRow?.value && weightRow.value !== UNSPECIFIED_SPEC) {
          value = weightRow.value
        }
      }
      return {
        label,
        value: sanitizeSpecDisplayValue(
          label === "重量" ? formatWeightDisplay(value) : value,
          label,
          gadget,
        ),
      }
    })
  }

  if (gadget.category === "gaming-chair") {
    const labels = getGamingChairCardSpecLabels(gadget)
    const fromCsv = getGamingChairCsvCardHighlights(gadget, labels)
    if (fromCsv) {
      return fromCsv.map(({ label, value }) => ({
        label,
        value: finalizeGamingChairCardHighlightValue(
          label,
          sanitizeSpecDisplayValue(value, label, gadget),
        ),
      }))
    }

    return labels.map((label) => {
      if (label === "最大リクライニング角度") {
        const fromHighlight = gadget.highlights.find((h) => h.label === label)?.value
        const value =
          fromHighlight && fromHighlight !== UNSPECIFIED_SPEC
            ? fromHighlight
            : getGamingChairMaxRecliningAngle(gadget)
        return {
          label,
          value: finalizeGamingChairCardHighlightValue(
            label,
            sanitizeSpecDisplayValue(value, label, gadget),
          ),
        }
      }
      const value = getGamingChairCardSpecValue(gadget, label)
      return {
        label,
        value: finalizeGamingChairCardHighlightValue(
          label,
          sanitizeSpecDisplayValue(value, label, gadget),
        ),
      }
    })
  }

  if (gadget.category === "audio-interface") {
    return AUDIO_INTERFACE_CARD_SPECS.map((label) => ({
      label,
      value: getAudioInterfaceCardSpec(gadget, label),
    }))
  }

  return gadget.highlights.slice(0, 4).map((h) => {
    const value = h.label === "重量" ? formatWeightDisplay(h.value) : h.value
    return { label: h.label, value: sanitizeSpecDisplayValue(value, h.label, gadget) }
  })
}

/** 詳細モーダル用：主要スペック（一覧カードより全文優先） */
export function getDetailHighlights(gadget: Gadget): { label: string; value: string }[] {
  if (gadget.category === "audio-interface") {
    return AUDIO_INTERFACE_CARD_SPECS.map((label) => ({
      label,
      value: sanitizeSpecDisplayValue(getAudioInterfaceDetailSpec(gadget, label), label, gadget),
    }))
  }

  if (gadget.category === "keyboard") {
    return getKeyboardCardHighlightEntries(gadget).map(({ label, value }) => {
      let displayValue = value || UNSPECIFIED_SPEC
      if (label === "内部構造") {
        displayValue = getKeyboardInternalStructureRaw(gadget)
      }
      displayValue = sanitizeSpecDisplayValue(displayValue || UNSPECIFIED_SPEC, label, gadget)
      if (/[…\.]{3}$/.test(displayValue.trim())) {
        for (const group of gadget.specGroups) {
          const row = group.rows.find((r) => r.label === label)
          if (row?.value && isCardSpecValueFilled(row.value) && row.value.length > displayValue.length) {
            displayValue = sanitizeSpecDisplayValue(row.value, label, gadget)
            break
          }
        }
      }
      return { label, value: displayValue }
    })
  }

  return getCardHighlights(gadget).map((h) => {
    let value = h.value
    if (/[…\.]{3}$/.test(value.trim())) {
      for (const group of gadget.specGroups) {
        const row = group.rows.find((r) => r.label === h.label)
        if (row?.value && isCardSpecValueFilled(row.value) && row.value.length > value.length) {
          value = sanitizeSpecDisplayValue(row.value, h.label, gadget)
          break
        }
      }
    }
    return { label: h.label, value }
  })
}

/** 一覧カード主要4スペックの入力済み数（{@link getCardHighlights} と同一ソース） */
export function countCardHighlightsFilled(gadget: Gadget): number {
  return getCardHighlights(gadget).filter((h) => isCardSpecValueFilled(h.value)).length
}

/** 一覧表示対象（カード表面4項目中3項目以上が未設定の場合は除外。モニターは2項目以上「—」を除外） */
export function passesCardSpecCompletenessFilter(gadget: Gadget): boolean {
  const filled = countCardHighlightsFilled(gadget)
  if (gadget.category === "monitor") return filled >= 3
  return filled >= 2
}

/** 一覧カードのスペックラベル（電池持続 ↔ 充電持続） */
export function getCardHighlightLabel(gadget: Gadget, label: string): string {
  if (gadget.category === "gaming-chair" && isGamingChairDimensionCardLabel(label)) {
    return "寸法"
  }
  if (gadget.category === "mic" && (label === "サンプルレート" || label === "サンプリングレート")) {
    return "サンプルレート / ビット深度"
  }
  if (label === "充電持続") return label
  if (label === "電池持続" && isRechargeableGadget(gadget)) return "充電持続"
  return label
}

function normalizeMouseReadingValue(raw: string): string | null {
  if (!raw || raw === UNSPECIFIED_SPEC) return null
  if (/darkfield/i.test(raw)) return "Darkfield"
  if (/光学/i.test(raw)) return "光学式"
  if (/レーザー|laser/i.test(raw)) return "レーザー"
  return raw.trim()
}

/** マウスカードの読み取り方式（Darkfield / 光学式 等） */
export function getMouseReadingMethod(gadget: Gadget) {
  if (gadget.category !== "mouse") return null

  const fromHighlight = gadget.highlights.find((h) => h.label === "読み取り方式")?.value
  const fromHighlightNorm = fromHighlight ? normalizeMouseReadingValue(fromHighlight) : null
  if (fromHighlightNorm) return fromHighlightNorm

  for (const group of gadget.specGroups) {
    for (const label of ["読み取り方式", "センサー"] as const) {
      const row = group.rows.find((r) => r.label === label)
      if (!row?.value || row.value === UNSPECIFIED_SPEC) continue
      const normalized = normalizeMouseReadingValue(row.value)
      if (normalized) return normalized
    }
  }

  return null
}

/** マイクカード下部のタイプ表示（コンデンサー / ダイナミック 等） */
export function getMicTypeLabel(gadget: Gadget) {
  if (gadget.category !== "mic") return null
  const fromHighlight = gadget.highlights.find((h) => h.label === "タイプ")?.value
  const raw =
    fromHighlight ??
    gadget.specGroups.find((g) => g.title === "オーディオ")?.rows.find((r) => r.label === "タイプ")?.value ??
    null
  return raw ? normalizeMicTypeDisplay(raw) : null
}

/** 商品ページURL（Amazon等） */
export function shopUrl(gadget: Gadget) {
  return gadget.purchaseUrl
}

/** 販売サイトを新しいタブで開く（埋め込みブラウザでも確実に遷移） */
export function openShopUrl(gadget: Gadget) {
  const url = shopUrl(gadget)
  if (!url) return
  window.open(url, "_blank", "noopener,noreferrer")
}

/** フィルター前の全ガジェット（メンテナンススクリプト用） */
export const allSourceGadgets: Gadget[] = allGadgets

/** 一覧表示対象（スペック不足・非本体・アクセサリ等を除外） */
export const gadgets: Gadget[] = dedupeGadgetsByPurchaseUrl(
  allGadgets
    .filter(passesRepositoryExcludedFilter)
    .filter(passesKeyboardListFilter)
    .filter(passesMicListFilter)
    .filter(passesGamingChairListFilter)
    .filter(passesAudioInterfaceListFilter)
    .filter(passesCardSpecCompletenessFilter),
)

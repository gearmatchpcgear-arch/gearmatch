import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import {
  MONITOR_ASUS_PA279CV_J_AMAZON_URL,
  MONITOR_ASUS_PA279CV_J_GADGET_ID,
  MONITOR_ASUS_PA279CV_J_IMAGE,
  MONITOR_ASUS_PA279CV_J_IMAGE_FALLBACKS,
  MONITOR_ASUS_PA279CV_J_PRICE,
} from "@/lib/monitor-asus-pa279cv-j"
import { formatPrice } from "@/lib/gadgets"
import {
  MONITOR_CRUA_49_ULTRAWIDE_AMAZON_URL,
  MONITOR_CRUA_49_ULTRAWIDE_GADGET_ID,
  MONITOR_CRUA_49_ULTRAWIDE_IMAGE,
} from "@/lib/monitor-crua-49-ultrawide"
import {
  MONITOR_DELL_S2725QC_AMAZON_URL,
  MONITOR_DELL_S2725QC_IMAGE,
} from "@/lib/monitor-dell-s2725qc"

/** ガイド「オフィス・映像鑑賞のおすすめ」タブ用カード */
export const GUIDE_MONITOR_OFFICE_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  {
    id: "guide-monitor-office-dell-s2725qc",
    badge: "Dell 4K 120Hzモデル",
    gadgetId: "mon-dell-s2725qc",
    imageUrl: MONITOR_DELL_S2725QC_IMAGE,
    title: "Dell S2725QC",
    modelNumber: "Dell",
    priceLabel: "￥47,980",
    purchaseUrl: MONITOR_DELL_S2725QC_AMAZON_URL,
    guideRating: 4.5,
    guideReviewCount: 128,
    heading: "DELLの高画質IPS＆5Wスピーカー搭載の27インチ4Kモデル",
    specs: [
      { label: "画面サイズ:", value: "27インチ" },
      { label: "解像度:", value: "4K (3840 x 2160)" },
      { label: "液晶パネルの種類:", value: "IPS（非光沢）" },
      { label: "リフレッシュレート:", value: "120Hz" },
    ],
    reasons: [
      {
        emphasis: "【Dell製 27インチ高精細4K】",
        text: "PC・ディスプレイ大手Dellによる27インチ4Kモデル。1500:1のコントラスト比、sRGB 99%、HDR対応で深みのある高画質映像を実現。",
      },
      {
        emphasis: "【USB-C 1本でスマート接続】",
        text: "最大65W給電対応のUSB Type-Cケーブル1本で映像出力とPCへの給電が行え、デスク上を美しく整頓できます。",
      },
      {
        emphasis: "【目に優しいEye Comfort 4つ星認証】",
        text: "色精度を損なわずに有害なブルーライトを35%以下に低減する「ComfortView Plus」を搭載し、長時間の作業も快適。",
      },
      {
        emphasis: "【クリアで迫力ある5W内蔵スピーカー】",
        text: "出力・周波数応答・デシベル範囲が強化された5Wスピーカーを搭載し、隅々までクリアなサウンドを届けます。",
      },
    ],
  },
  {
    id: "guide-monitor-office-crua-49-ultrawide",
    badge: '49" 32:9 スーパーウルトラワイド',
    gadgetId: MONITOR_CRUA_49_ULTRAWIDE_GADGET_ID,
    imageUrl: MONITOR_CRUA_49_ULTRAWIDE_IMAGE,
    title: "CRUA 49インチ ウルトラワイドモニター",
    modelNumber: "CRUA",
    priceLabel: "￥79,999",
    purchaseUrl: MONITOR_CRUA_49_ULTRAWIDE_AMAZON_URL,
    guideRating: 4.3,
    guideReviewCount: 3165,
    heading:
      "27インチ2台分の32:9 DQHDで、仮想デュアルモニター級の作業領域と165Hz湾曲の没入感を両立",
    specs: [
      { label: "画面サイズ:", value: "49インチ" },
      { label: "解像度:", value: "DQHD (5120 x 1440)" },
      { label: "液晶パネルの種類:", value: "VA (1500R湾曲)" },
      { label: "リフレッシュレート:", value: "165Hz" },
    ],
    reasons: [
      {
        emphasis: "【圧倒的作業領域＆2画面表示】",
        text: "27インチ2台分（32:9）の表示エリアで『仮想デュアルモニター』として機能。PIP/PBP対応で複数機器の同時表示も可能。",
      },
      {
        emphasis: "【DQHD×165Hz×1500R湾曲】",
        text: "視界を包み込む1500R湾曲パネルと165Hz駆動により、映画鑑賞やゲームで極上の没入感を提供。",
      },
      {
        emphasis: "【3000:1高コントラストVA】",
        text: "暗部から明部までメリハリのある表現が可能で、深みのある映像美を実現。",
      },
      {
        emphasis: "【注意点】",
        text: "横幅118.5cm以上の設置場所が必要です。またVAパネル特性上、印刷物などの厳密な色校正業務には不向きです。",
      },
    ],
  },
  {
    id: "guide-monitor-office-asus-pa279cv-j",
    badge: "27インチ 4K プロフェッショナル",
    gadgetId: MONITOR_ASUS_PA279CV_J_GADGET_ID,
    imageUrl: MONITOR_ASUS_PA279CV_J_IMAGE,
    imageFallbackUrls: [...MONITOR_ASUS_PA279CV_J_IMAGE_FALLBACKS],
    title: "ProArt PA279CV-J",
    modelNumber: "ASUS",
    priceLabel: formatPrice(MONITOR_ASUS_PA279CV_J_PRICE),
    purchaseUrl: MONITOR_ASUS_PA279CV_J_AMAZON_URL,
    guideRating: 4.4,
    guideReviewCount: 482,
    heading:
      "クリエイター向け27型4K ProArt。出荷時校正の高色精度とEye Careで長時間の制作作業も快適",
    specs: [
      { label: "画面サイズ:", value: "27インチ" },
      { label: "解像度:", value: "4K (3840 x 2160)" },
      { label: "液晶パネルの種類:", value: "IPS 非光沢" },
      { label: "リフレッシュレート:", value: "60Hz" },
    ],
    reasons: [
      {
        emphasis: "【4K UHD高精細＆忠実な色再現】",
        text: "フルHDの4倍の表示エリアを誇る27インチ4K IPSパネル。出荷時校正による高い色精度（ΔE<2）を達成し、写真・動画編集やグラフィック制作で忠実な色表示を実現します。",
      },
      {
        emphasis: "【無限の可能性を開く多機能USB-C】",
        text: "65W給電・DisplayPort映像入力・データ転送に対応するUSB Type-Cポートを搭載。周辺機器と接続可能なUSBハブ機能も備え、デスク上をスマートに整理できます。",
      },
      {
        emphasis: "【ProArt パレットで自在な色カスタマイズ】",
        text: "色調・色温度・ガンマ値や2点間グレースケールなど、多彩なパラメーターを画面上で直感的に設定・調整できます。",
      },
      {
        emphasis: "【長時間の作業を支える Eye Care】",
        text: "テュフラインランド認証を取得したブルーライト軽減＆フリッカーフリー機能を搭載し、長時間作業でも目への負担を抑えて快適に使用可能です。",
      },
    ],
  },
]

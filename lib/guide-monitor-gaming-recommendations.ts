import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import {
  MONITOR_IODATA_EX_GDQ271UEL_AMAZON_URL,
  MONITOR_IODATA_EX_GDQ271UEL_IMAGE,
  MONITOR_IODATA_EX_GDQ271UEL_IMAGE_FALLBACKS,
} from "@/lib/monitor-iodata-ex-gdq271uel"
import {
  MONITOR_IODATA_EX_GD251UH_AMAZON_URL,
  MONITOR_IODATA_EX_GD251UH_IMAGE,
} from "@/lib/monitor-iodata-ex-gd251uh"
import {
  MONITOR_COCOPAR_S238HW_AMAZON_URL,
  MONITOR_COCOPAR_S238HW_GADGET_ID,
  MONITOR_COCOPAR_S238HW_IMAGE,
} from "@/lib/monitor-cocopar-s-238hw"

/** ガイド「ゲーミングモニターのおすすめ」タブ用カード */
export const GUIDE_MONITOR_GAMING_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  {
    id: "guide-monitor-gaming-ex-gdq271uel",
    badge: "27インチ WQHD 280Hz QD-OLED",
    gadgetId: "mon-iodata-ex-gdq271uel",
    imageUrl: MONITOR_IODATA_EX_GDQ271UEL_IMAGE,
    imageFallbackUrls: [...MONITOR_IODATA_EX_GDQ271UEL_IMAGE_FALLBACKS],
    title: "EX-GDQ271UEL",
    modelNumber: "IODATA",
    priceLabel: "￥77,800",
    purchaseUrl: MONITOR_IODATA_EX_GDQ271UEL_AMAZON_URL,
    guideRating: 4.0,
    guideReviewCount: 66,
    heading:
      "27インチ WQHD×280Hz QD-OLEDで、圧倒的な発色と滑らかさを両立する次世代ゲーミングモニター",
    specs: [
      { label: "画面サイズ:", value: "27インチ" },
      { label: "解像度:", value: "WQHD (2560 x 1440)" },
      { label: "液晶パネルの種類:", value: "OLED" },
      { label: "リフレッシュレート:", value: "280Hz" },
    ],
    reasons: [
      {
        emphasis: "【WQHD & 280Hz】",
        text: "WQHD解像度と全ポート280Hz駆動に対応。フルHD比約1.8倍の精細さと、FPS向けの高い追従性を両立します。",
      },
      {
        emphasis: "【QD-OLEDパネル】",
        text: "有機EL（QD-OLED）採用で高コントラストと鮮やかな色再現。True Black 400対応のHDR表示も楽しめます。",
      },
      {
        emphasis: "【焼き付き3年保証＆G-SYNC Compatible】",
        text: "推奨環境下の焼き付きは3年保証の対象。NVIDIA G-SYNC Compatibleでティアリング低減にも対応。",
      },
      {
        emphasis: "【0.03ms応答＆充実スタンド】",
        text: "280Hz時0.03ms［GTG］の高速応答に加え、高さ・チルト・スイーベル・ピボット調整で長時間プレイも快適。",
      },
    ],
  },
  {
    id: "guide-monitor-gaming-ex-gd251uh",
    badge: "240Hz超高速リフレッシュレート",
    gadgetId: "mon-iodata-ex-gd251uh",
    imageUrl: MONITOR_IODATA_EX_GD251UH_IMAGE,
    title: "IODATA GCFX EX-GD251UH",
    modelNumber: "IODATA",
    priceLabel: "￥19,980",
    purchaseUrl: MONITOR_IODATA_EX_GD251UH_AMAZON_URL,
    guideRating: 4.5,
    guideReviewCount: 484,
    heading:
      "24.5型FHD×240HzとHFSパネルで、FPSなどスピード重視のゲームプレイに最適な高応答モニター",
    specs: [
      { label: "画面サイズ:", value: "24.5インチ" },
      { label: "解像度:", value: "FHD (1920 x 1080)" },
      { label: "液晶パネルの種類:", value: "HFS (高速応答)" },
      { label: "リフレッシュレート:", value: "240Hz" },
    ],
    reasons: [
      {
        emphasis: "【240Hz高リフレッシュレート】",
        text: "HDMI/DisplayPortともに240Hz駆動に対応。通常60Hzの4倍滑らかな描画でFPSなどの高速戦闘に最適。",
      },
      {
        emphasis: "【高速HFSパネル＆1ms応答速度】",
        text: "「ダイナミックOD」機能により最大1ms［GTG］を実現。動きの速いシーンも残像感を極限まで抑えます。",
      },
      {
        emphasis: "【AdaptiveSync対応】",
        text: "可変リフレッシュレート技術で画面のズレ（ティアリング）やカクつき（スタッタリング）を軽減。",
      },
      {
        emphasis: "【ゲーム専用補正機能】",
        text: "暗所を鮮明にする暗部補正や色彩強調プリセットを搭載し、視認性と没入感をアップ。",
      },
    ],
  },
  {
    id: "guide-monitor-gaming-s-238hw",
    badge: "超高コスパ240Hzゲーミング",
    gadgetId: MONITOR_COCOPAR_S238HW_GADGET_ID,
    imageUrl: MONITOR_COCOPAR_S238HW_IMAGE,
    title: "cocopar S-238HW",
    modelNumber: "cocopar",
    priceLabel: "￥19,999",
    purchaseUrl: MONITOR_COCOPAR_S238HW_AMAZON_URL,
    guideRating: 4.4,
    guideReviewCount: 2681,
    heading:
      "「迷っているならこれで決まり」と言える、240Hz×高輝度IPSのコスパ最強ゲーミングモニター",
    specs: [
      { label: "画面サイズ:", value: "23.8インチ" },
      { label: "解像度:", value: "FHD (1920 x 1080)" },
      { label: "液晶パネルの種類:", value: "IPS非光沢パネル" },
      { label: "リフレッシュレート:", value: "240Hz" },
    ],
    reasons: [
      {
        emphasis: "【圧倒的コスパ】",
        text: "初めてゲーミングモニターを買う人や、低予算で高性能なFPS環境を整えたい人に最適な完成度。",
      },
      {
        emphasis: "【超薄型＆2mmフレームレス】",
        text: "最小厚さ約7mmの超薄型設計。2mmの極細フレームで画面占有率が高くスッキリ配置可能。",
      },
      {
        emphasis: "【高輝度IPSパネル＆HDR】",
        text: "400nitの高輝度、178°広視野角のIPS非光沢パネルとHDR対応で、鮮明かつ忠実な色表現を実現。",
      },
      {
        emphasis: "【射撃補助機能搭載】",
        text: "メニュー操作で画面中央にクロスヘアを表示可能。FPSゲームでの照準合わせを強力にサポート。",
      },
    ],
  },
]

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
    badge: "27型 WQHD 280Hz QD-OLED",
    gadgetId: "mon-iodata-ex-gdq271uel",
    imageUrl: MONITOR_IODATA_EX_GDQ271UEL_IMAGE,
    imageFallbackUrls: [...MONITOR_IODATA_EX_GDQ271UEL_IMAGE_FALLBACKS],
    title: "EX-GDQ271UEL",
    modelNumber: "IODATA",
    priceLabel: "￥77,800",
    purchaseUrl: MONITOR_IODATA_EX_GDQ271UEL_AMAZON_URL,
    guideRating: 4.0,
    guideReviewCount: 66,
    heading: "「FPSも映像も本気」の人向け、WQHD×280Hz OLEDの完成形",
    specs: [
      { label: "画面サイズ:", value: "27インチ" },
      { label: "解像度:", value: "WQHD (2560 x 1440)" },
      { label: "液晶パネルの種類:", value: "OLED" },
      { label: "リフレッシュレート:", value: "280Hz" },
    ],
    reasons: [
      {
        emphasis: "WQHDは、1080pの“粗さ”を抜けてGPU負荷を4Kより現実的に",
        text: "競技FPSではフレーム数が命ですが、24〜27インチで1080pだけだと遠くの敵やテキストがぼやけて見えることも。1440pは情報量とfpsのバランスが良く、280Hzと組み合わせると“滑らかさと解像度”を同時に追いかけやすいスイートスポットです。",
      },
      {
        emphasis: "OLEDの瞬時応答は、残像より“残像がない”感覚に近い",
        text: "暗いマップや急な視点移動でIPSの残像が気になる人ほど、OLEDの応答のキレが違って感じられます。HDRコンテンツや夜のゲームシーンでは、黒の沈み込みも没入感に直結します。",
      },
      {
        emphasis: "焼き付き3年保証は、OLEDを日常主力にする勇気の後押し",
        text: "固定UIのHUDを長時間表示する用途では不安が残りますが、保証対象を確認したうえで使うと、買い切りの安心感が増します。G-SYNC Compatibleは、fps変動時の引っ裂き対策として実戦で効く場面が多いです。",
      },
      {
        emphasis: "スタンド調整は、首より“目線の高さ”を毎日合わせる保険",
        text: "高さ・ピボットまで動くと、アームなしでも座姿勢を整えやすいです。7万円台の投資なら、画質だけでなく長時間の首・肩への負担もセットで改善したい人向けです。",
      },
    ],
  },
  {
    id: "guide-monitor-gaming-ex-gd251uh",
    badge: "24.5型 FHD 240Hz",
    gadgetId: "mon-iodata-ex-gd251uh",
    imageUrl: MONITOR_IODATA_EX_GD251UH_IMAGE,
    title: "IODATA GCFX EX-GD251UH",
    modelNumber: "IODATA",
    priceLabel: "￥19,980",
    purchaseUrl: MONITOR_IODATA_EX_GD251UH_AMAZON_URL,
    guideRating: 4.5,
    guideReviewCount: 484,
    heading: "競技FPSの定番サイズで、240Hzを“2万円以下”に落とし込む",
    specs: [
      { label: "画面サイズ:", value: "24.5インチ" },
      { label: "解像度:", value: "FHD (1920 x 1080)" },
      { label: "液晶パネルの種類:", value: "HFS (高速応答)" },
      { label: "リフレッシュレート:", value: "240Hz" },
    ],
    reasons: [
      {
        emphasis: "24.5インチFHDは、プロ卓と同じ“視線移動が短い”フレーム",
        text: "大きすぎる画面は首振りが増え、小さすぎると情報が読みにくい——FPSでは24〜25インチFHDが長年選ばれるサイズです。初めて240Hz環境を組むなら、変数を増やさないこの組み合わせが失敗しにくいです。",
      },
      {
        emphasis: "240Hzは、144Hzから“もう戻れない”と感じる人が多いライン",
        text: "60→144の衝撃に次ぐステップとして、240はマウス・GPUが追いつけばエイムトレースやスワイプの滑らかさが一段上がります。2万円前後でIODATAブランドの240Hzに触れるのは、エントリー〜中級の現実解です。",
      },
      {
        emphasis: "HFS＋ODは、動体シーンの“ぼやけ”を減らす方向のチューニング",
        text: "スペック表の1msだけでなく、Overdrive調整付きのパネルは、設定次第でスメアと逆残像のバランスを取りやすいです。ValorantやApexのような速いTPS/FPSで差が出やすい領域です。",
      },
      {
        emphasis: "AdaptiveSyncは、fpsが揺れる現実のゲーム向け",
        text: "常に240fps固定は難しく、fps変動時のカクつきやティアリングを和らげたい人向け。GPU世代問わず、実プレイの快適さを底上げしやすい機能です。",
      },
    ],
  },
  {
    id: "guide-monitor-gaming-s-238hw",
    badge: "約2万円 / 240Hz IPS",
    gadgetId: MONITOR_COCOPAR_S238HW_GADGET_ID,
    imageUrl: MONITOR_COCOPAR_S238HW_IMAGE,
    title: "cocopar S-238HW",
    modelNumber: "cocopar",
    priceLabel: "￥19,999",
    purchaseUrl: MONITOR_COCOPAR_S238HW_AMAZON_URL,
    guideRating: 4.4,
    guideReviewCount: 2681,
    heading: "「とりあえず240Hz」を最安クラスで試す、最初のゲーミングモニター",
    specs: [
      { label: "画面サイズ:", value: "23.8インチ" },
      { label: "解像度:", value: "FHD (1920 x 1080)" },
      { label: "液晶パネルの種類:", value: "IPS非光沢パネル" },
      { label: "リフレッシュレート:", value: "240Hz" },
    ],
    reasons: [
      {
        emphasis: "約2万円で240Hzは、“本当に自分に効くか”を確かめる費用",
        text: "いきなり4KやOLEDに行く前に、リフレッシュレートだけ先に上げて体感する——その実験に最適な価格帯です。ノートPC内蔵60Hzからの乗り換えほどインパクトが大きく、予算を抑えたい学生・初めての自作勢に向きます。",
      },
      {
        emphasis: "IPS非光沢は、窓際デスクでも反射で画面が死ににくい",
        text: "TNの安価240Hzより色の安定や視野角が取りやすく、FPS以外の日常作業も同じ1台で回したい人向け。400nit級の明るさは、昼間の明るい部屋でも設定しやすいです。",
      },
      {
        emphasis: "23.8インチは、狭いデスクでも“240Hz環境”を成立させやすい",
        text: "深さのない机や二段デスクでも置きやすいサイズ。エイム練習用のサブモニターとしても、メインより一段小さいFHD240は相性が良いです。",
      },
      {
        emphasis: "内蔵クロスヘア等は本番設定に依存するが、練習用の補助にはなる",
        text: "ゲーム内設定が使えないタイトルや、感覚を合わせるウォームアップ用途では、画面中央の補助表示が役立つことも。本命機能は240Hz＋IPSのバランスと割り切り、コスパで選ぶ1台です。",
      },
    ],
  },
]

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
    badge: "27型 4K 120Hz / USB-C",
    gadgetId: "mon-dell-s2725qc",
    imageUrl: MONITOR_DELL_S2725QC_IMAGE,
    title: "Dell S2725QC",
    modelNumber: "Dell",
    priceLabel: "￥47,980",
    purchaseUrl: MONITOR_DELL_S2725QC_AMAZON_URL,
    guideRating: 4.5,
    guideReviewCount: 128,
    heading: "作業もゲームも1台：4Kの細かさと120Hzの滑らかさをUSB-C1本で",
    specs: [
      { label: "画面サイズ:", value: "27インチ" },
      { label: "解像度:", value: "4K (3840 x 2160)" },
      { label: "液晶パネルの種類:", value: "IPS（非光沢）" },
      { label: "リフレッシュレート:", value: "120Hz" },
    ],
    reasons: [
      {
        emphasis: "4K27インチは、Excelのセルもブラウザの文字も“読める”密度",
        text: "フルHD27インチの2倍近いピクセル数は、資料2枚並べや細かいUI作業でスクロール量を減らします。ゲームはGPU次第ですが、カジュアル〜シングルプレイの120Hzは、60Hzオフィスモニターからの乗り換えでも体感差が大きいです。",
      },
      {
        emphasis: "USB-C 65Wは、ノート1本で“帰社して刺すだけ”のデスク",
        text: "充電器・HDMI・USBハブが増えるとケーブルが絡まります。映像＋給電が1ケーブルにまとまると、持ち運びノートのメインディスプレイとして毎日のセットアップが短くなり、デスクの見た目も整います。",
      },
      {
        emphasis: "ComfortView Plusは、夜の作業で目が干る人の保険",
        text: "色が黄ばみすぎないブルーライト低減は、長時間のスプレッドシート・チャット・動画視聴で効いてきます。4Kの細かさで文字を小さくしすぎないよう、OS側のスケーリングとセットで使うと疲れにくいです。",
      },
      {
        emphasis: "5Wスピーカーは、会議前の確認やYouTubeに“とりあえず音が出る”",
        text: "Hi-Fiではありませんが、ヘッドホンを付けない雑談動画やTeamsのスピーカーテストには十分なことが多いです。完全に音響別途、というより“1台で完結する本数”を減らしたい人向けです。",
      },
    ],
  },
  {
    id: "guide-monitor-office-crua-49-ultrawide",
    badge: '49型 32:9 DQHD 165Hz',
    gadgetId: MONITOR_CRUA_49_ULTRAWIDE_GADGET_ID,
    imageUrl: MONITOR_CRUA_49_ULTRAWIDE_IMAGE,
    title: "CRUA 49インチ ウルトラワイドモニター",
    modelNumber: "CRUA",
    priceLabel: "￥79,999",
    purchaseUrl: MONITOR_CRUA_49_ULTRAWIDE_AMAZON_URL,
    guideRating: 4.3,
    guideReviewCount: 3165,
    heading: "デュアル27インチを1枚に：ベゼルレスの“超ワイド作業面”",
    specs: [
      { label: "画面サイズ:", value: "49インチ" },
      { label: "解像度:", value: "DQHD (5120 x 1440)" },
      { label: "液晶パネルの種類:", value: "VA (1500R湾曲)" },
      { label: "リフレッシュレート:", value: "165Hz" },
    ],
    reasons: [
      {
        emphasis: "32:9は、中央のベゼルなしで“2画面分の横連結”",
        text: "デュアル27インチの間に境界がないので、タイムライン編集・株チャート・IDE＋プレビューのような横長ワークフローが途切れません。PBPでPC2台を1枚に載せる運用も、スタンド2個よりケーブルが整理しやすいです。",
      },
      {
        emphasis: "DQHDは、ウルトラワイドでも文字が潰れにくい現実解像度",
        text: "32:9 FHD相当だと横に引き伸ばしただけの粗さになりがち。5120×1440なら、1440p帯の縦解像度を保ったまま横に広げるイメージで、作業とゲームの両方で情報量が足りやすいです。",
      },
      {
        emphasis: "165Hz＋1500R湾曲は、作業のあとそのままゲームに入れる",
        text: "オフィスタブでもレース・RPG・FPSの一部タイトルでは没入感が段違い。湾曲は視線移動を減らし、49インチの端まで視野に入れやすい効果があります。",
      },
    ],
    concern: {
      emphasis: "設置幅118cm超・VAパネルの向き不向き",
      text: "デスク奥行きと横幅を事前に測らないと届かないサイズです。またVAはコントラストは強い一方、印刷物レベルの色校正や横から見る共同作業にはIPS/プロ向けモデルの方が向きます。",
    },
  },
  {
    id: "guide-monitor-office-asus-pa279cv-j",
    badge: "27型 4K ProArt / 色校正",
    gadgetId: MONITOR_ASUS_PA279CV_J_GADGET_ID,
    imageUrl: MONITOR_ASUS_PA279CV_J_IMAGE,
    imageFallbackUrls: [...MONITOR_ASUS_PA279CV_J_IMAGE_FALLBACKS],
    title: "ProArt PA279CV-J",
    modelNumber: "ASUS",
    priceLabel: formatPrice(MONITOR_ASUS_PA279CV_J_PRICE),
    purchaseUrl: MONITOR_ASUS_PA279CV_J_AMAZON_URL,
    guideRating: 4.4,
    guideReviewCount: 482,
    heading: "「色がズレるのが怖い」クリエイターの、4K作業用ディスプレイ",
    specs: [
      { label: "画面サイズ:", value: "27インチ" },
      { label: "解像度:", value: "4K (3840 x 2160)" },
      { label: "液晶パネルの種類:", value: "IPS 非光沢" },
      { label: "リフレッシュレート:", value: "60Hz" },
    ],
    reasons: [
      {
        emphasis: "出荷時ΔE<2は、“なんとなく綺麗”と“納品できる色”の差",
        text: "写真・動画・イラストでクライントや印刷に出すなら、ゲーミングモニターの鮮やかさだけでは不安が残ります。ProArt系の校正済み4Kは、タイムライン上の色判断を信じやすくする投資です。",
      },
      {
        emphasis: "60Hzでも4K作業の主戦場は“静止画に近い”編集作業",
        text: "カット編集・Retouch・レイアウト確認はfpsよりピクセル密度と色の方が効きます。120Hzゲーミングモニターと役割分担するサブ／メイン作業屏として選ばれやすいポジションです。",
      },
      {
        emphasis: "USB-C 65W＋ハブは、Mac/ノートクリエイターの配線整理",
        text: "SDリーダーや外付けSSDをモニター側に寄せられると、机の上のハブが1個減ります。DisplayPort over USB-Cで4K60を出しつつ給電できると、カフェ作業→自宅デスクの移動が楽です。",
      },
      {
        emphasis: "ProArt Paletteは、プリセットに頼らない色の微調整用",
        text: "納品先（Web/紙/動画）ごとにガンマや色温を切り替えたい人向け。Eye Care系認証は、夜のレタッチで目が痛くなる前の長時間作業向けの保険です。",
      },
    ],
  },
]

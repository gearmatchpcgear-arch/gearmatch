import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import {
  INSTA360_LINK_2_AMAZON_IMAGES,
  INSTA360_LINK_2_IMAGE_URL,
} from "@/lib/camera-insta360-link-2-images"

/** ガイド「失敗しないカメラの選び方」直下のおすすめカード（DB は参照のみ・上書きしない） */
export const GUIDE_CAMERA_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  {
    id: "guide-camera-logicool-c920n",
    badge: "迷ったらコレ / Webカメラの絶対定番",
    gadgetId: "cam-bs-003",
    imageUrl: "https://m.media-amazon.com/images/I/61+Q9M31U3L._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61FLOm0OiLL._AC_SL1500_.jpg",
    ],
    title: "ロジクール C920n",
    modelNumber: "LOGICOOL",
    priceLabel: "￥6,148",
    heading:
      "精確なオートフォーカスと高いコスパを兼ね備えた、配信・会議用ウェブカメラの絶対的スタンダード",
    specs: [
      { label: "解像度:", value: "1080p (フルHD)" },
      { label: "フレームレート:", value: "30fps" },
      { label: "画角:", value: "78°" },
      { label: "内蔵マイク:", value: "あり（ステレオマイク）" },
      { label: "接続方式:", value: "USB-A" },
    ],
    reasons: [
      {
        emphasis: "【オートフォーカス＆5エレメントガラスレンズ】",
        text: "フルHD対応の高品質なガラスレンズを採用。優れたオートフォーカス機能が自動でスムーズにピントを合わせ、いつでも鮮明でシャープな高解像度映像を捉えます。",
      },
      {
        emphasis: "【オンライン会議・配信に最適（1080p/30fps）】",
        text: "Zoom、Microsoft Teams、Google Meetなどの主要会議ソフトに対応。プラグアンドプレイでWindows/Macに挿すだけで即座に利用開始でき、リモート環境の拡張にも手軽に対応できます。",
      },
      {
        emphasis: "【6,000円前後の抜群なコストパフォーマンス】",
        text: "手頃な価格帯でありながら高い性能を備え、初めてカメラを購入する方にも最適。「迷ったらコレを選べば安心」と言える高評価獲得の定番モデルです。",
      },
      {
        emphasis: "【78°画角と内蔵ステレオマイク】",
        text: "1人向けの78°画角と左右ステレオマイク内蔵により、別マイクがなくてもWeb会議やカジュアル配信をすぐ始められます。",
      },
    ],
  },
  {
    id: "guide-camera-elgato-facecam-4k",
    badge: "4K60fps対応 / ハイエンド配信用Webカメラ",
    gadgetId: "cam-str-073-yh1y",
    imageUrl: "https://m.media-amazon.com/images/I/615qKAG9IML._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61Mv1T43f5L._AC_SL1500_.jpg",
    ],
    title: "Elgato Facecam 4K",
    modelNumber: "ELGATO",
    priceLabel: "￥29,851",
    heading:
      "一眼レフ級の画質と徹底したマニュアル調整で、こだわりの配信空間を表現できる本格派Webカメラ",
    specs: [
      { label: "解像度:", value: "4K (2160p)" },
      { label: "フレームレート:", value: "60fps" },
      { label: "画角:", value: "90°" },
      { label: "内蔵マイク:", value: "なし" },
      { label: "接続方式:", value: "USB Type-C" },
    ],
    reasons: [
      {
        emphasis: "【Sony STARVIS 2センサー＆Primeレンズによる高品質映像】",
        text: "一眼レフ並みの映像品質を実現する高感度センサーと専用レンズを搭載。4K/60fpsの滑らかな映像と鮮やかな色彩表現が魅力です。",
      },
      {
        emphasis: "【リアルタイム2D/3Dノイズリダクション】",
        text: "高度なノイズ低減処理により暗部やディテールのザラつきをカット。クリアで滑らかな質感だけを残した綺麗な映像を伝送できます。",
      },
      {
        emphasis: "【90°の広角視野でデスク環境を含めた「画作り」が可能】",
        text: "広範囲を捉えられる90°視野角を採用。自分だけでなく背景やこだわりのデスク周りも含めた配信・動画の雰囲気作り（パン/チルト/ズーム調整可）に役立ちます。",
      },
      {
        emphasis: "【照明と手動設定で極まるクリエイター向け設計】",
        text: "自動補正に頼るタイプではなく、照明をしっかりと当てた上で露出やISOを手動で追い込むことで真価を発揮する、本格的な撮影環境向けのカメラです。",
      },
    ],
  },
  {
    id: "guide-camera-insta360-link-2",
    badge: "4K / AI自動追跡 / PTZジンバル搭載",
    gadgetId: "cam-str-038-3hx8",
    imageUrl: INSTA360_LINK_2_IMAGE_URL,
    imageFallbackUrls: [...INSTA360_LINK_2_AMAZON_IMAGES],
    title: "Insta360 Link 2",
    modelNumber: "INSTA360",
    priceLabel: "￥30,880",
    heading:
      "進化を遂げたAI自動追跡とマニュアル調整で、自由自在なセッティングと高画質配信を実現",
    specs: [
      { label: "解像度:", value: "4K (2160p)" },
      { label: "フレームレート:", value: "60fps" },
      { label: "画角:", value: "79.5°" },
      { label: "内蔵マイク:", value: "あり" },
      { label: "接続方式:", value: "USB Type-C" },
    ],
    reasons: [
      {
        emphasis: "【Ultra HD 4K高解像度＆専用ソフトでのプロ仕様調整】",
        text: "圧倒的な鮮明さを誇る4K画質に対応。専用ソフト「Insta360 Link Controller」により、ISO・シャッタースピード・色温度の数値入力や彩度・シャープネスまで細かく数値を追い込めます。",
      },
      {
        emphasis: "【さらにスムーズ＆ナチュラルになったAI自動追跡】",
        text: "PTZジンバルによる人物追跡機能が進化。激しい動きでもブレず、より滑らかで自然な追従性能で被写体を的確に捉え続けます。",
      },
      {
        emphasis: "【底面マグネット内蔵で自由なセッティング】",
        text: "コンパクトな筐体でモニターやノートPCに手軽に設置できるほか、カメラ底面にマグネットを新内蔵。金属面へ直接固定でき、アイデア次第で自由自在な画作りが可能です。",
      },
    ],
  },
]

import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import {
  INSTA360_LINK_2_AMAZON_IMAGES,
  INSTA360_LINK_2_IMAGE_URL,
} from "@/lib/camera-insta360-link-2-images"

/** ガイド「失敗しないカメラの選び方」直下のおすすめカード（DB は参照のみ・上書きしない） */
export const GUIDE_CAMERA_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  {
    id: "guide-camera-logicool-c920n",
    badge: "迷ったらコレ / Web会議の定番",
    gadgetId: "cam-bs-003",
    imageUrl: "https://m.media-amazon.com/images/I/61+Q9M31U3L._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61FLOm0OiLL._AC_SL1500_.jpg",
    ],
    title: "ロジクール C920n",
    modelNumber: "LOGICOOL",
    priceLabel: "￥6,148",
    heading: "「とりあえずカメラ」で失敗しない、Web会議の最初の1台",
    specs: [
      { label: "解像度:", value: "1080p (フルHD)" },
      { label: "フレームレート:", value: "30fps" },
      { label: "画角:", value: "78°" },
      { label: "内蔵マイク:", value: "あり（ステレオマイク）" },
      { label: "接続方式:", value: "USB-A" },
    ],
    reasons: [
      {
        emphasis: "1080p/30fpsは、Zoom・Teamsの現実にちょうどいい",
        text: "4Kは魅力的ですが、会議ソフト側の帯域や相手の回線次第で恩恵が薄れることも多いです。フルHD30fpsは「画質も粗すぎない・PC負荷も抑えめ」のバランスで、リモートワークのデフォルト解像度として長年選ばれ続けている理由があります。",
      },
      {
        emphasis: "78°画角は、1人＋背景少なめの“定番フレーミング”",
        text: "広角すぎると部屋の散らかりまで映り、狭すぎると顔だけが近すぎて圧が出ます。78°前後はデスクに座った1人向けの定番で、初めてカメラ位置を決めるときに迷いにくい画角です。",
      },
      {
        emphasis: "オートフォーカスは、身動きする雑談配信より“会議向き”",
        text: "前のめりになったり資料を指したりしてもピントが追いやすく、設定画面を触らない運用と相性が良いです。ガラスレンズ系のC920系は、安価な固定焦点Webカメラより「顔が常にボケる」ストレスが少ないことが多いです。",
      },
      {
        emphasis: "USB-Aプラグアンドプレイ＋内蔵マイクで、今日から会議に出られる",
        text: "別マイク・キャプチャボード・ドライバ地獄を避けたい人向け。6,000円前後で「ノート内蔵カメラから確実にマシにしたい」という動機に最も答えやすい定番です。",
      },
    ],
  },
  {
    id: "guide-camera-elgato-facecam-4k",
    badge: "4K60 / 配信者向け・マイクなし",
    gadgetId: "cam-str-073-yh1y",
    imageUrl: "https://m.media-amazon.com/images/I/615qKAG9IML._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61Mv1T43f5L._AC_SL1500_.jpg",
    ],
    title: "Elgato Facecam 4K",
    modelNumber: "ELGATO",
    priceLabel: "￥29,851",
    heading: "照明とマイクを別で揃える人の、4K配信“本体”",
    specs: [
      { label: "解像度:", value: "4K (2160p)" },
      { label: "フレームレート:", value: "60fps" },
      { label: "画角:", value: "90°" },
      { label: "内蔵マイク:", value: "なし" },
      { label: "接続方式:", value: "USB Type-C" },
    ],
    reasons: [
      {
        emphasis: "4K60は、切り抜き配信・クロマキー・拡大表示で“余白”になる",
        text: "1080p配信でもソースをクロップすると画質が落ちやすいです。4Kで撮って1080pにダウンスケールすると、顔周りの輪郭や髪の毛が残りやすく、OBSのレイアウト自由度が上がります。60fpsは動きの多い配信ほどヌルッと感が出ます。",
      },
      {
        emphasis: "内蔵マイクなしは、音声を別で本気にする人向けの設計",
        text: "カメラとマイクを一体化すると、どちらか一方の限界に縛られがち。Facecamは映像に予算を集中させ、XLR/USBマイク・Elgato Wave等と役割分担する配信デスク向け。会議だけならオーバースペックです。",
      },
      {
        emphasis: "90°は、デスク全景・キーボード・フィギュアまで“世界観”を映す",
        text: "顔だけの78°より背景の見せ場が広がり、Just Chattingや作業配信で「このデスクが好き」を伝えやすい画角。Camera Hubでズーム・パン調整もでき、構図を固定したい人にも向きます。",
      },
      {
        emphasis: "手動露出・ISOは、照明を当てた人ほど“映画っぽい肌”に近づく",
        text: "オート補正任せのWebカメラは、部屋の明るさで色がコロコロ変わりがち。STARVIS 2系センサー＋リングライト等と組み合わせ、露出を固定すると、視聴者側の「画質が安定している」印象が大きく変わります。",
      },
    ],
  },
  {
    id: "guide-camera-insta360-link-2",
    badge: "4K / AI追跡 / PTZジンバル",
    gadgetId: "cam-str-038-3hx8",
    imageUrl: INSTA360_LINK_2_IMAGE_URL,
    imageFallbackUrls: [...INSTA360_LINK_2_AMAZON_IMAGES],
    title: "Insta360 Link 2",
    modelNumber: "INSTA360",
    priceLabel: "￥30,880",
    heading: "立ち上がっても・ホワイトボードでも、画角を追いかけてくれる1台",
    specs: [
      { label: "解像度:", value: "4K (2160p)" },
      { label: "フレームレート:", value: "60fps" },
      { label: "画角:", value: "79.5°" },
      { label: "内蔵マイク:", value: "あり" },
      { label: "接続方式:", value: "USB Type-C" },
    ],
    reasons: [
      {
        emphasis: "PTZ＋AI追跡は、固定Webカメラの“枠からはみ出る”を防ぐ",
        text: "プレゼンで立つ、椅子から離れる、資料を指す——固定画角だと顔が切れがちな場面を、ジンバルがなめらかに追います。オンライン授業・社内勉強会・デモ配信など、被写体が動く用途で差が出ます。",
      },
      {
        emphasis: "4Kソースは、追跡中でもクロップ余地を残しやすい",
        text: "自動フレーミングは画面の一部を切り出す処理になるため、元画素が高いほど最終出力がボケにくいです。1080p配信でも4Kセンサーの恩恵は、ズーム・追跡時に効きやすいです。",
      },
      {
        emphasis: "Link Controllerで数値いじり——“自動と手動”のハイブリッド",
        text: "ISO・色温度・シャープネスまで触れるので、完全オートに任せきりにせず、部屋の照明に合わせて色を固定できます。Facecamほどマニュアル専門ではなく、追跡の便利さと画質調整の両方を欲しい人向けです。",
      },
      {
        emphasis: "底面マグネットは、モニター上部以外の“アイデア設置”向け",
        text: "金属ラックやマグネット対応スタンドに付け替えやすく、狭いデスクでもカメラ位置の試行錯誤がしやすい。内蔵マイクもあるので、まずは1台で会議→あとからマイク追加、という段階も取りやすいです。",
      },
    ],
  },
]

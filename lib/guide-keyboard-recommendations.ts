import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"
import {
  KEYBOARD_ELECOM_VK720A_AMAZON_IMAGE,
  KEYBOARD_ELECOM_VK720A_IMAGE_URL,
} from "@/lib/keyboard-elecom-vk720a"
import {
  KEYBOARD_HYPERX_ALLOY_CORE_RGB_IMAGE,
} from "@/lib/keyboard-hyperx-alloy-core-rgb"
import { KEYBOARD_G515_RAPID_IMAGE } from "@/lib/keyboard-logicool-g515-rapid"
import {
  KEYBOARD_REALFORCE_GX1PLUS_IMAGE,
  KEYBOARD_REALFORCE_GX1PLUS_IMAGE_FALLBACK,
} from "@/lib/keyboard-realforce-gx1plus"

export type GuideKeyboardRecommendationId = "entry" | "pro"

export const GUIDE_KEYBOARD_TABS: { id: GuideKeyboardRecommendationId; label: string }[] = [
  { id: "entry", label: "初心者におすすめのゲーミングキーボード" },
  { id: "pro", label: "高性能ゲーミングキーボード" },
]

export const GUIDE_KEYBOARD_LIST_TITLES: Record<GuideKeyboardRecommendationId, string> = {
  entry: "初心者におすすめのゲーミングキーボード一覧",
  pro: "高性能ゲーミングキーボード一覧",
}

export const GUIDE_KEYBOARD_RECOMMENDATIONS: Record<
  GuideKeyboardRecommendationId,
  GuideCategoryRecommendation[]
> = {
  entry: [
    {
      id: "keyboard-entry-g213r",
      badge: "エントリー向け / コスパ重視",
      gadgetId: "k-gbs-006",
      title: "Logicool G G213r",
      modelNumber: "ロジクール G",
      priceLabel: "￥-",
      heading: "ゲーミングキーボードの入門に最適な高コスパ・高耐久モデル",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 (JIS) / フルサイズ" },
        { label: "スイッチ/構造", value: "Mech-Dome (メンブレン)" },
        { label: "接続方式", value: "有線 (USB)" },
        { label: "その他", value: "パームレスト一体型 / 耐水設計" },
      ],
      reasons: [
        {
          emphasis: "【エントリーに最適】",
          text: "今まで本格的なゲーミングキーボードを使ったことがない方の最初の1台（エントリーモデル）として最適です。",
        },
        {
          emphasis: "【打鍵感と高速応答】",
          text: "メカニカルに匹敵する押し心地を実現する独自Mech-Domeキーを搭載。一般キーボードの約4倍の高速レスポンスを誇ります。",
        },
        {
          emphasis: "【耐水・高耐久設計】",
          text: "液体やホコリ・汚れに強い安心の設計で、ゲームプレイはもちろん日々のデスクワークでも長期間安心して使用できます。",
        },
        {
          emphasis: "【ライティングカスタマイズ】",
          text: "プレイ環境や好みのゲームタイトルに合わせて、ライティングパターンを自由にカスタマイズ可能です。",
        },
      ],
    },
    {
      id: "keyboard-entry-racen-tkl",
      badge: "ハイエンド / 磁気スイッチ搭載",
      gadgetId: "k-gnr-p2-054",
      title: "センチュリー RACEN 磁気スイッチ式 TKL (ホワイト)",
      modelNumber: "CRC-GKMGRT01WT2_FP / CENTURY",
      priceLabel: "￥-",
      heading: "ラピッドトリガー搭載！超高速応答と高いカスタマイズ性を誇る競技向けモデル",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 / テンキーレス (TKL)" },
        { label: "スイッチ/構造", value: "磁気スイッチ (Hall Effect)" },
        { label: "接続方式", value: "有線 (USB Type-C)" },
        { label: "ポーリングレート", value: "最大 8,000Hz (8K対応)" },
      ],
      reasons: [
        {
          emphasis: "【ラピッドトリガー搭載】",
          text: "磁気スイッチを採用し、キーを離した瞬間にオフ判定される超高速入力対応。FPSゲーム等の瞬時なストッピング操作に圧倒的なアドバンテージを発揮します。",
        },
        {
          emphasis: "【最大8,000Hzポーリングレート】",
          text: "初期値1,000Hzから最大8,000Hz（8K）まで設定可能。入力遅延を極限まで削ぎ落とし、素早い打鍵を即座にPCへ伝達します。",
        },
        {
          emphasis: "【日本語専用アプリで簡単設定】",
          text: "直感的な日本語対応ソフトにより、ラピッドトリガーの感度やキー入力動作（アクチュエーションポイント等）を好みの操作感へ細かくカスタマイズできます。",
        },
        {
          emphasis: "【鮮やかなRGB-LEDライティング】",
          text: "14種類の発光モードを搭載。専用ソフトを使えば何万通りものカラー設定やスピード調整を画面で確認しながら自由に楽しめます。",
        },
      ],
    },
    {
      id: "keyboard-entry-hyperx-alloy-core-rgb",
      badge: "エントリー向け / コスパ抜群",
      gadgetId: "k-gmg-hyperx-alloy-core",
      imageUrl: KEYBOARD_HYPERX_ALLOY_CORE_RGB_IMAGE,
      title: "HyperX Alloy Core RGB",
      modelNumber: "HyperX",
      priceLabel: "￥-",
      heading: "5,000円以下で手に入る高耐久ゲーミングキーボードの決定版",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 (JIS) / フルサイズ" },
        { label: "スイッチ/構造", value: "メンブレン" },
        { label: "接続方式", value: "有線 (USB)" },
        { label: "その他", value: "耐水設計 / RGB / メディアキー" },
      ],
      reasons: [
        {
          emphasis: "【5000円以下のエントリーモデル】",
          text: "手頃な価格で本格的な打鍵感とゲーム向け機能を備えた、初めてのゲーミングキーボードに最適なモデルです。",
        },
        {
          emphasis: "【アンチゴースト機能搭載の静音キー】",
          text: "複数キーの同時押し時に誤入力を防ぐ「アンチゴースト機能」を搭載。静かで応答性に優れた打鍵感で快適なゲームプレイをサポートします。",
        },
        {
          emphasis: "【120mlテスト済みの優れた耐飛沫性】",
          text: "120mlの液体テストをクリアした安心の防滴設計。万が一飲み物をこぼしてもゲームプレイを中断する必要がありません。",
        },
        {
          emphasis: "【特徴的なライトバーとスムーズなRGB効果】",
          text: "美しい輝きを放つライトバーと6つのプリセット効果（カラーサイクル、スペクトラムウェーブ、ブリージング、ソリッド、5ゾーン、オーロラ）でデスクを鮮やかに彩ります。",
        },
      ],
    },
  ],
  pro: [
    {
      id: "keyboard-pro-vk720a",
      badge: "プロ仕様 / 75%コンパクト",
      gadgetId: "vk720a",
      imageUrl: KEYBOARD_ELECOM_VK720A_IMAGE_URL,
      imageFallbackUrls: [KEYBOARD_ELECOM_VK720A_AMAZON_IMAGE],
      title: "ゲーミングキーボード V custom VK720A",
      modelNumber: "TK-VK720ABK (ブラック) / エレコム",
      priceLabel: "￥-",
      heading:
        "応答速度と精度を極限まで高めた“ELECOM Magnetic S.P.S Engine”搭載のプロ仕様キーボード",
      specs: [
        { label: "レイアウト", value: "75%" },
        { label: "内部構造", value: "磁気スイッチ" },
        { label: "接続方式", value: "有線（USB）" },
        { label: "機能", value: "ラピッドトリガー搭載" },
      ],
      reasons: [
        {
          emphasis: "【0.1mm単位の感度・ラピッドトリガー調整】",
          text: "専用ソフト「EG Tool」から、ON/OFFの押し込み・押し上げ量を0.1mm〜3.8mmまで0.1mm単位で設定可能。全体一括設定だけでなく、キーごとの個別カスタマイズにも対応します。",
        },
        {
          emphasis: "【高度なキーカスタマイズ＆ダイヤル機能】",
          text: "キーを深く押すとダッシュ等の別操作を行える「2ndアクション機能」（3キー同時押しまで対応）や、本体右上のダイヤルへの独自動作割り当てが可能です。",
        },
        {
          emphasis: "【ELECOM Magnetic S.P.S Engine 搭載】",
          text: "応答速度（Speed）・精度（Precision）・安定性（Stability）を高めた専用エンジンに可変型アクチュエーション＆リセットポイント制御システムを追加。圧倒的なレスポンスを実現します。",
        },
        {
          emphasis: "【V custom シリーズ最高峰の操作感】",
          text: "プロからエントリーまで「勝ちにこだわるプレイヤー」のために数値性能と感覚的な使い心地を極限まで作り込んだハイクラス・ゲーミングデバイスです。",
        },
      ],
    },
    {
      id: "keyboard-pro-g515-rapid",
      badge: "プロ仕様 / 薄型ロープロファイル",
      gadgetId: "g515-rapid",
      imageUrl: KEYBOARD_G515_RAPID_IMAGE,
      title: "Logicool G G515 RAPID TKL",
      modelNumber: "G515-TKL-RTBKd / ロジクール G",
      priceLabel: "￥-",
      heading:
        "薄型22mmロープロファイル×磁気式スイッチで極限のレスポンスを実現する高速TKLモデル",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 / テンキーレス" },
        { label: "内部構造", value: "磁気式アナログ (ロープロ)" },
        { label: "接続方式", value: "有線 (USB)" },
        { label: "機能", value: "ラピッドトリガー / SOCD対応" },
      ],
      reasons: [
        {
          emphasis: "【22mm薄型ロープロファイルキー】",
          text: "わずか22mmの薄型設計で手首への負担を軽減しつつ、圧倒的なレスポンス速度で高速入力を実現します。",
        },
        {
          emphasis: "【0.1mm単位で自由に調整できるアクチュエーションポイント】",
          text: "0.1〜2.5mmの範囲で0.1mm単位のカスタマイズに対応。指を離さずにキー操作が可能で、各キーを個別調整できます。",
        },
        {
          emphasis: "【独自の「KEY PRIORITY」テクノロジー (SOCD)】",
          text: "左右移動キーの同時入力時に、「深く押したキー優先」「後押し優先」「常にD優先」「常にA優先」の4種類から優先アクションを指定可能です。",
        },
        {
          emphasis: "【1キーの押下の深さで2つのコマンドを制御】",
          text: "軽く押した時と深く押した時で別々のアクションを割り当て可能。素早さが求められるゲームでもプレイの幅が広がります。",
        },
      ],
    },
    {
      id: "keyboard-pro-realforce-gx1plus",
      badge: "プロ仕様 / 静電容量無接点",
      gadgetId: "realforce-gx1plus-x1pc11",
      imageUrl: KEYBOARD_REALFORCE_GX1PLUS_IMAGE,
      imageFallbackUrls: [KEYBOARD_REALFORCE_GX1PLUS_IMAGE_FALLBACK],
      title: "REALFORCE GX1Plus",
      modelNumber: "X1PC11 / リアルフォース (日本製)",
      priceLabel: "￥-",
      heading:
        "チャタリング無しの静電容量無接点×圧倒的静音性と高度なカスタム性を誇る国産フラッグシップ",
      specs: [
        { label: "配列/仕様", value: "日本語配列 / テンキーレス" },
        { label: "キースイッチ", value: "静電容量無接点方式 (静音)" },
        { label: "接続方式", value: "有線（USB）" },
        { label: "機能", value: "ラピッドトリガー / 8000Hz" },
      ],
      reasons: [
        {
          emphasis: "【1億回超の耐久性を誇る静電容量無接点方式】",
          text: "物理的接点がない東プレスイッチを搭載。二重入力（チャタリング）が発生せず、1億回を超える耐久試験をクリアした信頼性の高い打鍵感を実現します。",
        },
        {
          emphasis: "【VC時も安心な徹底した静音設計】",
          text: "静音スイッチに加えロングキーにはグリス処理を施し、徹底的に静音化。プレイ中のボイスチャットに打鍵音が乗りにくく、ゲームへ集中できます。",
        },
        {
          emphasis: "【選べる2つのキー荷重（45g / 30g）】",
          text: "誤入力を防ぎ正確性を求めるプレイヤー向けの「45g」と、より瞬発力を重視し長押しや底打ちを多用するプレイヤー向けの「30g」をラインナップしています。",
        },
        {
          emphasis: "【REALFORCE CONNECT と高級ダークグレーフレーム】",
          text: "専用ソフトでマクロループ、ポーリングレート変更、キーマップ4面切替、Scene機能、72種類のライティングプリセット、Momentary機能など多彩な設定が可能。サビに強いダークグレースチールフレームとフローティングデザインで、見た目とメンテナンス性も両立します。",
        },
      ],
    },
  ],
}

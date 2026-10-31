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
      heading: "「メカニカルはまだ不安」な人の、最初のゲーミング配列",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 (JIS) / フルサイズ" },
        { label: "スイッチ/構造", value: "Mech-Dome (メンブレン)" },
        { label: "接続方式", value: "有線 (USB)" },
        { label: "その他", value: "パームレスト一体型 / 耐水設計" },
      ],
      reasons: [
        {
          emphasis: "メンブレンなのに“安っぽいノートPCキー”感が薄い理由",
          text: "Mech-Domeはメンブレンとメカの中間のような押し心地で、初めてゲーミング配列に触れる人が「押し間違えた」と感じにくいバランスです。いきなり青軸の硬さに当たって挫折する前に、手首と指の使い方を覚える土台になります。",
        },
        {
          emphasis: "フルサイズ＋パームレストで、数字列を見ながらプレイしやすい",
          text: "MMOやクラフト系、設定画面でテンキーを使うゲームでは、TKLよりフルサイズの方が迷いが少ないことが多いです。一体型レスト付きなので、長時間のカジュアルプレイでも手のひらが浮きにくく、デスク周りの追加パーツも増やしません。",
        },
        {
          emphasis: "耐水設計は、エナジードリンク世代の“うっかり”に効く",
          text: "配信・LAN・夜更かしで飲み物が近いのは日常茶飯事。完全防水ではありませんが、液体やホコリに強い設計は、初めて高めの周辺機器を買った人の精神的な安心につながります。",
        },
        {
          emphasis: "有線一本で、設定より“今日から遊ぶ”を優先できる",
          text: "充電・ペアリング・ドライバー地獄を避けたい最初の1台向け。G HUBでライティングをいじる楽しみもありますが、USBを刺してすぐ使える手軽さがエントリーの成功体験を作りやすいです。",
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
      heading: "「最初から競技寄りの入力」を選びたい人の、磁気スイッチ入門",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 / テンキーレス (TKL)" },
        { label: "スイッチ/構造", value: "磁気スイッチ (Hall Effect)" },
        { label: "接続方式", value: "有線 (USB Type-C)" },
        { label: "ポーリングレート", value: "最大 8,000Hz (8K対応)" },
      ],
      reasons: [
        {
          emphasis: "ラピッドトリガーは、FPSの“止まれ・動け”を指先で決める練習",
          text: "キーを離した瞬間に入力が切れる感覚は、メンブレンや一般メカでは味わいにくいもの。A/Dの細かいコントロールや、カウンターストライク系のピークで「一瞬早い」が欲しい人が、エントリー段階から磁気に触れる選択肢です。",
        },
        {
          emphasis: "8Kポーリングは全員必須ではないが、“将来詰める”余地を最初から確保",
          text: "240Hzモニター＋高FPS環境まで揃えてくると、入力の細かさが気になり始めます。1,000Hzから8,000Hzまで上げられるので、今は控えめ設定でも、上達に合わせて掘り下げられます。",
        },
        {
          emphasis: "日本語ソフトで、難しい用語のまま放置しにくい",
          text: "磁気キーボードは設定項目が多く、英語UIだけだと挫折しがちです。アクチュエーションやリセットポイントを日本語で触れると、「自分の指に合うストローク」を試行錯誤しやすくなります。",
        },
        {
          emphasis: "TKLは、マウス側の広さと学習コストのバランス",
          text: "テンキーを捨てる代わりにマウスパッドを広く使えるので、低感度FPSと相性が良いレイアウト。フルサイズに慣れている人は移行期に戸惑いますが、競技寄りに育てたいなら早めのTKL体験も有効です。",
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
      heading: "5,000円以下で“ゲーミングキーボードっぽさ”を最安で試す",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 (JIS) / フルサイズ" },
        { label: "スイッチ/構造", value: "メンブレン" },
        { label: "接続方式", value: "有線 (USB)" },
        { label: "その他", value: "耐水設計 / RGB / メディアキー" },
      ],
      reasons: [
        {
          emphasis: "予算が最優先でも、同時押しで詰まらない最低ラインを押さえる",
          text: "安価なキーボードは複数キー同時押しで入力が飛び、格闘・FPS・アクションで“押したのに反応しない”が起きがちです。アンチゴースト付きは、安い買い物のあとで「やっぱり替えたい」を減らすための保険になります。",
        },
        {
          emphasis: "静音寄りのメンブレンは、家族・ roommate との共存に効く",
          text: "青軸メカのようなカタカタ音に踏み込む前に、夜のゲーム時間を確保したい学生・社会人向け。打鍵音が控えめな分、VCや録画でもキーボード音が前面に出にくいです。",
        },
        {
          emphasis: "耐飛沫120mlは、デスク上のコップを恐れすぎなくていい",
          text: "完全に無茶は禁物ですが、こぼして即終了、となりにくい設計はエントリー機で意外と重要。心理的な余裕があると、周辺機器への投資自体を楽しめます。",
        },
        {
          emphasis: "ライトバー付きRGBは、モチベーション装置として割り切れる",
          text: "性能より“ゲーミングデスクっぽさ”を先に手に入れたい段階向け。プリセットの光り方だけでもテンションが上がるなら、続けてメカや磁気へステップアップするきっかけになります。",
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
      heading: "キーごとに性格を変えたい競技勢の、75%磁気スイッチ",
      specs: [
        { label: "レイアウト", value: "75%" },
        { label: "内部構造", value: "磁気スイッチ" },
        { label: "接続方式", value: "有線（USB）" },
        { label: "機能", value: "ラピッドトリガー搭載" },
      ],
      reasons: [
        {
          emphasis: "0.1mm刻みは、“なんとなく早い”を数値で再現するため",
          text: "WASDだけ浅く、スペースだけ深く、などゲームタイトルごとに最適解が違います。EG Toolでキー単位に詰められると、プロ設定の真似ではなく自分の指長・押し方に合わせた“勝ち筋”を探せます。",
        },
        {
          emphasis: "2ndアクションは、移動キーを離さずにサブ操作を足せる",
          text: "深押しでダッシュやしゃがみ切替など、左手の移動を止めない操作を増やせます。3キー同時までの設計は、上級者向けですが、覚えた瞬間からAPMの使い方が変わります。",
        },
        {
          emphasis: "75%は、マウススペースとファンクションキーの折衷",
          text: "60%より設定・音量・スクショ系に届きやすく、フルよりマウスが楽。デスクが狭いのに競技FPSを本気でやる人が、よく落ち着くサイズ感です。",
        },
        {
          emphasis: "S.P.S Engineは、ラグより“入力のブレ”を減らす方向の設計",
          text: "Speed・Precision・Stabilityを掲げるのは、単発の速さだけでなく、長時間プレイで精度が落ちにくいことも狙い。磁気＋ソフトの組み合わせで、練習時間を設定いじりに使いすぎないよう整えられています。",
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
      heading: "手首を低く保ちたい人の、Logicool磁気ロープロ",
      specs: [
        { label: "配列/サイズ", value: "日本語配列 / テンキーレス" },
        { label: "内部構造", value: "磁気式アナログ (ロープロ)" },
        { label: "接続方式", value: "有線 (USB)" },
        { label: "機能", value: "ラピッドトリガー / SOCD対応" },
      ],
      reasons: [
        {
          emphasis: "22mmロープロは、長時間の“手首の角度”を楽にする",
          text: "高いキー柱のメカは、デスクの高さや椅子の組み合わせ次第で手首が折れやすくなります。薄型は指先から叩く操作に寄せやすく、エイム練習＋長時間ランクマの両方で疲労が溜まりにくいタイプです。",
        },
        {
          emphasis: "アナログ磁気は、軽押しと深押しで別コマンドを分けやすい",
          text: "同じキーに歩行と走行、通常スキルと強化版などを載せると、キー数を増やさず左手の移動量を減らせます。FPSだけでなく、操作密度の高いタイトルで効きます。",
        },
        {
          emphasis: "KEY PRIORITY (SOCD) は、ストレイフの癖をソフトで固定できる",
          text: "A/D同時押し時にどちらを優先するかを選べるので、タイトルごとの“正解”に合わせられます。感覚だけに頼るより、設定で再現性を上げたい競技勢向けです。",
        },
        {
          emphasis: "Logicoolエコシステムで、マウスとセットで設定が揃う",
          text: "G PROマウスなどと同じG HUBでプロファイル管理できると、LAN持ち込み時の準備が楽。磁気キーボードを初めて触る人でも、馴染みのあるソフトでハードルを下げられます。",
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
      heading: "打鍵音で集中を削られたくない人の、国産静電容量フラッグシップ",
      specs: [
        { label: "配列/仕様", value: "日本語配列 / テンキーレス" },
        { label: "キースイッチ", value: "静電容量無接点方式 (静音)" },
        { label: "接続方式", value: "有線（USB）" },
        { label: "機能", value: "ラピッドトリガー / 8000Hz" },
      ],
      reasons: [
        {
          emphasis: "無接点は、チャタリング不安を消して“押し切り”に集中できる",
          text: "物理接点の摩耗で二重入力が出るストレスがなく、ラピッドトリガーと組み合わせても「機材のせいにしにくい」安定感があります。1億回級の耐久は、毎日数時間叩く人の長期戦向けです。",
        },
        {
          emphasis: "静音設計は、VC・配信・夜間ランクの三者を一度に満たしやすい",
          text: "スイッチ本体に加え、ロングキーのグリスなど音対策が総合的。チームゲームでマイクを開きっぱなしにする人ほど、キーボード音が会話のノイズにならない価値を感じやすいです。",
        },
        {
          emphasis: "45g / 30g の荷重選択は、誤爆か瞬発かの性格分け",
          text: "重めは指が当たりっぱなしでも押し間違えにくく、軽めはタップと長押しの切り替えが速い。自分が“底打ち派”か“浮かせ派”か分かっている人ほど、選んだ荷重の差が出ます。",
        },
        {
          emphasis: "REALFORCE CONNECTは、競技設定をシーンごとに切り替える保険",
          text: "キーマップ4面、ポーリング変更、ライティングプリセットなど、タイトルごとにプロファイルを分けられます。見た目は落ち着いたダークグレーで、デスクを派手にせず中身だけ本気、という使い方にも合います。",
        },
      ],
    },
  ],
}

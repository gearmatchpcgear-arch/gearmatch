export type GuideMouseRecommendationId = "beginner" | "pro" | "office"

export type GuideMouseReason =
  | string
  | {
      emphasis: string
      text: string
    }

export type GuideMouseRecommendation = {
  id: GuideMouseRecommendationId
  label: string
  badge: string
  gadgetId: string
  title: string
  modelNumber?: string
  priceLabel?: string
  reasonsHeading?: string
  specs: {
    weight: string
    connection: string
    sensor: string
    sensitivity?: string
    buttons?: string
    battery?: string
  }
  reasons: GuideMouseReason[]
}

export const GUIDE_MOUSE_TABS: { id: GuideMouseRecommendationId; label: string }[] = [
  { id: "beginner", label: "初購入ゲーミングマウス" },
  { id: "pro", label: "高性能ゲーミングマウス" },
  { id: "office", label: "オフィス仕様" },
]

export const GUIDE_MOUSE_RECOMMENDATIONS: GuideMouseRecommendation[] = [
  {
    id: "beginner",
    label: "初購入ゲーミングマウス",
    badge: "コスパ重視・エントリー向け",
    gadgetId: "m-gbs-005",
    title: "Logicool G G203",
    reasonsHeading: "低価格帯のゲーミングマウスエントリーモデル",
    specs: {
      weight: "85g",
      connection: "有線 (USB)",
      sensor: "8,000 DPI オプティカル",
      buttons: "6個（プログラム可能）",
    },
    reasons: [
      {
        emphasis: "【手頃な価格帯】",
        text: "約3,000円台で購入できるため、とにかく予算を抑えてPCゲームを始めてみたい方の最初の1台に最適です。",
      },
      {
        emphasis: "【FF14推奨・6ボタン】",
        text: "6個のプログラムボタンを搭載しており、ファイナルファンタジーXIV推奨モデルとしても認定されています。",
      },
      {
        emphasis: "【1,680万色のRGBライティング】",
        text: "LIGHTSYNCテクノロジーに対応しており、約1,680万色から自分好みにライティングをカスタマイズできます。",
      },
      {
        emphasis: "【有線接続の利点と注意】",
        text: "有線なので充電切れや遅延の心配がない反面、ケーブルの配線が少し気になる場合はマウスバンジーの併用がおすすめです。",
      },
    ],
  },
  {
    id: "pro",
    label: "高性能ゲーミングマウス",
    badge: "FPS・プロ仕様",
    gadgetId: "m-gp3-020",
    title: "Razer Viper V3 Pro",
    modelNumber: "RZ01-05120100-R3A1",
    priceLabel: "￥25,900",
    reasonsHeading: "競技シーンで勝つための最先端プロフェッショナルモデル",
    specs: {
      weight: "54g（超軽量）",
      connection: "2.4GHzワイヤレス (8,000Hz対応)",
      sensor: "35,000 DPI Focus Pro",
      sensitivity: "35,000 DPI Focus Pro",
      buttons: "6個",
    },
    reasons: [
      {
        emphasis: "【54gの超軽量設計】",
        text: "トッププロと共同設計し、完璧な重量バランスを実現。素早く正確なフリック操作を可能にします。",
      },
      {
        emphasis: "【最高峰の無遅延ワイヤレス】",
        text: "最適化されたドングル設計によるHyperSpeed Wirelessを採用。ノイズの多いトーナメント環境でも極めてスムーズで信頼性の高い接続を提供します。",
      },
      {
        emphasis: "【第2世代 Focus Pro センサー】",
        text: "ガラス面でも完璧に追従するプロ級トラッキング性能に加え、1-DPIステップ調整など精密なエイム制御をサポートします。",
      },
      {
        emphasis: "【第3世代 オプティカルスイッチ】",
        text: "チャタリング（二重クリック）を排除し、9,000万回の耐久性を確保。デバウンスディレイなしの0.2msで圧倒的な反応速度を発揮します。",
      },
    ],
  },
]

/** 初購入向け：G203 下部に表示するワンランク上の王道モデル */
export const GUIDE_MOUSE_BEGINNER_UPGRADE = {
  badge: "ワンランク上の王道・プロ仕様",
  gadgetId: "m-gpro-006",
  title: "G PRO X SUPERLIGHT 2 SE",
  modelNumber: "G-PPD-004WLSE-BK",
  specs: {
    weight: "約60g（超軽量）",
    connection: "LIGHTSPEED ワイヤレス",
    sensitivity: "44,000 DPI (HERO 2)",
    buttons: "5個",
  },
  reasons: [
    {
      emphasis: "【プロ愛用の王道モデル】",
      text: "世界中のプロゲーマーやストリーマーが愛用するG PROシリーズ。「絶対に失敗したくない」という方に自信を持っておすすめできる金字塔です。",
      tone: "default" as const,
    },
    {
      emphasis: "【約60gの超軽量設計】",
      text: "長時間のゲームでも手が全く疲れない極上の軽さで、FPSでの素早く正確なエイムを強力にサポートします。",
      tone: "default" as const,
    },
    {
      emphasis: "【LIGHTSPEED遅延ゼロ】",
      text: "独自の無線技術により有線以上の超高速応答を実現。体感遅延ゼロでストレスなくプレイできます。",
      tone: "default" as const,
    },
    {
      emphasis: "【88時間の圧倒的バッテリー】",
      text: "1回の充電で約88時間使用可能。充電の手間を気にせずプレイに没頭できます。",
      tone: "default" as const,
    },
    {
      emphasis: "【価格について】",
      text: "約1.6万円台と高価ですが、価格に見合う最高のパフォーマンスと所有感を得られる1台です。",
      tone: "warning" as const,
    },
  ],
}

/** 初購入向け：G PRO X SUPERLIGHT 2 SE 下部の軽量コスパモデル */
export const GUIDE_MOUSE_BEGINNER_HYPERX = {
  badge: "超軽量・コスパ抜群",
  gadgetId: "hyperx-pulsefire-haste-white",
  title: "HyperX Pulsefire Haste",
  modelNumber: "4P5E3AA",
  heading: "軽量ゲーミングマウスを求める方におすすめ。",
  specs: {
    weight: "59g（超軽量）",
    connection: "有線 (USB)",
    sensitivity: "16,000 DPI",
    buttons: "6個",
  },
  reasons: [
    {
      emphasis: "【59gの驚異的な軽さ】",
      text: "重さがわずか59gの軽量ゲーミングマウス。低価格帯にしては珍しい軽さなので、手頃な価格で軽量モデルを試したい方に最適です。",
    },
    {
      emphasis: "【ワイヤレス版も選択可能】",
      text: "価格は変わりますが、デスク周りをすっきりさせたい方向けにワイヤレスモデルもラインナップされています。",
    },
    {
      emphasis: "【専用グリップテープ付属】",
      text: "コントロール性と心地良さをもう少し高めたいと思われる方のために、左右のマウスボタン用と左右の側面用の簡単に貼り付けられるグリップテープを付属しています。",
    },
  ],
}

/** 高性能向け：Razer Viper V3 Pro 下部の次世代フラッグシップ */
export const GUIDE_MOUSE_PRO_SUPERSTRIKE = {
  badge: "次世代テクノロジー・最高峰",
  gadgetId: "m-gpro-005",
  title: "Logicool G PRO X2 SUPERSTRIKE",
  modelNumber: "G-PPD-004WL-STRKd",
  heading: "最速クリックと最高峰スペックを誇る次世代フラッグシップ",
  specs: {
    weight: "約61g",
    connection: "LIGHTSPEED ワイヤレス (8,000Hz)",
    sensitivity: "44,000 DPI (HERO 2)",
    buttons: "5個",
  },
  reasons: [
    {
      emphasis: "【業界初のHITS搭載で30ms高速化】",
      text: "ボタン部分に業界初のハプティック誘導トリガーシステム(HITS)を採用。連続的かつ即座に押下量を検知することで、従来比最大30ミリ秒のクリック高速化を実現し一瞬の勝負を制します。",
    },
    {
      emphasis: "【ラピッドトリガー＆自由な調整】",
      text: "10段階のアクチュエーションポイント調整に加え、5段階のラピッドトリガー設定に対応。自分好みのクリック感や入力スピードへ精密にチューニングできます。",
    },
    {
      emphasis: "【次世代HERO2センサー】",
      text: "44,000 DPIの解像度、888 IPSの追従性能、88g加速度に対応。わずかな動きも精確に捉え、圧倒的なトラッキング精度を提供します。",
    },
    {
      emphasis: "【体感遅延ゼロのLIGHTSPEED】",
      text: "超高速1msの応答速度と8,000Hzポーリングレートに対応し、有線以上の超低遅延パフォーマンスを発揮します。",
    },
    {
      emphasis: "【90時間バッテリー＆POWERPLAY 2対応】",
      text: "フル充電で約90時間の連続使用が可能なほか、プレイしながらワイヤレス充電できる「POWERPLAY 2」にも対応しています。",
    },
  ],
}

/** 高性能向け：PRO X2 SUPERSTRIKE 下部の多ボタンMMO/MOBAモデル */
export const GUIDE_MOUSE_PRO_G502 = {
  badge: "多ボタン・MMO/MOBA推奨",
  gadgetId: "m-gp3-010",
  title: "Logicool G G502 X LIGHTSPEED",
  modelNumber: "G502XWL-CRBK",
  heading: "多ボタンと先進機能を備えたMMO・MOBA向け万能モデル",
  specs: {
    weight: "約102g",
    connection: "LIGHTSPEED ワイヤレス (USB-C)",
    sensitivity: "25,600 DPI (HERO 25K)",
    buttons: "13個（プログラム可能）",
  },
  reasons: [
    {
      emphasis: "【13個のプログラム可能ボタン】",
      text: "多数のコマンドを割り当て可能な13個のボタンを搭載。FF14などのMMORPGやLoLなどのMOBA、スキル割り当てが多いゲームに最適です。",
    },
    {
      emphasis: "【位置調整・取り外し可能なDPIシフトボタン】",
      text: "手の大きさやプレイスタイルに合わせて親指との距離感を無段階で調整・取り外し可能。指へのフィット感を高めます。",
    },
    {
      emphasis: "【ハイブリッドスイッチ LIGHTFORCE】",
      text: "メカニカルスイッチの心地よいクリック感と、オプティカルスイッチの超高速・高耐久動作を両立した独自の最新スイッチを搭載。",
    },
    {
      emphasis: "【遅延68%削減のLIGHTSPEED】",
      text: "前世代モデルより応答速度が68%高速化した最新のワイヤレスレシーバーを採用し、安定した接続を提供します。",
    },
    {
      emphasis: "【デュアルモード・チルトホイール】",
      text: "スムーズなフリースピンモードと正確なラチェットモードを切り替え可能。左右チルトにより2個の追加操作も登録できます。",
    },
    {
      emphasis: "【HERO 25K センサー】",
      text: "サブミクロンレベルの超高精度を誇り、ゼロスムージング・ゼロ加速で常に最高峰の追従性能を発揮します。",
    },
  ],
}

/** オフィス向け：静音エルゴモデル */
export const GUIDE_MOUSE_OFFICE_TECKNET = {
  badge: "静音・高耐久バッテリー",
  gadgetId: "m-nr-009",
  title: "TECKNET ワイヤレスマウス",
  modelNumber: "EWM01308GY01",
  priceLabel: "￥2,199",
  heading: "静音性とエルゴ設計を備えたマルチデバイス対応オフィスモデル",
  specs: {
    weight: "約80g",
    connection: "Bluetooth 5.0 / 2.4GHzワイヤレス",
    sensitivity: "最大4,800 DPI (6段階調整)",
    buttons: "6個",
  },
  reasons: [
    {
      emphasis: "【静音クリックで快適操作】",
      text: "周囲を気にせず作業できる静音クリック設計を採用。オフィスや図書館、カフェ、Web会議中や夜間の作業でも安心して使用できます。",
    },
    {
      emphasis: "【最大3か月使用の長時間バッテリー】",
      text: "約1.5～2時間のフル充電で、1日2時間使用なら最大3か月間動作。Type-C充電対応で頻繁な充電の手間を大幅に減らせます。",
    },
    {
      emphasis: "【手首の負担を減らす人間工学設計】",
      text: "進化したエルゴノミクス形状と親指レスト・滑り止め加工により、長時間作業するプログラマーやデザイナーの手の疲労を軽減します。",
    },
    {
      emphasis: "【最大4,800DPI・6段階調整】",
      text: "用途に合わせて800～4,800DPIまで6段階で即座に切り替え可能。資料作成から画像・動画編集までスムーズなカーソル操作を実現します。",
    },
  ],
}

/** オフィス向け：TECKNET 下部の SmartWheel 多デバイスモデル */
export const GUIDE_MOUSE_OFFICE_M750 = {
  badge: "SmartWheel・マルチデバイス対応",
  gadgetId: "m-bs-003",
  title: "ロジクール Signature M750MGR",
  modelNumber: "M750MGR",
  priceLabel: "￥4,800",
  heading: "SmartWheelとEasy-Switchを備えた生産性を高めるオフィスモデル",
  specs: {
    weight: "約101.2g",
    connection: "Bluetooth / Logi Boltワイヤレス",
    sensitivity: "400～4,000 DPI (調整可能)",
    buttons: "6個",
  },
  reasons: [
    {
      emphasis: "【高速スクロール SmartWheel】",
      text: "勢いよく回すと高速スクロールへ自動切替。縦に長いExcel文書やWebページも素早く閲覧でき、仕事の生産性を大幅に向上させます。",
    },
    {
      emphasis: "【独自の静音技術 SilentTouch】",
      text: "しっかりとしたクリック感はそのままに、クリック音を従来比90%削減。オフィスやカフェ、Web会議中も周囲を気にせず使用できます。",
    },
    {
      emphasis: "【最大24ヶ月の長寿命設計】",
      text: "単3形乾電池1本で最大24ヶ月動作する長寿命バッテリー。電池交換の手間や備品管理コストを大幅に削減します。",
    },
    {
      emphasis: "【DPI切り替えスイッチ搭載】",
      text: "ホイール下にトラッキング精度を調整できるDPI切り替えスイッチを配置。ボタンひとつで即座にカーソル速度を調整可能です。",
    },
    {
      emphasis: "【3台対応 Easy-Switch】",
      text: "ボタン操作のみで最大3台のデバイスを簡単に切り替え可能。複数のPCやタブレット、異なったOS間をマルチに使いこなせます。",
    },
  ],
}

/** オフィス向け：フラッグシップ生産性モデル */
export const GUIDE_MOUSE_OFFICE_MX_MASTER_3S = {
  badge: "フラッグシップ・作業効率化",
  gadgetId: "m-mx-master-3s",
  title: "Logicool MX MASTER 3S",
  modelNumber: "MX2300GR",
  priceLabel: "￥18,800",
  heading: "圧倒的な作業効率と身体への負担軽減を両立する最高峰マウス",
  specs: {
    weight: "約141g",
    connection: "Logi Bolt (2.4GHz) / Bluetooth",
    sensitivity: "8,000 DPI (Darkfield)",
    buttons: "7個（サムホイール搭載）",
  },
  reasons: [
    {
      emphasis: "【手と手首を自然に支える人間工学デザイン】",
      text: "人間工学に基づき手と手首を自然な位置でサポート。全体の形状が指と手のひらにフィットし長時間の作業でも負担を軽減します。",
    },
    {
      emphasis: "【筋肉の動きを抑える高速・サイドホイール】",
      text: "フリースクロール機能により指の筋肉運動を抑え、親指の自然な動きを利用するサイドホイールで身体への負荷を最小限に抑えます。",
    },
    {
      emphasis: "【8000dpi Darkfield センサー＆静音クリック】",
      text: "ガラス面でも動作する8,000DPI高精度センサーと、作業に集中できる静音クリックを採用しています。",
    },
    {
      emphasis: "【Logi Bolt / Bluetooth ＆ USB-C急速充電】",
      text: "安定したワイヤレス接続に対応し、フル充電で最大70日間動作。複数デバイス間の切り替えもスムーズに行えます。",
    },
  ],
}

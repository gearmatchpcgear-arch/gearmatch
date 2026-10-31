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
    reasonsHeading: "「とりあえず1本」で後悔しない、ゲームデビューの定番",
    specs: {
      weight: "85g",
      connection: "有線 (USB)",
      sensor: "8,000 DPI オプティカル",
      buttons: "6個（プログラム可能）",
    },
    reasons: [
      {
        emphasis: "約3,000円台でも「安物ゲーミングマウス」の洗礼を受けにくい",
        text: "最初の1本は、安さ優先で買ってカーソルが飛ぶ・クリックが気持ち悪いと、ゲーム自体がつまらなくなりがちです。G203はエントリー価格ながらLogicoolのゲーミングラインとして形・ボタン配置・ソフトが揃っており、「とりあえず試す」段階で操作のストレスを最小に抑えられます。",
      },
      {
        emphasis: "サイド2ボタンがあると、最初から“ゲーム用”の感覚が身につく",
        text: "FPSのしゃがみ・マーカー、MMOのターゲット切り替えなど、キーボードだけでは指が届きにくい操作をマウス側に寄せられます。FF XIV推奨モデルでもあり、6ボタンを活かすゲームをこれから広げたい人にも向きます。",
      },
      {
        emphasis: "有線＝“面倒な設定”より“今すぐ遊ぶ”を優先したい人向け",
        text: "充電切れやペアリング失敗を気にせず、USBを刺せばその日から安定して遊べます。ケーブルが気になるデスクならマウスバンジーで浮かせれば、エントリー期間中は十分戦えます。",
      },
      {
        emphasis: "本気のFPSに育てる前の“お試し期間”にちょうどいい重量感",
        text: "85gは競技向けの超軽量ほどではありませんが、日常〜カジュアル競技まで「自分の手の動きとカーソルの距離感」を覚えるのに扱いやすいバランス。慣れてから軽量・無線へ移行する足がかりにもなります。",
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
    reasonsHeading: "「勝ちたい」と決めた人が選ぶ、競技FPSの最前線",
    specs: {
      weight: "54g（超軽量）",
      connection: "2.4GHzワイヤレス (8,000Hz対応)",
      sensor: "35,000 DPI Focus Pro",
      sensitivity: "35,000 DPI Focus Pro",
      buttons: "6個",
    },
    reasons: [
      {
        emphasis: "54gは“数値”ではなく、長時間のエイム疲労との距離",
        text: "大振り→急停止→微修正を何百回も繰り返すFPSでは、1gの差が手首に残ります。Viper V3 Proはプロ選手のフィードバックで重心とグリップ感を詰めた54g級で、「振り切ったあとすぐ止められる」感覚を求める人向けです。",
      },
      {
        emphasis: "LAN・大会会場でも切れにくい無線を、普段から使い倒せる",
        text: "HyperSpeed Wirelessは有線並みの応答をうたうだけでなく、周囲の電波が混む環境でも接続が安定しやすい設計が売りです。本番前に“無線が不安”というメンタル要因を減らしたい競技勢に合います。",
      },
      {
        emphasis: "Focus Pro 2で“センサー起因のミス”を疑いにくくする",
        text: "高速スワイプや低感度の大振りで飛びやすい安価モデルと違い、1DPI刻みの調整や高DPI帯での追従安定性が高く、設定を詰めた人ほど「自分のせいか機材のせいか」を切り分けやすくなります。",
      },
      {
        emphasis: "クリックの取りこぼしが、勝敗の境界線になる人へ",
        text: "第3世代オプティカルスイッチはチャタリング対策と短い応答遅延を両立。連射・ピーク時のクリックが“もたつく”ストレスを減らし、反応勝負のゲームで安心感を足してくれます。",
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
  heading: "「次は長く使える1本」を探している人の、いちばん無難な答え",
  specs: {
    weight: "約60g（超軽量）",
    connection: "LIGHTSPEED ワイヤレス",
    sensitivity: "44,000 DPI (HERO 2)",
    buttons: "5個",
  },
  reasons: [
    {
      emphasis: "プロの配信画面で見かける理由が、スペック表だけでは説明しきれない",
      text: "G PROシリーズが選ばれ続けるのは、形状がシンプルで持ち方の癖に寄り添いやすく、大会・配信・練習で“替えが効きにくい”からです。SEはその系譜の中でも、予算と性能のバランスを取りやすい一本として初めて本格投資する人に向きます。",
      tone: "default" as const,
    },
    {
      emphasis: "約60gは、FPSで“腕が追いつく”感覚を初めて体験しやすいライン",
      text: "85g級から乗り換えると、同じ手の動きで視点がより大きく動くのが分かります。軽すぎて制御不能になる極端さではなく、エイム練習の成果が出やすい重量帯です。",
      tone: "default" as const,
    },
    {
      emphasis: "有線の“確実さ”を捨てても、LIGHTSPEEDで後悔しにくい",
      text: "無線＝不安、という印象を持っている人ほど、普段から無線一本で練習できると試合本番のメンタルが楽になります。応答の速さは競技用として十分検証された世代です。",
      tone: "default" as const,
    },
    {
      emphasis: "88時間級のバッテリーは、生活のリズムを崩さない",
      text: "毎日使うなら「週末に充電を忘れた」が一番の敵。長時間駆動は、デスクに置きっぱなしでも自然に使い続けられる安心材料になります。",
      tone: "default" as const,
    },
    {
      emphasis: "価格は張るが、“安い買い物を2回しない”選択肢",
      text: "約1.6万円台は決して安くありません。ただ、エントリー機→中途半端な中級→本命、と段階を踏むより、早めに本命に寄せた方がトータルでは満足しやすい、という声も多いラインです。",
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
  heading: "予算を抑えつつ“軽さ”を先に体験したい人向け",
  specs: {
    weight: "59g（超軽量）",
    connection: "有線 (USB)",
    sensitivity: "16,000 DPI",
    buttons: "6個",
  },
  reasons: [
    {
      emphasis: "59gは、G203より一気に“競技寄りの動き”に近づける",
      text: "「軽いマウスが自分に合うか試したいけど、いきなり2万円台は怖い」という段階にぴったりです。有線なので設定も単純で、軽量FPSの感触だけをいちばん安く掴みたい人向けです。",
    },
    {
      emphasis: "6ボタンは残しつつ、重量だけプロ寄りに寄せられる",
      text: "サイドボタンでゲームの操作を増やしたい初心者〜中級者が、重量だけ先にアップグレードする選択肢。エイム練習とMMO系の両方を並行している人にも使いやすいです。",
    },
    {
      emphasis: "付属グリップテープで“安いのに滑る”を防ぎやすい",
      text: "軽量モデルは汗や握り方で微調整したくなることが多く、テープ同梱は意外と助かります。購入後すぐに握り心地を整えられ、試行錯誤のハードルを下げてくれます。",
    },
  ],
}

/** 高性能向け：Razer Viper V3 Pro 下部の次世代フラッグシップ */
export const GUIDE_MOUSE_PRO_SUPERSTRIKE = {
  badge: "次世代テクノロジー・最高峰",
  gadgetId: "m-gpro-005",
  title: "Logicool G PRO X2 SUPERSTRIKE",
  modelNumber: "G-PPD-004WL-STRKd",
  heading: "“0.1秒の差”まで削りたい人の、Logicool最上位",
  specs: {
    weight: "約61g",
    connection: "LIGHTSPEED ワイヤレス (8,000Hz)",
    sensitivity: "44,000 DPI (HERO 2)",
    buttons: "5個",
  },
  reasons: [
    {
      emphasis: "HITSは、連射ゲームで“指が追いつかない”感覚を減らすための投資",
      text: "押し込み量を細かく読む仕組みは、単発クリックだけでなく、素早い連打の取りこぼしを減らす方向の設計です。FPSだけでなく、APMが勝敗に直結するタイトルで差が出やすい領域です。",
    },
    {
      emphasis: "ラピッドトリガーで“自分専用のクリック”に寄せられる",
      text: "アクチュエーションや戻しの設定を細かく切れるので、硬めクリック派・浅押し派など、好みがはっきりしている人ほど満足度が上がりやすい一本です。",
    },
    {
      emphasis: "HERO 2は、高DPI帯でも“設定を信じられる”安心感",
      text: "低感度大振りから高感度微修正まで、普段使うDPI帯で飛びやカクつきが少ないと、練習時間を“センサー調査”に使わず済みます。",
    },
    {
      emphasis: "8,000Hzは、高リフレッシュ環境で意味を持つ",
      text: "240Hz以上のモニターと組み合わせ、入力の細かさまで詰めたい人向け。全員に必須ではありませんが、「もう機材ではなく自分の限界を見たい」段階の選択肢です。",
    },
    {
      emphasis: "POWERPLAY 2対応は、充電のストレスを消す",
      text: "マウスパッド上で給電できると、ケーブルを抜き差しする習慣自体が消えます。長時間配信・練習ルーティンを崩したくない人に効きます。",
    },
  ],
}

/** 高性能向け：PRO X2 SUPERSTRIKE 下部の多ボタンMMO/MOBAモデル */
export const GUIDE_MOUSE_PRO_G502 = {
  badge: "多ボタン・MMO/MOBA推奨",
  gadgetId: "m-gp3-010",
  title: "Logicool G G502 X LIGHTSPEED",
  modelNumber: "G502XWL-CRBK",
  heading: "キーボードの左手が常に忙しい、MMO・MOBA勢の“司令塔”",
  specs: {
    weight: "約102g",
    connection: "LIGHTSPEED ワイヤレス (USB-C)",
    sensitivity: "25,600 DPI (HERO 25K)",
    buttons: "13個（プログラム可能）",
  },
  reasons: [
    {
      emphasis: "13ボタンは、スキンローテの“指の体操”をマウス側へ逃がす",
      text: "FF XIVやLoLのように、同じ時間帯に多くのコマンドを叩くゲームでは、左手の疲れとミスがセットで来ます。親指・側面ボタンに処理を分散すると、視線を外さずに操作できる場面が増えます。",
    },
    {
      emphasis: "DPIシフトの位置調整は、手の大きさで失敗しがちな多ボタン機の救い",
      text: "多ボタン機でよくある“届かない・誤爆する”を、ボタン位置の微調整で避けやすい設計。長時間プレイするほど、フィット感の差がストレスとして表れます。",
    },
    {
      emphasis: "102gはFPS向けではないが、据え置き操作の安定感になる",
      text: "軽量FPSマウスとは思想が異なり、デスク上でマウスを“置いて操作する”MMO/MOBAではむしろ動きすぎにくい重量が助けになることも。用途を間違えなければ非常に頼れる一本です。",
    },
    {
      emphasis: "チルトホイールは、インベントリ・スキルバー横スクロールの相棒",
      text: "ラチェットとフリースピンの切替に加え、横スクロール割り当てで、UI操作の手戻りが減ります。ゲーム外のブラウジングでも地味に効きます。",
    },
    {
      emphasis: "無線でも“多ボタン＝有線しか無理”時代の印象を払拭しやすい",
      text: "LIGHTSPEED世代は、ボタン数が多いモデルでも日常プレイで切断ストレスを感じにくいレベルまで来ています。デスクのケーブルを減らしたい長時間プレイヤー向けです。",
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
  heading: "在宅・カフェ・夜更かしでも“クリック音で気まずくならない”第一候補",
  specs: {
    weight: "約80g",
    connection: "Bluetooth 5.0 / 2.4GHzワイヤレス",
    sensitivity: "最大4,800 DPI (6段階調整)",
    buttons: "6個",
  },
  reasons: [
    {
      emphasis: "静音クリックは、会議中の“今、何クリックしてる？”を防ぐ",
      text: "ゲーミングマウスの派手なクリック音は、在宅Web会議やオープン席で意外と目立ちます。TECKNETは作業用として“周囲に配慮しながら速くクリックしたい”人のストレスを下げる選択です。",
    },
    {
      emphasis: "2,000円台で、エルゴ形状＋Bluetooth/2.4GHzの両方",
      text: "オフィスマウスは高いものほど機能が増えがちですが、まず必要なのは静音・握りやすさ・無線の安定。この価格帯でそこを押さえたい学生・副業ワーカー向けです。",
    },
    {
      emphasis: "最大3か月級のバッテリーは、充電ケーブル忘れに強い",
      text: "毎日2時間程度の使用なら、充電を意識する頻度がぐっと減ります。Type-Cなので、スマホと同じケーブルで回せるのも生活では地味に助かります。",
    },
    {
      emphasis: "4,800DPIまで上げられるので、4Kモニター1枚でも破綻しにくい",
      text: "資料作業は低DPI、画像の細部は高DPI、と段階切替できると、デスク上でマウスを大きく動かさず済みます。ゲーム用ではありませんが、クリエイティブの軽作業までカバーしやすいです。",
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
  heading: "ノートPC＋デスクトップを行き来する人の、Logicoolエントリーオフィス",
  specs: {
    weight: "約101.2g",
    connection: "Bluetooth / Logi Boltワイヤレス",
    sensitivity: "400～4,000 DPI (調整可能)",
    buttons: "6個",
  },
  reasons: [
    {
      emphasis: "SmartWheelは、長いExcel・Chatログを“読む作業”の時間を削る",
      text: "勢いよく回したときだけ高速スクロールに入るので、普段の1行ずつ操作感を壊しません。資料レビューやスクロール地獄のWebアプリが多い職種ほど効きます。",
    },
    {
      emphasis: "Easy-Switch 3台は、マウス1個でデスクをスッキリ",
      text: "会社PC・自宅PC・タブレットをボタン1つで切替。レシーバー付きのBoltとBluetoothを使い分けられ、環境ごとに“最適な接続”を選べます。",
    },
    {
      emphasis: "SilentTouchで、オフィスでもカフェでも遠慮なくクリック",
      text: "TECKNETよりBrand信頼とソフト連携を取りにいく中間層。クリック感は残しつつ音を抑えるので、会議中の資料クリックも気になりにくいです。",
    },
    {
      emphasis: "単3電池24ヶ月級は、在庫管理のいらない“会社支給っぽい”安心感",
      text: "充電式ほど頻繁にトップアップしなくてよく、電池さえあれば突然の作業夜にも動きます。法人利用っぽい運用を個人でも再現しやすいです。",
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
  heading: "“マウス操作が仕事のボトルネック”になっている人の最終兵器",
  specs: {
    weight: "約141g",
    connection: "Logi Bolt (2.4GHz) / Bluetooth",
    sensitivity: "8,000 DPI (Darkfield)",
    buttons: "7個（サムホイール搭載）",
  },
  reasons: [
    {
      emphasis: "手のひら全体を預ける形状は、8時間デスクの末に効いてくる",
      text: "つかみ・つまみ中心のゲーミングマウスとは別物で、手首を真っ直ぐに保ちやすい傾斜が設計されています。エンジニア・デザイナー・動画編集者の“夕方の手の重さ”を減らす方向の投資です。",
    },
    {
      emphasis: "親指ホイールは、ショートカットキーより“視線を戻さない”操作",
      text: "ブラウザの戻る/進む、タイムライン移動、Excelのシート切替など、横方向の操作を親指に任せると、作業の流れが途切れにくくなります。覚えた瞬間から生産性が跳ねるタイプの機能です。",
    },
    {
      emphasis: "Darkfieldは、ガラス天板・薄型デスクでも“マウスパッド探し”から解放",
      text: "出張先や自宅の変則デスクでもトラッキングが安定しやすく、環境が変わるほど価値が出ます。8,000DPIまで余裕があるので、ウルトラワイド1枚でもカーソル移動が楽です。",
    },
    {
      emphasis: "高価だが、“安いマウスを何個も試す時間”を買い替える",
      text: "1.8万円台は迷いますが、毎日8時間触る道具として3年使えば、日割りはコーヒー1杯未満です。複数デバイス切替・静音・スクロール性能をまとめて欲しい人の終着点になりやすいモデルです。",
    },
  ],
}

import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"

export type GuideMicRecommendationId = "dynamic" | "condenser"

export const GUIDE_MIC_TABS: { id: GuideMicRecommendationId; label: string }[] = [
  { id: "dynamic", label: "ダイナミックマイクのおすすめ" },
  { id: "condenser", label: "コンデンサーマイクのおすすめ" },
]

export const GUIDE_MIC_LIST_TITLES: Record<GuideMicRecommendationId, string> = {
  dynamic: "ダイナミックマイクのおすすめ",
  condenser: "コンデンサーマイクのおすすめ",
}

export const GUIDE_MIC_PLACEHOLDER_MESSAGE =
  "コンデンサーマイクのおすすめモデルを準備中です。"

export const GUIDE_MIC_RECOMMENDATIONS: Record<
  GuideMicRecommendationId,
  GuideCategoryRecommendation[]
> = {
  dynamic: [
    {
      id: "guide-mic-shure-sm58se-dynamic",
      badge: "定番 / ライブ・配信の世界標準",
      gadgetId: "mic-dyn-009",
      imageUrl: "https://m.media-amazon.com/images/I/61bvhG9P-uL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61yVNJQNdYL._AC_SL1500_.jpg",
      ],
      title: "SHURE SM58SE",
      modelNumber: "SHURE",
      priceLabel: "￥-",
      heading: "「マイクって何買えばいい？」の答えが20年以上変わらない理由",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "50Hz-15kHz" },
        { label: "マイクタイプ:", value: "ダイナミック（スイッチ付）" },
        { label: "接続方式:", value: "XLR" },
      ],
      reasons: [
        {
          emphasis: "カーディオイドは、自宅の生活音を“正面の声”より遠ざける",
          text: "背面・側面のエアコン、換気扇、家族の話し声を相対的に抑えやすく、初めてXLR環境を組む人が「部屋が静かじゃないと無理」と諦めがちな問題を和らげます。配信・VC・歌い配信の最初の1本として迷ったときの定番です。",
        },
        {
          emphasis: "中域の持ち上がりは、Discord/OBSで“聞き取りやすい声”になりやすい",
          text: "フラットすぎるマイクより、会話帯域が前に出るチューニングのため、ゲインを上げすぎずに存在感を出しやすいのがSM58系の強み。歌も話も「埋もれにくい」方向に寄せたい人向けです。",
        },
        {
          emphasis: "内蔵ショックマウント＋ポップ対策は、机の上セッティングの保険",
          text: "ブームアームの振動や机をトンッと叩く音、息のポップを現場で少しずつ吸収。外付けグッズを増やす前の段階でも、聞き手側のストレスを減らしやすいです。",
        },
        {
          emphasis: "壊れにくさは、長く使うほどコスパになる",
          text: "金属ボディと交換可能なグリルは、移動・ライブ・長期据え置きすべてに向くタフさ。安いUSBマイクを何本も買い替えるより、インターフェイスと一緒に長く育てる選択肢になります。",
        },
      ],
    },
    {
      id: "guide-mic-shure-mv7-plus-dynamic",
      badge: "USB/XLR / OBS認証・DSP内蔵",
      gadgetId: "mic-dyn-003",
      imageUrl: "https://m.media-amazon.com/images/I/61m35fH1BLL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/515LuCugyuL._AC_SL1500_.jpg",
      ],
      title: "SHURE MV7+",
      modelNumber: "SHURE",
      priceLabel: "￥-",
      heading: "オーディオIFをまだ買っていない配信者の“今日から始める”本命",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "50Hz ～ 16kHz" },
        { label: "マイクタイプ:", value: "ダイナミック" },
        { label: "接続方式:", value: "USB-C / XLR" },
      ],
      reasons: [
        {
          emphasis: "USB一本で、コンプ・リミッター・デノイズまで触れる",
          text: "配信開始直後は「声が小さい・ノイズが乗る・ポップする」の3点セットで悩みがち。MV7+は本体DSPとMOTIV Mixでオートレベルやデノイザーを触れるため、プラグイン地獄に入る前に“聞ける状態”まで持っていきやすいです。",
        },
        {
          emphasis: "XLRにも伸ばせるので、買い替えではなくステップアップになる",
          text: "最初はUSBで配信し、慣れたらオーディオインターフェイス経由のXLRへ、というルートが取りやすいのがハイブリッドの利点。SM7B系の系譜に近い声質を目指す人の中間地点にもなります。",
        },
        {
          emphasis: "タッチミュートとLEDは、配信中の“あ、ミュート忘れ”を減らす",
          text: "キーボードショートカットより体が覚えやすいタッチパネルは、雑談配信・ゲーム中の急な呼びかけで効きます。視覚的なミュート表示は、視聴者側の安心感にもつながります。",
        },
        {
          emphasis: "外付けポップフィルターなしを狙えるのは、カメラ前の見た目がシンプル",
          text: "デジタルポップ抑制は万能ではありませんが、マスクや近接喋りの環境では外付けガード1枚分のスペースを空けられるメリットがあります。顔出し配信のデスク美観を重視する人向けです。",
        },
      ],
    },
    {
      id: "guide-mic-audio-technica-at2040-dynamic",
      badge: "ハイパーカーディオイド / ショックマウント内蔵",
      gadgetId: "mic-dyn-002",
      imageUrl: "https://m.media-amazon.com/images/I/61H4BAnC+sL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/71jx4DitqgL._AC_SL1500_.jpg",
      ],
      title: "AT2040",
      modelNumber: "オーディオテクニカ (audio-technica)",
      priceLabel: "￥-",
      heading: "キーボード音が入りがちな配信デスク向けの“拾い方が狭い”ダイナミック",
      specs: [
        { label: "指向性:", value: "超単一指向性（ハイパーカーディオイド）" },
        { label: "周波数特性:", value: "80Hz ～ 16kHz" },
        { label: "マイクタイプ:", value: "ダイナミック" },
        { label: "接続方式:", value: "XLR" },
      ],
      reasons: [
        {
          emphasis: "ハイパーカーディオイドは、横から来るノイズをより強く弾く",
          text: "通常のカーディオイドより拾う角度が狭い分、PCファン・キーボード・マウスクリックが横方向から来る環境で“声だけ前に”出しやすいです。部屋の反響よりデスク上の音が悩みの人に向きます。",
        },
        {
          emphasis: "内蔵ショックマウントは、安いアーム＋重いマイクの組み合わせを救いやすい",
          text: "転送振動でカチカチ入る問題は、配信の質を一瞬で下げます。本体一体型のショック対策は、追加パーツを増やさずに打鍵音対策の第一歩になります。",
        },
        {
          emphasis: "低音に厚みがあるので、声が細く聞こえる人の補正になりやすい",
          text: "高域だけ尖る安価マイクと違い、話し声の芯が太く聞こえる方向。ポッドキャストや解説配信で“落ち着いた声”を求める人が満足しやすいバランスです。",
        },
        {
          emphasis: "XLR前提は、ちゃんとゲインを学びたい人の入り口",
          text: "USBマイクの自動ゲインに慣れる前に、インターフェイスでゲインを触る経験ができると、後からSM7Bやコンデンサーへ移っても失敗が少ないです。本気で音を整えたい中級者のダイナミック候補です。",
        },
      ],
    },
  ],
  condenser: [
    {
      id: "guide-mic-rode-nt1-5th-gen-condenser",
      badge: "32bit float / XLR・USBハイブリッド",
      gadgetId: "microphone-rode-nt1-5th-gen",
      imageUrl: "https://m.media-amazon.com/images/I/51-vfZouwQL._AC_SL1500_.jpg",
      title: "RODE NT1（第5世代）",
      modelNumber: "RODE (ロード)",
      priceLabel: "￥-",
      heading: "“録り直し地獄”を減らしたい人の、コンデンサー・ハイブリッド最前線",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "20Hz〜20kHz" },
        { label: "マイクタイプ:", value: "コンデンサー" },
        { label: "接続方式:", value: "XLR、USB-C" },
      ],
      reasons: [
        {
          emphasis: "32bit float（USB）は、叫び・笑い声で波形が潰れる不安を下げる",
          text: "配信・収録で一番悔しいのが「盛り上がった瞬間だけクリップした」こと。USBモードのfloat録音は、後から音量を戻せる余地を残しやすく、初心者ほど設定ミスに寛容な仕様です。",
        },
        {
          emphasis: "4dBA級の低ノイズは、コンデンサー特有の“砂嵐”を恐れにくくする",
          text: "コンデンサーは部屋の静けさを拾いやすい反面、本体ノイズが低いとゲインを上げても声だけが前に出ます。ボーカル・ASMR寄り・ナレーションなど、ディテールを取りにいく用途向けです。",
        },
        {
          emphasis: "XLRに切り替えれば、プリアンプ選びまで含めた本格ルートへ",
          text: "最初はUSBで運用し、部屋の吸音対策やIFを整えた段階でXLRへ、という育て方がしやすいのが第5世代の強み。1本で長い時間軸の投資になります。",
        },
        {
          emphasis: "RØDE Connect / Central は、1台PC配信のミキシングを簡略化",
          text: "マルチトラックやVoxLab調整は、DAWほど敷居が高くない方向にまとまっています。「とにかく今日の配信を聞きやすく」から「もう少し音作り」へ移行しやすいです。",
        },
      ],
    },
    {
      id: "guide-mic-audio-technica-at2020-condenser",
      badge: "エントリーコンデンサーの定番",
      gadgetId: "microphone-audio-technica-at2020",
      imageUrl: "https://m.media-amazon.com/images/I/61y8x7sK8mL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/7146ChhunvL._AC_SL1500_.jpg",
      ],
      title: "オーディオテクニカ AT2020",
      modelNumber: "audio-technica",
      priceLabel: "￥-",
      heading: "「コンデンサーに初めて触る」なら、まずここからで十分戦える",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "20Hz-20kHz" },
        { label: "マイクタイプ:", value: "コンデンサー" },
        { label: "接続方式:", value: "XLR" },
      ],
      reasons: [
        {
          emphasis: "安いからこそ、インターフェイスと部屋の改善に予算を回せる",
          text: "マイク単体に全予算を使うより、48V付きIF・防音・ポップ対策に分散した方が音は伸びやすいです。AT2020は“マイクは十分、あとは環境”という学習順序を作りやすい価格帯です。",
        },
        {
          emphasis: "中高域の抜けは、歌配信・ボーカル録音で“オケに乗る”方向",
          text: "ダイナミックより詳細が出やすい分、声の歯触りが良く聞こえる。ハウリング耐性もエントリーとしては優秀で、ヘッドホン監視しながらのライブ配信でも扱いやすいです。",
        },
        {
          emphasis: "XLR＋48Vは、配信ソフトの自動処理に頼らない第一歩",
          text: "USBマイクの内部処理に慣れると、XLR移行時にゲイン設定でつまずきがち。最初からIFでゲインを触る習慣がつくと、将来のマイク買い替えがスムーズです。",
        },
        {
          emphasis: "世界標準のロングセラーは、設定例やノウハウが検索しやすい",
          text: "困ったときに情報が多いのは、初心者にとって大きな武器。同じ価格帯のマイナー機より、「OBSでAT2020 ゲイン」などの参考記事が見つかりやすいのも実利です。",
        },
      ],
    },
    {
      id: "guide-mic-steelseries-alias-pro-condenser",
      badge: "ミキサー同梱 / デュアルPC配信",
      gadgetId: "mic-strm-0050",
      imageUrl: "https://m.media-amazon.com/images/I/81PIkCNzI4L._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/71d9iZ0omLL._AC_SL1500_.jpg",
      ],
      title: "SteelSeries Alias Pro",
      modelNumber: "SteelSeries",
      priceLabel: "￥-",
      heading: "配信机を“ミキサー卓”にしたいストリーマーのセット買い",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "50Hz-20kHz" },
        { label: "サンプルレート / ビット深度:", value: "24bit / 48kHz" },
        { label: "マイクタイプ:", value: "コンデンサー" },
        { label: "接続方式:", value: "USB Type-C / XLR" },
      ],
      reasons: [
        {
          emphasis: "マイク＋ミキサー同梱は、“あとでミキサー買おう”の断念を防ぐ",
          text: "配信を本気で続けると、いずれ手元の音量・ミュート・BGM操作が欲しくなります。最初から物理ダイヤルがあると、ゲーム中にAlt+Tabでミキサーを触る回数が減り、配信のテンポが安定しやすいです。",
        },
        {
          emphasis: "SonarのAIノイズ抑制は、生活音が避けられない部屋の現実解",
          text: "コンデンサーは部屋を拾いやすいので、ソフト側のノイズ処理とセットで考えるのが現実的。SteelSeriesエコシステムを既に使っている人は、設定の学習コストも低めです。",
        },
        {
          emphasis: "デュアルPC入出力は、配信PCとゲームPC分離の“次の段階”",
          text: "1台に音声を全部載せると、通知音やクラッシュ音まで配信に乗りがち。2系統に分けられると、視聴者に届ける音だけを選びやすく、本番配信の事故を減らせます。",
        },
        {
          emphasis: "大型カプセルは、低い声・落ち着いたトーンの“厚み”を出しやすい",
          text: "高い声だけ尖るマイクより、ナレーション・解説・ラジオ調の配信で聞き心地の良い低中域が出やすい方向。XLR経由でミキサー前段を触る余白も残ります。",
        },
      ],
    },
  ],
}

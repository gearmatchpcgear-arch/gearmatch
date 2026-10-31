import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"

export type GuideAudioInterfaceRecommendationId = "beginner" | "music" | "streaming"

export const GUIDE_AUDIO_INTERFACE_TABS: {
  id: GuideAudioInterfaceRecommendationId
  label: string
}[] = [
  { id: "beginner", label: "初めてのオーディオインターフェイス" },
  { id: "music", label: "音楽作成、録音用" },
  { id: "streaming", label: "配信、動画制作用" },
]

export const GUIDE_AUDIO_INTERFACE_LIST_TITLES: Record<
  GuideAudioInterfaceRecommendationId,
  string
> = {
  beginner: "入門・初心者向けオーディオインターフェイス",
  music: "音楽作成・録音向けオーディオインターフェイス",
  streaming: "配信・動画制作向けオーディオインターフェイス",
}

export const GUIDE_AUDIO_INTERFACE_PLACEHOLDER_MESSAGES: Record<
  Exclude<GuideAudioInterfaceRecommendationId, "beginner">,
  string
> = {
  music: "音楽作成、録音用のおすすめモデルを読み込み中...",
  streaming: "配信、動画制作用のおすすめモデルを読み込み中...",
}

export const GUIDE_AUDIO_INTERFACE_RECOMMENDATIONS: Record<
  GuideAudioInterfaceRecommendationId,
  GuideCategoryRecommendation[]
> = {
  beginner: [
    {
      id: "guide-audio-interface-scarlett-solo-gen4-beginner",
      badge: "定番入門 / Scarlett Solo 第4世代",
      gadgetId: "ai-rank-001",
      imageUrl: "https://m.media-amazon.com/images/I/61wOuqJprgL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61H6ihNjThL._AC_SL1500_.jpg",
      ],
      title: "Focusrite Scarlett Solo 第4世代",
      modelNumber: "Focusrite",
      priceLabel: "￥-",
      heading: "XLRマイクを買ったあと、最初に挿す“定番の1台”",
      specs: [
        { label: "入力端子:", value: "XLR、TRS" },
        { label: "サンプリングレート:", value: "192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "Soloは“マイク1本＋モニター”に絞った失敗しにくい構成",
          text: "入力が多すぎると、どの端子に何を刺すかだけで挫折します。歌・配信・ナレーションの第一歩は、XLRコンデンサー1本＋ヘッドホン監聴が基本。Soloはその最小セットに48Vと本格的なAD変換を載せた定番です。",
        },
        {
          emphasis: "ゲインハローは、音量不足と音割れの“間”を視覚で覚える道具",
          text: "初心者が陥るのは「小さすぎてノイズだらけ」と「大きすぎて歪む」の両方。ノブ周りのLEDが緑〜赤で教えてくれるので、OBSやDAWを触る前に“物理ゲイン”の感覚を体に入れやすいです。",
        },
        {
          emphasis: "Airモードは、暗い部屋のボイスを“手前に”持ってくるスイッチ",
          text: "マイクは正しくても、部屋が響く・高域が足りないと声が埋もれます。Airは魔法ではありませんが、ナレーションやトーク配信で「もう一段クリアに」と感じたときの即効性が高く、後からEQを学ぶ土台になります。",
        },
        {
          emphasis: "付属DAWは、IF到着日に“音が通る喜び”を作る",
          text: "Pro Tools ArtistやAbleton Live Lite付属は、追加課金前に録音→再生の一連を体験できる意味が大きいです。配信だけならOBSでも足りますが、歌ってみた・弾いてみたまで視野にある人ほど、Scarlettの情報量の多さが助けになります。",
        },
      ],
    },
    {
      id: "guide-audio-interface-zoom-ams-22-beginner",
      badge: "1万円以下 / スマホ配信OK",
      gadgetId: "ai-rank-007",
      imageUrl: "https://m.media-amazon.com/images/I/61Q3p4swhnL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61iou9KKssL._AC_SL1500_.jpg",
      ],
      title: "ZOOM AMS-22",
      modelNumber: "ZOOM (ズーム)",
      priceLabel: "￥-",
      heading: "「まず配信の音だけ良くしたい」を最安・最小で試す",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ、3.5mm LINE IN" },
        { label: "サンプリングレート:", value: "24bit / 96kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS/Android)" },
      ],
      reasons: [
        {
          emphasis: "コンパクトな筐体は、リュックに入る“配信救急箱”",
          text: "自宅メイン環境が整う前に、外出先・実家・イベント会場でXLRマイクを使いたい人向け。PCだけでなくスマホ／タブレット対応は、いきなりScarlett級を買って使いこなせない段階の現実解です。",
        },
        {
          emphasis: "ループバックは、OBSの“デスクトップ音声＋マイク”地獄を避ける",
          text: "ゲーム音やBGMを配信に載せるとき、ソフト設定だけだとハウリングや二重ルーティングで詰まりがち。AMS-22のループバックは、雑談・歌枠・実況の“音の混ぜ方”をハード側で素直にする入口です。",
        },
        {
          emphasis: "ダイレクトモニターは、遅延でテンポがズレるのを防ぐ",
          text: "PC経由の監聴はドライバやバッファ設定で遅れます。DIRECT MONITORで自分の声を即座に耳に返すと、歌・トークのリズム感が保たれ、設定に自信がない人ほど安心して録音に集中できます。",
        },
        {
          emphasis: "96kHz/24bitは、配信より“音質の土台”として十分",
          text: "192kHz競争より、48Vでコンデンサーが鳴る・ノイズが少ない・ケーブル1本で給電される——この3点を1万円以下で満たすのがAMS-22の立ち位置。本格DTMへ移る前の踏み台として合理的です。",
        },
      ],
    },
    {
      id: "guide-audio-interface-arturia-minifuse-1-beginner",
      badge: "Hi-Z別口 / ポータブル",
      gadgetId: "ai-search-001",
      imageUrl: "https://m.media-amazon.com/images/I/61htGqFBvzL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61ztGblh5kL._AC_SL1500_.jpg",
      ],
      title: "Arturia MiniFuse 1",
      modelNumber: "Arturia (アートリア)",
      priceLabel: "￥-",
      heading: "ギター＋マイクの“2系統”を、最初からノイズ少なく録りたい人向け",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ ×1、Hi-Z対応 6.35mm ×1" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / 拡張:", value: "USB Type-C (Win/Mac) / ハブ×1" },
      ],
      reasons: [
        {
          emphasis: "Hi-Z専用口は、ギターを“つなぐだけ”でDI箱を省略できる",
          text: "XLRコンボに6.3mmを無理に刺すと、レベル不匹配で小さく歪みます。MiniFuse 1はマイク系と楽器系が分かれているので、歌ってみた＋弾いてみたを同じ1台で始めやすい構成です。",
        },
        {
          emphasis: "Analog Lab Intro付きは、弾いた瞬間に“バンド”が返ってくる",
          text: "エレキ初心者ほど、アンプがなくても音が出る喜びが続けやすいです。Ableton Live Liteと合わせ、IF＝録音箱だけでなく“音作りの入り口”として使えるのがArturiaの強みです。",
        },
        {
          emphasis: "アルミボディ＋USBハブ1口は、ノートPCのポート不足対策",
          text: "USB-C一本給電のノートは、マウス・IF・ストレージでポートが尽きがち。本体にハブがあると、机の上のケーブル本数を増やさずに周辺機器を足せます。持ち運び時も筐体剛性で不安が少ないです。",
        },
        {
          emphasis: "ループバック＋192kHzは、配信と軽いDTMの両方に余裕",
          text: "Scarlett Soloと同系統の用途ですが、楽器入力とソフトバンドルで“音楽寄りの初台”を選びたい人向け。迷ったらSolo、ギターがあるならMiniFuse、という切り分けがしやすいです。",
        },
      ],
    },
  ],
  music: [
    {
      id: "guide-audio-interface-ua-volt-276-music",
      badge: "1176コンプ / ビンテージプリ",
      gadgetId: "audio-interface-ua-volt-276",
      imageUrl: "https://m.media-amazon.com/images/I/51ypv67DvYL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/51ypv67DvYL._AC_SX679_.jpg",
      ],
      title: "Universal Audio Volt 276",
      modelNumber: "Universal Audio",
      priceLabel: "￥-",
      heading: "“録る前に音を作る”派の、宅録ボーカル向けスイッチ付きIF",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB 2.0 (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "ビンテージモードは、DAWプラグイン前に“空気感”を足す",
          text: "フラットに録って後からEQする流派もありますが、歌が乗りにくい人ほど録音段階の倍音が効きます。Voltのトグルは、テイク取りのたびにA/Bできるので、ミックス工程の負担を減らしやすいです。",
        },
        {
          emphasis: "1176系コンプは、小さい声を“前に出す”録り方の近道",
          text: "ゲインを上げすぎずに存在感を出したいボーカルやアコギで、ハード側コンプは判断が早い。外部ループでDAW音を一度アナログ側に通す使い方は、上級者向けですが“音の方向性”を学ぶ教材にもなります。",
        },
        {
          emphasis: "ヘッドホンアンプの余裕は、ミックス判断の疲れを減らす",
          text: "安価IFはヘッドホン出力が弱く、大音量で歪んで気づきにくいミスが出ます。Volt級の出力は、長時間のモニタリングでも定位が崩れにくく、パンチや残響の判断がしやすいです。",
        },
        {
          emphasis: "UAD系プラグイン付属は、ネイティブ環境のCPU負荷を抑えつつ試せる",
          text: "1176/LA-2Aなどの名前付きプラグは、ミックス用語を学ぶモチベーションにもつながります。IF単体の価値＋ソフトの学習価値をセットで考えると、音楽タブの“本命寄り”の1台です。",
        },
      ],
    },
    {
      id: "guide-audio-interface-motu-m2-music",
      badge: "120dB DR / ESS DAC",
      gadgetId: "ai-rank-005",
      imageUrl: "https://m.media-amazon.com/images/I/511Ei9TIaBL._AC_SL1500_.jpg",
      title: "MOTU M2",
      modelNumber: "MOTU",
      priceLabel: "￥-",
      heading: "“モニターで聴く音”を最優先する、2入力の録音・制作向け定番",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ×2, 6.35mm" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "120dB級のDRは、小さく録っても底噪りが気になりにくい",
          text: "ゲインを上げるほどノイズフロアが問題になる環境では、プリの静かさがそのままテイクの使い勝手に効きます。ボーカル1＋アコギ1など2トラック録りの宅録で、後からノイズリダクションに頼りたくない人向けです。",
        },
        {
          emphasis: "ESS DACは、ミックス中の“定位と残響”が読みやすい",
          text: "同じヘッドホンでも、D/Aの解像度でパンチやシンバルの消え方が変わります。M2はリスニング用DACとしても評価が高く、DTM後のハイレゾ視聴まで1台で済ませたい人に刺さりやすいです。",
        },
        {
          emphasis: "フルカラーLCDメーターは、2ch録りの“左右バランス”を即確認",
          text: "DAWを見ずに本体でピークを確認できると、演奏中のクリップを減らせます。ライブ感のあるテイク取りや、DAW画面を見られない位置での録音に便利です。",
        },
        {
          emphasis: "MIDI端子は、古いシンセやドラムマシンを“第3の音源”に",
          text: "入力2chだけに見えますが、MIDI IN/OUTがあると外部シーケンスと同期した制作が開けます。iOS接続もでき、ソファでアイデア録り→デスクで本録り、という流れも取りやすいです。",
        },
      ],
    },
    {
      id: "guide-audio-interface-ssl2-mk2-music",
      badge: "4Kスイッチ / 32bit AD・DA",
      gadgetId: "audio-interface-ssl2-mk2",
      imageUrl: "https://m.media-amazon.com/images/I/615U-87g8DL._AC_SL1500_.jpg",
      title: "SSL2 MkⅡ",
      modelNumber: "Solid State Logic (SSL)",
      priceLabel: "￥-",
      heading: "“SSLっぽい抜け”を録音段階で足したい、2マイク＋2ギター構成",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ ×2、Hi-Z ×2" },
        { label: "サンプリングレート:", value: "32bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "4Kスイッチは、ボーカル1発で“混ざる”方向に振れる",
          text: "EQを深く触る前に、録音時点で高域を持ち上げる選択肢。アコギやボーカルのダブリングで、オケに埋もれないテイクを狙う人向け。好みが分かれる機能なので、テイクごとON/OFF比較ができるのが強みです。",
        },
        {
          emphasis: "32bit録音は、ダイナミクスに余裕のある素材を残す保険",
          text: "激しいパーカッションや叫び声のテイクでヘッドルームを確保しやすく、後からコンプ・リミットをかける余地が増えます。32bitはすべての人に必須ではありませんが、本気の録音素材を残したい人の安心材料です。",
        },
        {
          emphasis: "Hi-Z×2は、ベース＋ギターを同時に“直刺し”する構成向け",
          text: "コンボ入力2＋楽器2で、小さなバンドデモやソングライターの多轨初期録りがしやすい。上面操作レイアウトは、机に置いたままゲインを触る運用と相性が良いです。",
        },
        {
          emphasis: "SSLの名前は、ミックスの“目標音”をイメージしやすくする",
          text: "機材が魔法ではないことは前提ですが、4Kとコンバーター品質で「コンソール寄りの前に出る音」を録る体験は、EQスキル向上の動機になります。Scarlettからのステップアップ枠として選ばれやすい1台です。",
        },
      ],
    },
  ],
  streaming: [
    {
      id: "guide-audio-interface-yamaha-ag06mk2-b-streaming",
      badge: "OBS認証 / ミキサー一体",
      gadgetId: "audio-interface-yamaha-ag06mk2-b",
      imageUrl: "https://m.media-amazon.com/images/I/81UJ5dO6CYL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/81UJ5dO6CYL._AC_SY679_.jpg",
      ],
      title: "AG06MK2 B",
      modelNumber: "ヤマハ (YAMAHA)",
      priceLabel: "￥-",
      heading: "OBSの音声ルーティングで詰まった人の、ミキサー付き“配信卓”",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ, AUX, TRRS" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "48V対応" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "DSPエフェクトは、PC負荷を増やさず“声を整える”",
          text: "配信中にOBSフィルタをいじるとCPUとレイテンシが跳ねます。AG06MK2はコンプ・EQ・リバーブを本体DSPで処理し、ゼロレイテンシ監聴に近い快適さを保ちやすい——トーク配信の定番構成です。",
        },
        {
          emphasis: "ループバックは、ゲーム音とマイクの“配信ミックス”を卓上で",
          text: "デスクトップ音声を載せつつ、自分の声だけコンプをかける、といった配信現場の要望をハード側が理解している設計。6chミキサーなので、ゲーム機・スマホ・キーボード音源を足す余地もあります。",
        },
        {
          emphasis: "OBS認証は、ドライバ・ルーティングの“迷子時間”を減らす",
          text: "公式にテストされた機器は、設定記事やコミュニティ情報も豊富。初めて配信IFを買う人が、YouTubeの古い設定動画でハマるリスクを下げたいときに効きます。",
        },
        {
          emphasis: "TRRSなどスマホ系入力は、ゲスト通話・リモートコラボ向け",
          text: "ZoomやDiscordをスマホ側で回しつつ、メインマイクはXLR——といった複線構成の配信で、入力の種類が多い方が助かる場面があります。歌枠・ラジオ風トークの“番組感”を足したい人向けです。",
        },
      ],
    },
    {
      id: "guide-audio-interface-yamaha-urx22-w-streaming",
      badge: "タッチパネル / Auto Gain",
      gadgetId: "audio-interface-yamaha-urx22-w",
      imageUrl: "https://m.media-amazon.com/images/I/61m7y7QY9KL._AC_SL1500_.jpg",
      title: "URX22 W",
      modelNumber: "ヤマハ (YAMAHA)",
      priceLabel: "￥-",
      heading: "配信前の“音声チェック”を、PC画面から解放したい人向け",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ ×2, Hi-Z, AUX" },
        { label: "サンプリングレート:", value: "32bit / 192kHz" },
        { label: "ファンタム電源:", value: "48V対応" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "LCDタッチは、配信中にOBSを触らずゲイン・FXを直す",
          text: "フルスクリーンゲーム中にAlt+Tabで音声設定を開くストレスは、配信継続の敵です。URX22 Wは本体画面でAuto Gainやエフェクトを触れるので、“声が小さい！”の瞬間対応が速いです。",
        },
        {
          emphasis: "Clip Safe系の自動保護は、叫び・笑い声のクリップを防ぐ",
          text: "エンタメ配信ほど音量の落差が大きく、1回のピークで視聴者体験が悪化します。本体側の保護・ダッキング（GATE/Ducker）は、BGMと声のバランスを自動で整える方向の助けになります。",
        },
        {
          emphasis: "78dBゲインレンジは、ダイナミックマイクでも“足りない”を減らす",
          text: "SM7B等はプリゲインが必要と聞きますが、広いゲインレンジは、マイク選びの自由度を上げます。歌枠＋トーク＋楽器AUXまで見据えた2ch以上の入力も、配信デスク1台に集約しやすいです。",
        },
        {
          emphasis: "32bit/192kHzは、配信後の“アーカイブ用高音質録音”にも余力",
          text: "配信ビットレートとは別に、同時にきれいなテイプを残したい人向け。配信と軽いポッドキャスト録音まで1台でこなせる、多用途なヤマハ上位モデルです。",
        },
      ],
    },
    {
      id: "guide-audio-interface-roland-bridge-cast-x-streaming",
      badge: "HDMIキャプチャ内蔵 / 2PC・ゲーム機",
      gadgetId: "audio-interface-roland-bridge-cast-x",
      imageUrl: "https://m.media-amazon.com/images/I/71RVf00wd-L._AC_SL1500_.jpg",
      title: "BRIDGE CAST X",
      modelNumber: "ローランド (Roland)",
      priceLabel: "￥-",
      heading: "キャプボード＋ミキサー＋2PCを、机の上で1台にまとめる",
      specs: [
        { label: "入力端子:", value: "XLR, HDMI ×2, USB-C ×2, AUX" },
        { label: "サンプリングレート:", value: "24bit / 96kHz" },
        { label: "ファンタム電源:", value: "48V対応 (プリアンプ内蔵)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/PS5/Switch)" },
      ],
      reasons: [
        {
          emphasis: "フェーダー4本は、視聴者が嫌う“ゲーム音デカすぎ”を防ぐ",
          text: "ゲーム・VC・BGM・マイクを同じデジタルフェーダーで触れると、配信開始前の30秒テストでバランスが決まります。OBSのスライダーだけより、体が覚える操作になりやすいのが物理フェーダーの利点です。",
        },
        {
          emphasis: "HDMI×2＋USB IIは、ゲームPCと配信PCの“配線整理”の本命",
          text: "キャプボード・音声IF・ミキサーを別々に買うと、USBポートと電源アダプタが増殖します。BRIDGE CAST Xは、2PC配信の典型構成を1製品に寄せた設計で、机の裏のケーブル本数を減らしたい人向けです。",
        },
        {
          emphasis: "PS5のチャット分離は、VC音量をゲーム音から独立させる",
          text: "コンソール配信で「Discordだけ小さく」が難しい問題に、ハード側のルーティングで答えを出す方向。Switch/PS5勢がPC配信者と同じ“ミックス感”を目指すときの選択肢です。",
        },
        {
          emphasis: "BGM CASTは、著作権と“無音のつなぎ”のストレスを下げる",
          text: "効果音・BGM探しで配信が止まる時間を減らしたい人向け。高音質IFとしてのスペック競争より、番組としての完成度——つまり配信オペレーション全体を楽にする機材です。",
        },
      ],
    },
  ],
}

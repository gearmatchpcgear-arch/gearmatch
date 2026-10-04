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
      badge: "定番入門モデル / 高音質120dB",
      gadgetId: "ai-rank-001",
      imageUrl: "https://m.media-amazon.com/images/I/61wOuqJprgL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61H6ihNjThL._AC_SL1500_.jpg",
      ],
      title: "Focusrite Scarlett Solo 第4世代",
      modelNumber: "Focusrite",
      priceLabel: "￥-",
      heading: "迷ったらこれ！世界中で圧倒的支持を得る超定番の第4世代エントリー機",
      specs: [
        { label: "入力端子:", value: "XLR、TRS" },
        { label: "サンプリングレート:", value: "192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "【120dBの驚異的なダイナミックレンジ】",
          text: "プロスタジオ級の超低ノイズ・超ハイレゾ録音に対応。マイクのポテンシャルを最大限引き出します。",
        },
        {
          emphasis: "【Airモードでボーカルが華やかに】",
          text: "ボタン一つで大型コンソールのようなリッチで澄んだ高音域の倍音成分を加えることができます。",
        },
        {
          emphasis: "【直感的なダイナミックゲインハロー】",
          text: "ノブの周りのLEDが緑〜赤に光るため、適切な入力レベル調整が初心者でもひと目で分かります。",
        },
        {
          emphasis: "【充実した付属バンドルソフト】",
          text: "Pro Tools ArtistやAbleton Live Liteなど、届いたその日から音楽制作・配信が始められるソフトが付属します。",
        },
      ],
    },
    {
      id: "guide-audio-interface-zoom-ams-22-beginner",
      badge: "1万円以下 / 超軽量85g",
      gadgetId: "ai-rank-007",
      imageUrl: "https://m.media-amazon.com/images/I/61Q3p4swhnL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61iou9KKssL._AC_SL1500_.jpg",
      ],
      title: "ZOOM AMS-22",
      modelNumber: "ZOOM (ズーム)",
      priceLabel: "￥-",
      heading: "1万円で手に入る！スマホ・PC対応の超小型・軽量配信向けインターフェース",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ、3.5mm LINE IN" },
        { label: "サンプリングレート:", value: "24bit / 96kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS/Android)" },
      ],
      reasons: [
        {
          emphasis: "【1万円以下の圧倒的コスパ & 超軽量85g】",
          text: "手のひらサイズでわずか85gの超軽量設計。PCだけでなくiPhone/iPad/Androidに対応し、いつでもどこでも手軽に高音質な配信や録音が可能です。",
        },
        {
          emphasis: "【24bit/96kHzのプロクオリティ高音質】",
          text: "コンパクトながら本格的な高音質録音・配信に対応。ステレオL/RのTRS出力とヘッドフォン端子を備え、クリアなモニター環境を実現します。",
        },
        {
          emphasis: "【BGMや歌ってみたに最適「ループバック機能」】",
          text: "PCやスマホ内の音源（BGMやカラオケ伴奏）とマイクの声をリアルタイムでミックスして配信可能。ゲーム実況や雑談配信で大活躍します。",
        },
        {
          emphasis: "【遅延ゼロで聴ける「ダイレクトモニター」】",
          text: "DIRECT MONITORスイッチをONにすれば、パソコンを経由せずに入力音声をヘッドフォンへ直接送るため、音声遅延（レイテンシー）がなく快適に演奏やトークが行えます。",
        },
      ],
    },
    {
      id: "guide-audio-interface-arturia-minifuse-1-beginner",
      badge: "高耐久ボディ / 豪華ソフト付属",
      gadgetId: "ai-search-001",
      imageUrl: "https://m.media-amazon.com/images/I/61htGqFBvzL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61ztGblh5kL._AC_SL1500_.jpg",
      ],
      title: "Arturia MiniFuse 1",
      modelNumber: "Arturia (アートリア)",
      priceLabel: "￥-",
      heading: "高音質・頑丈ボディ・豪華ソフトが揃ったポータブルモデル",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ ×1、Hi-Z対応 6.35mm ×1" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / 拡張:", value: "USB Type-C (Win/Mac) / ハブ×1" },
      ],
      reasons: [
        {
          emphasis: "【エントリーを超えた高品位サウンド & 低ノイズ】",
          text: "110dBの豊かなダイナミックレンジと低ノイズを実現。ダイレクト・モニタリングやループバック機能に加え、便利なUSBハブも1系統搭載しています。",
        },
        {
          emphasis: "【届いてすぐ作曲できる豪華ソフトウェア「バンドル」】",
          text: "定番作曲ソフト（Ableton Live Lite）や高品質シンセ音源（Analog Lab Intro）などが無料でセット（バンドル）されており、追加購入なしで今すぐ音楽制作を始められます。",
        },
        {
          emphasis: "【タフでポータブルな高耐久アルミボディ】",
          text: "頑丈なアルミダイキャスト製ボディと約0.4kgの軽さを両立。自宅はもちろん、移動先のホテルや屋外でのフィールドレコーディングにも最適です。",
        },
        {
          emphasis: "【Hi-Z対応独立入力でギター・ベース録音も快適】",
          text: "マイク用のXLR/TRSコンボ入力とは別に、ギターやベースを直接接続できるHi-Z対応の6.35mm専用端子を搭載。ダイレクトボックス（DI）なしでノイズを抑えたクリアな高音質録音が可能です。",
        },
      ],
    },
  ],
  music: [
    {
      id: "guide-audio-interface-ua-volt-276-music",
      badge: "ビンテージプリアンプ & 1176コンプ搭載",
      gadgetId: "audio-interface-ua-volt-276",
      imageUrl: "https://m.media-amazon.com/images/I/51ypv67DvYL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/51ypv67DvYL._AC_SX679_.jpg",
      ],
      title: "Universal Audio Volt 276",
      modelNumber: "Universal Audio",
      priceLabel: "￥-",
      heading: "スタジオクオリティのアナログサウンドと本格機能を凝縮した名機",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB 2.0 (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "【192kHz/24bit対応 & ビンテージ・マイク・プリアンプ】",
          text: "最高192kHz/24bit対応のクリアなコンバーターと、伝説のチューブプリアンプを再現した「ビンテージ・モード」を搭載。リッチなアルバムクオリティのサウンドが得られます。",
        },
        {
          emphasis: "【76 Compressorによる太く力強い録音 & 外部出し録音】",
          text: "名機「1176」ベースのアナログコンプで太く力強いサウンドを掛け録り可能。さらにDAWで作った音を一度インターフェースから出力し、再び入力に戻してコンプを通す本格的な録音手法にも対応します。",
        },
        {
          emphasis: "【スタジオクオリティのクリアなヘッドフォンアンプ】",
          text: "大音量再生時でも歪みがなく、クリアで高精度なモニタリングを可能にする高品質なヘッドフォンアンプを標準装備しています。",
        },
        {
          emphasis: "【豪華な付属プラグインで届いてすぐ制作】",
          text: "1176 Classic FETコンプ、Teletronix LA-2Aチューブコンプ、UAD Showtime ’64チューブアンプなど、プロ仕様のプラグインが多数付属。セットアップ直後から本格的なスタジオトーンを手に入れることができます。",
        },
      ],
    },
    {
      id: "guide-audio-interface-motu-m2-music",
      badge: "120dB DR / ESS Sabre32 Ultra DAC",
      gadgetId: "ai-rank-005",
      imageUrl: "https://m.media-amazon.com/images/I/511Ei9TIaBL._AC_SL1500_.jpg",
      title: "MOTU M2",
      modelNumber: "MOTU",
      priceLabel: "￥-",
      heading: "同価格帯で最高峰の解像度を誇る本格DAC搭載の定番オーディオインターフェース",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ×2, 6.35mm" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "【数十万円クラスのESS Sabre32 Ultra DAC採用】",
          text: "高級オーディオ機器に使われる「ESS Sabre32 Ultra DAC」を惜しみなく搭載。圧倒的な120dBダイナミックレンジで、極めてクリアな音質を実現しています。",
        },
        {
          emphasis: "【突出したD/A性能と解像感の高い再生音】",
          text: "モニター再生の解像感が非常に高く、楽曲制作やDTM用途はもちろん、ハイレゾオーディオや高音質USB-DACとしてのリスニング・鑑賞用途にも最適です。",
        },
        {
          emphasis: "【レベル調整がひと目でわかるフルカラーLCDディスプレイ】",
          text: "入出力レベルが視覚的にわかりやすいカラーLCDを前面に搭載。入力レベルの確認や適切なゲイン合わせが素早く行え、調整ミスを防げます。",
        },
        {
          emphasis: "【MIDI IN/OUT搭載 & iPhone/iPad接続対応】",
          text: "本体背面にMIDI IN/OUT端子を備え、旧型のハードウェアシンセや外部音源機材ともスムーズに接続可能。さらにPCだけでなくiPhoneやiPad等のiOSデバイスにも対応しています。",
        },
      ],
    },
    {
      id: "guide-audio-interface-ssl2-mk2-music",
      badge: "「4K」スイッチ搭載 / 最高32bit・192kHz",
      gadgetId: "audio-interface-ssl2-mk2",
      imageUrl: "https://m.media-amazon.com/images/I/615U-87g8DL._AC_SL1500_.jpg",
      title: "SSL2 MkⅡ",
      modelNumber: "Solid State Logic (SSL)",
      priceLabel: "￥-",
      heading: "プロ志向の宅録環境を構築する「4K」アナログアンプ搭載モデル",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ ×2、Hi-Z ×2" },
        { label: "サンプリングレート:", value: "32bit / 192kHz" },
        { label: "ファンタム電源:", value: "対応 (+48V)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "【抜けの良い音にする「4K」レガシースイッチ】",
          text: "オンにするだけで高音域が持ち上がり、ヴォーカルやアコースティックギターなど前に出したいトラックで圧倒的な存在感と抜けの良さを生み出します。",
        },
        {
          emphasis: "【次世代32bit / 192kHz対応AD/DAコンバーター】",
          text: "最高32bit/192kHz対応の超ハイレゾコンバーターを搭載。録音時はもちろん、ミックスやマスタリング時のモニター再生でも極めて緻密な解像度を提供します。",
        },
        {
          emphasis: "【卓上で扱いやすい上面集約レイアウト & 前面端子】",
          text: "操作ノブやスイッチがすべて上面に集約されており直感的な調整が可能。前面に配置されたHi-Z入力やヘッドフォン端子によりケーブルの脱着もスムーズです。",
        },
        {
          emphasis: "【プロ志向の宅録環境・ステップアップに最適】",
          text: "「自宅でもプロスタジオ級の高品質サウンドで録音したい」という方にぴったり。初心者からのステップアップや本格的な音楽制作環境に強くおすすめできます。",
        },
      ],
    },
  ],
  streaming: [
    {
      id: "guide-audio-interface-yamaha-ag06mk2-b-streaming",
      badge: "OBS認証取得 / DSPエフェクト搭載定番ミキサー",
      gadgetId: "audio-interface-yamaha-ag06mk2-b",
      imageUrl: "https://m.media-amazon.com/images/I/81UJ5dO6CYL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/81UJ5dO6CYL._AC_SY679_.jpg",
      ],
      title: "AG06MK2 B",
      modelNumber: "ヤマハ (YAMAHA)",
      priceLabel: "￥-",
      heading: "配信に必要な機能をワンタッチ操作で網羅したストリーミングミキサーの定番",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ, AUX, TRRS" },
        { label: "サンプリングレート:", value: "24bit / 192kHz" },
        { label: "ファンタム電源:", value: "48V対応" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "【配信に必須なループバック & 直感的音質調整】",
          text: "PC音声とマイク・楽器音を手軽にミックスできるループバック機能を標準搭載。ボタン一つでコンプレッサーやリバーブ、アンプシミュレーターを適用して音声をワンランク上に仕立てます。",
        },
        {
          emphasis: "【完全ノーレイテンシーの内部DSPチップ処理】",
          text: "音量を整えるCOMP、音域調整のEQ、響きを加えるREVERB、アンプシミュレーターなどのエフェクト処理はすべて本体内部のDSPで行われるため、完全遅延なし（ゼロレイテンシー）で快適に配信可能です。",
        },
        {
          emphasis: "【安心の「OBS Studio」公式機器認証取得】",
          text: "配信定番ソフト「OBS Studio」の公式機器認証を取得しており、接続するだけでシームレスかつ安定したストリーミング体験を実現します。",
        },
        {
          emphasis: "【6chミキサー & 多彩な入力で配信機材を一本化】",
          text: "XLR/TRSコンボ・AUX・TRRSなど配信で使う入力を幅広く備え、6チャンネル分のミキシングを本体で完結。PC・iOS向けUSB Type-C接続で、歌枠やトーク配信の機材構成もすっきりまとめられます。",
        },
      ],
    },
    {
      id: "guide-audio-interface-yamaha-urx22-w-streaming",
      badge: "4.3インチLCDタッチパネル / 78dB広ゲインレンジ",
      gadgetId: "audio-interface-yamaha-urx22-w",
      imageUrl: "https://m.media-amazon.com/images/I/61m7y7QY9KL._AC_SL1500_.jpg",
      title: "URX22 W",
      modelNumber: "ヤマハ (YAMAHA)",
      priceLabel: "￥-",
      heading: "LCDタッチパネルと多彩な内蔵エフェクトで直感操作を極めた高性能インターフェース",
      specs: [
        { label: "入力端子:", value: "XLR/TRSコンボ ×2, Hi-Z, AUX" },
        { label: "サンプリングレート:", value: "32bit / 192kHz" },
        { label: "ファンタム電源:", value: "48V対応" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/iOS)" },
      ],
      reasons: [
        {
          emphasis: "【最高32bit/192kHz & 78dBの余裕あるゲインレンジ】",
          text: "圧倒的な解像感を誇る32bit/192kHzに対応。さらに78dBの広いゲインレンジを確保しており、マイクを選ばず配信から本格的なボーカル・楽器の録音・制作まで幅広く対応します。",
        },
        {
          emphasis: "【PCソフト要らずで操作できる「LCDタッチパネル」搭載】",
          text: "本体前面のタッチパネルでマイク音声の微調整や各種エフェクト設定をダイレクトに完結。配信ソフトやPC画面を開く手間を減らし、直感的なセッティングが可能です。",
        },
        {
          emphasis: "【配信・録音をワンランク上げる8種の本格内蔵エフェクト】",
          text: "Auto Gain（ゲイン自動最適化）、Clip Safe（音割れ防止）、コンプ/EQ、Reverb/Pitch Fix、GATE/Ducker（ノイズ低減・声に合わせてBGM音量を自動減衰）など、本体側で処理できる多彩な機能を標準装備しています。",
        },
        {
          emphasis: "【コンボ×2・Hi-Z/AUXで配信ラインを柔軟に構築】",
          text: "マイク2系統に加えHi-ZやAUX、USB入力まで備え、歌枠・トーク・楽器配信の機材構成を1台に集約。ループバック対応でPC音声とマイクのミックス配信もスムーズです。",
        },
      ],
    },
    {
      id: "guide-audio-interface-roland-bridge-cast-x-streaming",
      badge: "HDMIキャプチャ統合 / 2PC・ゲーム機2台接続対応",
      gadgetId: "audio-interface-roland-bridge-cast-x",
      imageUrl: "https://m.media-amazon.com/images/I/71RVf00wd-L._AC_SL1500_.jpg",
      title: "BRIDGE CAST X",
      modelNumber: "ローランド (Roland)",
      priceLabel: "￥-",
      heading: "ビデオキャプチャと高性能ミキサーが完全統合されたゲーミング＆2PC配信の最高峰",
      specs: [
        { label: "入力端子:", value: "XLR, HDMI ×2, USB-C ×2, AUX" },
        { label: "サンプリングレート:", value: "24bit / 96kHz" },
        { label: "ファンタム電源:", value: "48V対応 (プリアンプ内蔵)" },
        { label: "PC接続 / OS:", value: "USB Type-C (Win/Mac/PS5/Switch)" },
      ],
      reasons: [
        {
          emphasis: "【独立フェーダーで瞬時に音量ミキシング】",
          text: "ゲーム音、ボイスチャット、BGM、自分のマイク音声を独立した専用フェーダーで直感的に調整。視聴者が最も聞き取りやすい理想の音量バランスを瞬時にコントロール可能です。",
        },
        {
          emphasis: "【ケーブル1本で完結する2PC配信 & HDMIスルーアウト】",
          text: "USB IIポートから配信PCへ映像と音声をケーブル1本で送信。音声用USB IやHDMIポートにより、2台のPC連携や外部モニターへのHDMIスルーアウト出力もスムーズに行えます。",
        },
        {
          emphasis: "【ゲーム機2台同時接続 & PS5音声セパレート対応】",
          text: "複雑になりがちなゲーム機接続をシンプル化し、最大2台のゲーム機を取り込み可能。PS5接続時にはチャット音声とゲーム音声をUSB-CとHDMIに分離して個別にコントロールできます。",
        },
        {
          emphasis: "【「BGM CAST」でストレスフリーな楽曲・効果音再生】",
          text: "専用アプリ内の「BGM CAST」を利用すれば、ムードやジャンルを選ぶだけで著作権フリーのBGMや効果音を簡単に配信へ追加。自分好みのプレイリストでストレスなく演出を行えます。",
        },
      ],
    },
  ],
}

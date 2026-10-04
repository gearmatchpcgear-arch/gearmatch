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
      badge: "【定番マイク】世界基準の堅牢性・音質",
      gadgetId: "mic-dyn-009",
      imageUrl: "https://m.media-amazon.com/images/I/61bvhG9P-uL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/61yVNJQNdYL._AC_SL1500_.jpg",
      ],
      title: "SHURE SM58SE",
      modelNumber: "SHURE",
      priceLabel: "￥-",
      heading:
        "ボーカル・ライブ・配信まで迷ったらこれを選べば間違いない世界最高峰の超定番モデル",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "50Hz-15kHz" },
        { label: "マイクタイプ:", value: "ダイナミック（スイッチ付）" },
        { label: "接続方式:", value: "XLR" },
      ],
      reasons: [
        {
          emphasis: "【ノイズを吸収する内蔵ショックマウント & ウインドスクリーン】",
          text: "エアー式ショックマウントシステムが手持ち時の振動音を吸収し、内蔵ウインドスクリーンが吹かれやポップノイズを効果的にカット。アクシデントに強いクリアな音質を保ちます。",
        },
        {
          emphasis: "【近接効果を低減する低音域ロールオフ設計】",
          text: "低音域のロールオフ調整により、マイクに近づいた際のかぶりやボワつき（近接効果）を低減。ライブステージからスタジオ収録まであらゆる環境で安定したパフォーマンスを発揮します。",
        },
        {
          emphasis: "【バンドの音に埋もれない圧倒的に豊かで気持ち良い中域】",
          text: "圧倒的な中域の豊かさを持ち、歌っていても心地よいサウンドを実現。オケに埋もれず音作りがしやすいため、ボーカルはもちろんボイスチャット、ヒューマンビートボックス、司会までこなす万能マイクです。",
        },
        {
          emphasis: "【抜群の耐久性と世界中で手に入る高い信頼性】",
          text: "少々の衝撃では壊れないタフな構造を備え、万一グリルボールが凹んでもパーツ交換で元通りに。長年愛用できる信頼性と世界中どこでも手に入る安心感が魅力です。",
        },
      ],
    },
    {
      id: "guide-mic-shure-mv7-plus-dynamic",
      badge: "OBS認証取得 / USB & XLR出力対応DSPダイナミック",
      gadgetId: "mic-dyn-003",
      imageUrl: "https://m.media-amazon.com/images/I/61m35fH1BLL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/515LuCugyuL._AC_SL1500_.jpg",
      ],
      title: "SHURE MV7+",
      modelNumber: "SHURE",
      priceLabel: "￥-",
      heading:
        "強力なDSP機能とハイブリッド接続を備え、誰でもプロ級サウンドを実現する上位モデル",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "50Hz ～ 16kHz" },
        { label: "マイクタイプ:", value: "ダイナミック" },
        { label: "接続方式:", value: "USB-C / XLR" },
      ],
      reasons: [
        {
          emphasis: "【強力なDSP機能と上質な音声処理】",
          text: "進化したオートレベルモード、デジタルポップフィルター、リアルタイム・デノイザー、リバーブ効果を本体DSPに搭載。タッチ式ミュートパネルも備え、手軽にプロ品質の音声クオリティが得られます。",
        },
        {
          emphasis: "【USB-C & XLRハイブリッド接続 & 専用アプリ連携】",
          text: "手軽なUSB接続とオーディオインターフェースを使うXLR接続の両方に対応。「MOTIV Mix」アプリを使用すれば、DSP設定、LEDパネルの色、EQ、コンプレッサー、リミッターなどを細かくカスタマイズ可能です。",
        },
        {
          emphasis: "【リアルタイム・デノイザー & 外付け不要のポップフィルター】",
          text: "室内の環境ノイズを劇的にカットするデノイザーと、破裂音を抑制するデジタルポップフィルターを内蔵。外付けポップガードが不要になるため、カメラ映えするすっきりしたセッティングが可能です。",
        },
        {
          emphasis: "【MOTIV Mixデスクトップアプリで自由なカスタマイズ】",
          text: "USB-C接続時に内蔵DSPをフル活用可能。鮮やかなLEDタッチパネルのカスタマイズをはじめ、サウンドシグネチャー、ゲイン、EQ、コンプレッサー、リミッターを最適に調整できます。さらに録音機能も備えており、即座にコンテンツ制作をスタートできます。",
        },
      ],
    },
    {
      id: "guide-mic-audio-technica-at2040-dynamic",
      badge: "ハイパーカーディオイド / 一体型ショックマウント内蔵",
      gadgetId: "mic-dyn-002",
      imageUrl: "https://m.media-amazon.com/images/I/61H4BAnC+sL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/71jx4DitqgL._AC_SL1500_.jpg",
      ],
      title: "AT2040",
      modelNumber: "オーディオテクニカ (audio-technica)",
      priceLabel: "￥-",
      heading:
        "環境ノイズに強く低音の厚みと明瞭感を兼ね備えた、配信・ポッドキャスト向け本格ダイナミック",
      specs: [
        { label: "指向性:", value: "超単一指向性（ハイパーカーディオイド）" },
        { label: "周波数特性:", value: "80Hz ～ 16kHz" },
        { label: "マイクタイプ:", value: "ダイナミック" },
        { label: "接続方式:", value: "XLR" },
      ],
      reasons: [
        {
          emphasis: "【ノイズに強い超単一指向性 & リッチな音質】",
          text: "ハイパーカーディオイド（超単一指向性）の集音パターンにより、周囲の環境音をしっかり抑制。低音の豊かな厚みと明瞭感を両立し、配信・ポッドキャスト・VCで聞き取りやすい「プロっぽい声」を作り出せます。",
        },
        {
          emphasis: "【デスクの振動を低減する一体型ショックマウント内蔵】",
          text: "本体内部に専用のショックマウントを内蔵。デスクの打鍵音やマイクスタンド・ブームアームから伝わる不要な振動ノイズを自動的に低減します。",
        },
        {
          emphasis: "【プロ仕様の堅牢なメタルボディ構造】",
          text: "高級感あふれる頑丈なオールメタル構造とスタジオクオリティの音質設計を採用。自宅環境から本格的な配信を行うクリエイターのパフォーマンスを引き上げます。",
        },
        {
          emphasis: "【内蔵ポップフィルターでセッティングをスッキリ】",
          text: "本体にポップフィルターを内蔵。破裂音（ポップノイズ）を抑えつつ、外付けガードを増やさずカメラ映えする配信デスクを組みやすくします。",
        },
      ],
    },
  ],
  condenser: [
    {
      id: "guide-mic-rode-nt1-5th-gen-condenser",
      badge: "32bit float対応 / ハイレゾ録音",
      gadgetId: "microphone-rode-nt1-5th-gen",
      imageUrl: "https://m.media-amazon.com/images/I/51-vfZouwQL._AC_SL1500_.jpg",
      title: "RODE NT1（第5世代）",
      modelNumber: "RODE (ロード)",
      priceLabel: "￥-",
      heading:
        "XLR・USBのハイブリッド接続に対応。32bit float録音や4dBAの超低ノイズ設計を備えたスタジオスペックのコンデンサーマイク",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "20Hz〜20kHz" },
        { label: "マイクタイプ:", value: "コンデンサー" },
        { label: "接続方式:", value: "XLR、USB-C" },
      ],
      reasons: [
        {
          emphasis: "【XLR & USB-Cハイブリッド / 32bit float録音】",
          text: "XLR接続とUSB Type-C接続の両方に対応した革新的なコンデンサーマイク。USB接続時には大音量でも音割れしない「32bit float」録音に対応し、デジタルマイクとしても非常に扱いやすい仕様です。",
        },
        {
          emphasis: "【4dBAの超低ノイズ & 142dB SPLの高耐音圧】",
          text: "セルフノイズはわずか4dBAと驚異的な静音性を誇り、高耐音圧（142dB SPL）と精密なHF6マイクカプセルにより、ボーカルから楽器までノイズを抑えてクリアに収音できます。",
        },
        {
          emphasis: "【内部ショックマウント & ラージダイアフラム】",
          text: "精密なHF6マイクカプセルと内部ショックマウントにより振動ノイズを軽減。ラージダイアフラムを採用しているため丁寧な取り扱い・保管が必要ですが、スタジオクオリティの繊細な収音が可能です。",
        },
        {
          emphasis: "【RØDE Connect / Central の VoxLab エディター】",
          text: "専用アプリ「RØDE Connect」「RØDE Central」内の VoxLab エディターを使えば、直感的かつ詳細な音質パラメーター調整が可能です。",
        },
      ],
    },
    {
      id: "guide-mic-audio-technica-at2020-condenser",
      badge: "定番コスパ / シリーズ累計200万台突破",
      gadgetId: "microphone-audio-technica-at2020",
      imageUrl: "https://m.media-amazon.com/images/I/61y8x7sK8mL._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/7146ChhunvL._AC_SL1500_.jpg",
      ],
      title: "オーディオテクニカ AT2020",
      modelNumber: "audio-technica",
      priceLabel: "￥-",
      heading:
        "安く始めて運用と周辺機材で伸ばせる、全世界で選ばれ続けるエントリーコンデンサーの絶対王者",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "20Hz-20kHz" },
        { label: "マイクタイプ:", value: "コンデンサー" },
        { label: "接続方式:", value: "XLR" },
      ],
      reasons: [
        {
          emphasis: "【低コストで始めて後から育てられる鉄板コスパ】",
          text: "導入のハードルが低く、周辺機材や運用の工夫で音質を伸ばせるのが強み。「まず録って出し、改善して伸ばしたい」初心者やステップアップを目指す方に最適な選択肢です。",
        },
        {
          emphasis: "【世界累計200万台突破のスタジオクオリティ】",
          text: "エントリー価格でありながら、確かなスタジオスペックを実現。全世界のクリエイターから支持される世界標準のロングセラーモデルです。",
        },
        {
          emphasis: "【中高域の明瞭さと優れたハウリング・ノイズ耐性】",
          text: "中～高域の抜けが良くクリアな音質で、オケとの混ざりやすさも抜群。ハウリングや音割れを起こしにくい耐性があり、ライブ配信やボーカル録音でも安定して使用できます。",
        },
        {
          emphasis: "【XLR接続・要48Vファンタム電源】",
          text: "本格的なXLR接続モデルのため、別途48Vファンタム電源を供給できるオーディオインターフェースやミキサーが必要です。",
        },
      ],
    },
    {
      id: "guide-mic-steelseries-alias-pro-condenser",
      badge: "ミキサー付属 / デュアルPC配信対応",
      gadgetId: "mic-strm-0050",
      imageUrl: "https://m.media-amazon.com/images/I/81PIkCNzI4L._AC_SL1500_.jpg",
      imageFallbackUrls: [
        "https://m.media-amazon.com/images/I/71d9iZ0omLL._AC_SL1500_.jpg",
      ],
      title: "SteelSeries Alias Pro",
      modelNumber: "SteelSeries",
      priceLabel: "￥-",
      heading:
        "専用ミキサー＆AIノイズキャンセルで本格的な配信環境を完結できるストリーマー向けモデル",
      specs: [
        { label: "指向性:", value: "単一指向性（カーディオイド）" },
        { label: "周波数特性:", value: "50Hz-20kHz" },
        { label: "サンプルレート / ビット深度:", value: "24bit / 48kHz" },
        { label: "マイクタイプ:", value: "コンデンサー" },
        { label: "接続方式:", value: "USB Type-C / XLR" },
      ],
      reasons: [
        {
          emphasis: "【声の収録に優れる大型カプセル＆部屋のノイズを抑える設計】",
          text: "XLRマイクとミキサーがセットになった配信向けモデル。人の声の低周波数帯をリアルに再現する大型マイクカプセルを採用し、部屋の生活音や騒音を拾いにくく声だけをクリアに捉えます。",
        },
        {
          emphasis: "【音量調整・ミュート・カスタム機能を割り当てられる専用ミキサー】",
          text: "手元で直感的に操作できる付属ミキサー。音量やミュートに加え、カスタマイズ可能なダイヤルとボタンにBGMやヘッドセット音量の調整機能を自由に割り当てられます。",
        },
        {
          emphasis: "【独自ソフト「Sonar」のAIノイズキャンセル＆デュアルPC対応】",
          text: "専用ソフトウェア「Sonar」により高度なAIノイズキャンセリングや細かな音質調整が可能。2台のPCに接続できるデュアル入出力にも対応し、妥協のない配信環境を構築できます。",
        },
        {
          emphasis: "【USB Type-C / XLRハイブリッドで配信からステップアップまで】",
          text: "USB Type-Cで手軽にPC・PS5向け配信を始められ、XLRと付属ミキサー経由の本格運用にも対応。マイク本体とミキサーが一体セットのため、配信デスクをすっきりまとめやすいのも魅力です。",
        },
      ],
    },
  ],
}

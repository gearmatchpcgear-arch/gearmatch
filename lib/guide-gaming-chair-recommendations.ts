import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"

/** ガイド「おすすめモデル一覧」— GTPLAYER GT829-GRAY（マスタ `chair-sr-019` を参照） */
export const GUIDE_GAMING_CHAIR_GT829_GRAY: GuideCategoryRecommendation = {
  id: "gaming-chair-gt829-gray",
  badge: "2万円台 / ベロア・コイル",
  gadgetId: "chair-sr-019",
  title: "GTPLAYER GT829-GRAY",
  heading: "「とりあえずゲーミングチェア」を、座り心地で後悔しない1脚",
  specs: [
    { label: "生地", value: "ベロア生地" },
    { label: "クッション", value: "ポケットコイル" },
    { label: "リクライニング", value: "155°" },
    { label: "オットマン", value: "一体型内蔵" },
  ],
  reasons: [
    {
      emphasis: "ポケットコイルは、安いチェアの“底で止まる”座りを避けやすい",
      text: "厚いウレタンだけだと数ヶ月でへたり、坐骨が硬い床板を直撃しがちです。コイル＋厚みのあるクッションは、体重を分散して“ソファ寄り”の沈み方になり、初めてチェアに投資する人が「硬すぎた」と諦める確率を下げます。",
    },
    {
      emphasis: "ベロア系生地は、夏以外は触り心地の満足度が高い",
      text: "PUレザーの安価モデルより蒸れにくい方向の選択肢として、リビングに置いても違和感が少ない素材感。通気性を最優先するならメッシュ系を見るべきですが、触り心地とコスパのバランスで“最初の一脚”に選ばれやすいです。",
    },
    {
      emphasis: "座面・背幅が広めは、大柄・あぐら派の“窮屈さ”を減らす",
      text: "サイドの盛り上がりが強いチェアは足を組めず、長時間で太ももが圧迫されます。フラット寄りの座面は、ゲームだけでなくテレワークで足の位置を変えやすく、腰以外の部位の疲れにも効きます。",
    },
    {
      emphasis: "155°リク＋内蔵オットマンは、ランク待ち・動画視聴の“仮眠脚”",
      text: "180°までいかなくても、脚を伸ばして背中を預けられると、3時間以上のセッション後の回復が変わります。アーム連動は肘の置き場所を固定し、FPSの低い構えでも肩がすくみにくい配置にしやすいです。",
    },
  ],
}

/** ガイド「おすすめモデル一覧」— AKRacing Pro-X V2 グレー（マスタ `chair-akr-jtt1gm` を参照） */
export const GUIDE_GAMING_CHAIR_AKRACING_PROX_V2_GRAY: GuideCategoryRecommendation = {
  id: "gaming-chair-akracing-prox-v2-gray",
  badge: "5年保証 / 本格エルゴ",
  gadgetId: "chair-akr-jtt1gm",
  title: "AKRacing Pro-X V2 グレー",
  heading: "毎日8時間座る人の、“買い替え周期”を長くする本格派",
  specs: [
    { label: "張地", value: "高耐久PUレザー" },
    { label: "保証", value: "メーカー5年保証" },
    { label: "リクライニング", value: "180°フルフラット" },
    { label: "アームレスト", value: "4D可動" },
  ],
  reasons: [
    {
      emphasis: "5年保証は、チェアを“消耗品”ではなく“家具”として扱う宣言",
      text: "2〜3万円台を2年おきに買い替えるより、フレームと張地の耐久を信頼して長く使う計算がしやすいです。在宅勤務＋夜ゲームで1日10時間近い人ほど、保証と部品供給の安心が効いてきます。",
    },
    {
      emphasis: "550mm幅級の座りは、腰サポーター＋余白で姿勢の余裕が出る",
      text: "狭い座面は骨盤が固定されすぎて、無意識に前傾→腰反りを繰り返します。Pro-X系の横幅と背丈は、ヘッドレスト・ランバーと組み合わせて“背中全体を預ける”方向に寄せやすく、長時間デスクワークの肩こり対策になりやすいです。",
    },
    {
      emphasis: "高密度ウレタン＋着脱ランバーは、好みの反発感を詰められる",
      text: "柔らかすぎるクッションは立ち上がりで腰が痛く、硬すぎると坐骨が痛い——中間の体圧分散フォームは、調整可能なランバーとセットで「腰だけ痛い」を減らす王道構成です。",
    },
    {
      emphasis: "180°フラットと4Dアームは、仕事モード↔休憩モードの切替コストを下げる",
      text: "完全に横になれると、配信合間の15分仮眠や、映画視聴で首だけ前に出すストレスが減ります。4Dアームはデスク高・肘の長さ・ゲームタイトルごとに肘を載せる高さを合わせやすく、首から腕の張りを減らすのが目的です。",
    },
  ],
}

/** ガイド「おすすめモデル一覧」— AutoFull M6 Ultra 2.0（マスタ `chair-sr4-091` を参照） */
export const GUIDE_GAMING_CHAIR_AUTOFULL_M6_ULTRA_2: GuideCategoryRecommendation = {
  id: "gaming-chair-autofull-m6-ultra-2",
  badge: "冷暖・振動 / 自動ランバー",
  gadgetId: "chair-sr4-091",
  title: "AutoFull M6 Ultra 2.0 ゲーミングチェア",
  heading: "「夏は蒸れる・冬は冷える」が座りの最大の敵な人向けフラッグシップ",
  specs: [
    { label: "気候管理", value: "送風・加熱搭載" },
    { label: "ランバー", value: "自動追従機構" },
    { label: "リフレッシュ", value: "振動機能付き" },
    { label: "リクライニング", value: "160°＋オットマン" },
  ],
  reasons: [
    {
      emphasis: "座面の冷風・暖房は、室温より“接触面の不快”を直接いじる",
      text: "エアコンを強くしても背中と座面の間は蒸れ続けることがあります。送風で接触面を冷やす／ヒーターで座面を温める機能は、集中力が切れる原因が“暑さ・寒さ”の人に刺さりやすい、他社には少ない差別化ポイントです。",
    },
    {
      emphasis: "Syncro Lumbarは、前傾プレイでも腰サポートが外れにくい",
      text: "固定ランバーは構えを変えると当たらなくなることが多いです。前後・上下・微回転で追従する腰当ては、FPSの前傾〜リラックス視聴の後傾まで、腰の隙間を埋め続ける設計。長時間の“腰だけ疲れる”を減らす方向の投資です。",
    },
    {
      emphasis: "振動機能は治療器ではないが、セッション間の切り替えには効く",
      text: "ランク終了後や長会議のあと、立ち上がる前の数分で血流と気分を切り替えたい人向け。ゲーム性能ではなく、同じ部屋で生活とプレイを続けるための“リセットボタン”として割り切ると満足度が上がりやすいです。",
    },
    {
      emphasis: "160°＋オットマンは、ハイテク脚でも“足を伸ばす”基本を外さない",
      text: "機能が多い椅子ほど座面が硬くなる例もありますが、脚を伸ばして背中を預けられるリクライニングは、腰・股関節の静止時間を減らす基本中の基本。AutoFullの上位モデルは、ギミックと休息の両方を取りにいくポジションです。",
    },
  ],
  concern: {
    emphasis: "送風・加熱・振動はモバイルバッテリー必須＋ファン音に注意",
    text: "コンセント1本で全部完結ではなく、機能使用前に電源計画が必要です。送風時は弱いファン音が出るため、静かな共有スペースや夜の配信ではマイクに乗る可能性があります。ギミックを毎日使う人向け——使わないならAKRacing等のシンプル本格派の方が向く場合もあります。",
  },
}

export const GUIDE_GAMING_CHAIR_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  GUIDE_GAMING_CHAIR_GT829_GRAY,
  GUIDE_GAMING_CHAIR_AKRACING_PROX_V2_GRAY,
  GUIDE_GAMING_CHAIR_AUTOFULL_M6_ULTRA_2,
]

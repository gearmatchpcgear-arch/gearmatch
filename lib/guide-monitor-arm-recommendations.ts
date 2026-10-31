import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"

/** ガイド「失敗しないモニターアームの選び方」直下のおすすめ（DB は参照のみ・上書きしない） */
export const GUIDE_MONITOR_ARM_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  {
    id: "guide-monitor-arm-ergotron-lx",
    badge: "定番 / 10年保証・メカスプリング",
    gadgetId: "arm-bs-004",
    purchaseUrl: "https://www.amazon.co.jp/dp/B00358RIRC",
    imageUrl: "https://m.media-amazon.com/images/I/61M5A83k1iL._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/610HqQsInRL._AC_SL1500_.jpg",
    ],
    title: "ERGOTRON エルゴトロン LX デスク モニターアーム",
    modelNumber: "ERGOTRON",
    priceLabel: "￥22,900",
    guideRating: 4.7,
    guideReviewCount: 18520,
    heading: "「アームを買い替えない」前提で、首とデスクの両方を整えたい人向け",
    specs: [
      { label: "駆動方式:", value: "メカニカルスプリング" },
      { label: "対応サイズ:", value: "〜34インチ" },
      { label: "耐荷重:", value: "3.2kg 〜 11.3kg" },
      { label: "取付方式:", value: "クランプ / グロメット" },
      { label: "VESA規格:", value: "75×75mm / 100×100mm" },
    ],
    reasons: [
      {
        emphasis: "メカスプリングの“止まる感”は、作業中の微調整ストレスを減らす",
        text: "ガス式より調整のキレが良く、好みの高さで離すとそこに留まりやすいのがLX系の評判です。立ち作業↔座りの切り替え、資料を見るために一時的に下げる、といった1日何度もの動きが軽く感じられます。",
      },
      {
        emphasis: "3.2kg下限は、軽い27インチでも“浮いて見える”を起こしにくい",
        text: "耐荷重の上限だけ見て買うと、軽量モニターでアームが跳ね上がる失敗があります。LXは最小荷重が明記されており、一般的なオフィス〜ゲーミング27インチのレンジと相性が取りやすいです。",
      },
      {
        emphasis: "34インチ・11.3kgまでなら、ウルトラワイド1枚の“本命”にもなる",
        text: "シングルで大きめ1枚を浮かせ、デスク上にキーボード・タブレット・メモ用紙を戻したい人向け。スタンド足を撤去すると奥行きが一気に空き、狭い部屋ほど効きます。",
      },
      {
        emphasis: "10年保証の正規品は、2〜3年で安いアームを買い直すより総コストが読みやすい",
        text: "毎日触る可動部のガタつき・下がりは、安価モデルで経験しがちです。長く同じモニター環境を使う人ほど、最初からLXを選ぶ“買い替えない投資”の意味がはっきりします。",
      },
    ],
  },
  {
    id: "guide-monitor-arm-bontec-single",
    badge: "約4,000円 / 初めてのアーム向け",
    gadgetId: "arm-bs-018",
    imageUrl: "https://m.media-amazon.com/images/I/61y8yD4+D7L._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61A2uZP2B+L._AC_SL1500_.jpg",
    ],
    title: "BONTEC モニターアーム シングル",
    modelNumber: "BONTEC",
    priceLabel: "￥3,980",
    guideRating: 4.4,
    guideReviewCount: 3120,
    heading: "「アームって本当に効くの？」を最小コストで試す1本",
    specs: [
      { label: "駆動方式:", value: "ガススプリング" },
      { label: "対応サイズ:", value: "13〜32インチ" },
      { label: "耐荷重:", value: "2.0kg 〜 9.0kg" },
      { label: "取付方式:", value: "クランプ / グロメット" },
      { label: "VESA規格:", value: "75×75 / 100×100mm" },
    ],
    reasons: [
      {
        emphasis: "スタンド撤去で得られる“デスク奥行き”を、いちばん安く体験できる",
        text: "モニターアームの本当の価値はスペック表より、キーボード前の空きと目線の高さです。4,000円前後でVESA対応の24〜27インチが浮けば、首を前に出す姿勢が改善するかどうかを、高い買い物の前に確かめられます。",
      },
      {
        emphasis: "9kg上限は、32インチ級1枚のシングル構成の現実ライン",
        text: "重いゲーミング32インチを1枚だけ支える用途なら、このクラスの耐荷重は十分なことが多いです。ウルトラワイド34インチや2台構成は別カテゴリ——用途をシングルに絞るとコスパが際立ちます。",
      },
      {
        emphasis: "ガススプリングは、初めてでも“上下に持ち上げて離す”調整が直感的",
        text: "メカ式の張り調整に比べ、入門者が最初の1週間で触る分には分かりやすい操作感です。可動部の精度は高級機には及びませんが、「とりあえず浮かせてみる」第一段階として十分な役割があります。",
      },
      {
        emphasis: "クランプ/グロメット両対応で、賃貸デスクでも選びやすい",
        text: "穴あけ不可のデスクならクランプ、ガッチリ固定したいならグロメット——初めての設置で失敗しやすい“取付方式の不一致”を避けやすいのも、エントリー向きの理由です。",
      },
    ],
  },
  {
    id: "guide-monitor-arm-huanuo-hnds6-dual",
    badge: "デュアル / 二重クランプ",
    gadgetId: "arm-sr-1048",
    purchaseUrl: "https://www.amazon.co.jp/dp/B07W3KK949",
    imageUrl: "https://m.media-amazon.com/images/I/71R2cT3iGgL._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61ZJLx37Z3L._AC_SL1500_.jpg",
    ],
    title: "HUANUO HNDS6 デュアルモニターアーム",
    modelNumber: "HUANUO",
    priceLabel: "￥6,980",
    guideRating: 4.3,
    guideReviewCount: 4250,
    heading: "2画面で“作業用＋サブ”を浮かせ、デスク中央を空けたい人向け",
    specs: [
      { label: "駆動方式:", value: "ガススプリング" },
      { label: "対応サイズ:", value: "13〜32インチ（2画面）" },
      { label: "耐荷重:", value: "各アーム 2.0kg 〜 9.0kg" },
      { label: "取付方式:", value: "二重クランプ / グロメット" },
      { label: "VESA規格:", value: "75×75 / 100×100mm" },
    ],
    reasons: [
      {
        emphasis: "デュアルは、Alt+Tab地獄より“視線移動だけ”で済む作業へ",
        text: "エクセル＋PDF、コード＋ドキュメント、ゲーム＋攻略Wiki——ウィンドウ切替のたびに手が止まる人ほど、物理2枚のメリットが大きいです。アームで両方浮かせれば、デスク中央にノートやタブレットを置く余地も戻ります。",
      },
      {
        emphasis: "二重クランプは、2台ぶんの重量でデスクが揺れる不安を減らす",
        text: "シングル柱1本に2アームを載せるより、土台の固定点が増える設計は、安価デュアルでよくある「デスクごとグラつく」を抑えやすい方向。27インチ×2の重量級でも、据え置きスタンド2個より床面・奥行きはスッキリします。",
      },
      {
        emphasis: "縦置き1枚は、チャット・SNS・縦長Webを“常時表示”に向く",
        text: "片方だけ縦にすると、DiscordやSlack、ショート動画の確認をメイン画面の横に固定できます。配信者のコメント欄、開発者のログビューなど、縦の情報量が多い用途で配置の自由度が上がります。",
      },
    ],
    concern: {
      emphasis: "24インチ以上を2台並べるときは、可動域が窮屈になりやすい",
      text: "仕様上32インチまで対応でも、大きい2枚を大きくパン・チルトしたい場合は柱間距離やアーム長の限界を感じることがあります。大きく動かすより“位置固定で使う”デュアル向き——寸法は設置前にデスク幅とモニターサイズをメモしておくと失敗が減ります。",
    },
  },
]

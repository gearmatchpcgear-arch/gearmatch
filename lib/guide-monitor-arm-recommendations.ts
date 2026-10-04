import type { GuideCategoryRecommendation } from "@/lib/guide-category-recommendations"

/** ガイド「失敗しないモニターアームの選び方」直下のおすすめ（DB は参照のみ・上書きしない） */
export const GUIDE_MONITOR_ARM_RECOMMENDATIONS: GuideCategoryRecommendation[] = [
  {
    id: "guide-monitor-arm-ergotron-lx",
    badge: "圧倒的高耐久 / 滑らかな可動 / エルゴノミクス",
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
    heading:
      "世界中で選ばれる定番モデル。長期使用を前提に、滑らかな可動と確かな設置安定性を両立したデスクマウントアーム",
    specs: [
      { label: "駆動方式:", value: "メカニカルスプリング" },
      { label: "対応サイズ:", value: "〜34インチ" },
      { label: "耐荷重:", value: "3.2kg 〜 11.3kg" },
      { label: "取付方式:", value: "クランプ / グロメット" },
      { label: "VESA規格:", value: "75×75mm / 100×100mm" },
    ],
    reasons: [
      {
        emphasis: "【10年保証付き国内正規品の高耐久性】",
        text: "ERGOTRONブランドならではの品質管理と10年保証により、長期間にわたって安心して使えるモニターアームです。",
      },
      {
        emphasis: "【メカニカルスプリングによる滑らかな可動】",
        text: "上下・左右・前後・チルトを軽い力で調整でき、作業中の画面位置変更や姿勢の切り替えがストレスなく行えます。",
      },
      {
        emphasis: "【34インチ・耐荷重3.2〜11.3kgの実用レンジ】",
        text: "一般的な27〜32インチモニターはもちろん、やや大型の34インチまで対応。最小耐荷重も明記されており、軽量モニターでの跳ね上がりにも配慮できます。",
      },
      {
        emphasis: "【クランプ/グロメット両対応＆人間工学的デザイン】",
        text: "デスク形状に合わせて挟み込みまたは穴あけ固定を選べます。エルゴノミクス設計で、目線の高さを最適化しやすい定番モデルです。",
      },
    ],
  },
  {
    id: "guide-monitor-arm-bontec-single",
    badge: "4000円前後の圧倒的コスパ / 軽量高剛性アルミ / 32インチ対応",
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
    heading:
      "4,000円前後の手頃な価格で高品質アルミ＆ガススプリングを採用した超高コスパモデル",
    specs: [
      { label: "駆動方式:", value: "ガススプリング" },
      { label: "対応サイズ:", value: "13〜32インチ" },
      { label: "耐荷重:", value: "2.0kg 〜 9.0kg" },
      { label: "取付方式:", value: "クランプ / グロメット" },
      { label: "VESA規格:", value: "75×75 / 100×100mm" },
    ],
    reasons: [
      {
        emphasis: "【13〜32インチ・9kg耐荷重の幅広い互換性】",
        text: "標準的なVESA規格（75×75 / 100×100mm）に対応。一般的なビジネスモニターから重量のある32インチゲーミングディスプレイまで安定して支えます。",
      },
      {
        emphasis: "【高剛性アルミニウム＆精密U字ジョイント】",
        text: "軽量ながら耐久性に優れるアルミ素材を採用。モニターの重さを均等に分散し、ぐらつきを抑えたスムーズな位置調整が可能です。",
      },
      {
        emphasis: "【導入しやすい4,000円前後の驚異的価格】",
        text: "ガススプリング式アームとしての基本性能をしっかり抑えつつ低価格を実現。初めてモニターアームを試したい方にも最適です。",
      },
    ],
  },
  {
    id: "guide-monitor-arm-huanuo-hnds6-dual",
    badge: "デュアル画面対応 / 二重クランプ設計 / 作業効率UP",
    gadgetId: "arm-sr-1048",
    purchaseUrl: "https://www.amazon.co.jp/dp/B07W3KK949?th=1",
    imageUrl: "https://m.media-amazon.com/images/I/71R2cT3iGgL._AC_SL1500_.jpg",
    imageFallbackUrls: [
      "https://m.media-amazon.com/images/I/61ZJLx37Z3L._AC_SL1500_.jpg",
    ],
    title: "HUANUO HNDS6 デュアルモニターアーム",
    modelNumber: "HUANUO",
    priceLabel: "￥6,980",
    guideRating: 4.3,
    guideReviewCount: 4250,
    heading:
      "二重クランプの圧倒的安定感で作業領域を拡張する2画面対応デュアルアーム",
    specs: [
      { label: "駆動方式:", value: "ガススプリング" },
      { label: "対応サイズ:", value: "13〜32インチ（2画面）" },
      { label: "耐荷重:", value: "各アーム 2.0kg 〜 9.0kg" },
      { label: "取付方式:", value: "二重クランプ / グロメット" },
      { label: "VESA規格:", value: "75×75 / 100×100mm" },
    ],
    reasons: [
      {
        emphasis: "【二重クランプ構造で大型2画面もがっちり固定】",
        text: "土台に2本のクランプ金具を採用した強固な設計。重量のあるデュアル構成でもデスクにしっかり固定でき、グラつきや転倒の不安を軽減します。",
      },
      {
        emphasis: "【横並び・縦置き自由自在で作業効率アップ】",
        text: "2画面並べて広大な作業スペースを作れるほか、片方を縦置きにしてWeb閲覧やコード確認、ゲーム中の攻略チャット表示などレイアウトを自由にカスタマイズ可能です。",
      },
      {
        emphasis: "【設置時の注意・サイズ感のポイント】",
        text: "仕様上32インチまで対応しますが、24インチ以上の大きめモニターを2台装着する場合、アームの可動範囲（可動域）がやや狭まり窮屈さを感じる場合があります。頻繁に大きく動かしたい方は配置に留意してください。",
      },
    ],
  },
]

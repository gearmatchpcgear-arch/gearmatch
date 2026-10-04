import type { CategoryId } from "@/lib/gadgets"
import { GUIDE_GAMING_CHAIR_RECOMMENDATIONS } from "@/lib/guide-gaming-chair-recommendations"

export type GuideCategoryReason = {
  emphasis: string
  text: string
}

export type GuideCategorySpec = {
  label: string
  value: string
}

export type GuideCategoryRecommendation = {
  id: string
  badge: string
  gadgetId?: string
  /** ガイドカード用の固定商品画像（未指定時は gadget.image） */
  imageUrl?: string
  /** 画像読み込み失敗時に試す追加 URL（Amazon 代替ホスト等） */
  imageFallbackUrls?: string[]
  title: string
  modelNumber?: string
  priceLabel: string
  heading: string
  specs: GuideCategorySpec[]
  reasons: GuideCategoryReason[]
  /** おすすめ理由の下に表示する懸念・留意点（任意） */
  concern?: GuideCategoryReason
  /** ガイド表示用 Amazon URL（未指定時は gadget の purchaseUrl） */
  purchaseUrl?: string
  /** ガイド表示用評価（未指定時は gadget.rating） */
  guideRating?: number
  /** ガイド表示用レビュー件数（未指定時は gadget.reviews） */
  guideReviewCount?: number
}

const PLACEHOLDER_REASONS: GuideCategoryRecommendation["reasons"] = [
  {
    emphasis: "【ポイント1】",
    text: "おすすめポイントの詳細テキストが入ります。",
  },
  {
    emphasis: "【ポイント2】",
    text: "おすすめポイントの詳細テキストが入ります。",
  },
  {
    emphasis: "【ポイント3】",
    text: "おすすめポイントの詳細テキストが入ります。",
  },
  {
    emphasis: "【ポイント4】",
    text: "おすすめポイントの詳細テキストが入ります。",
  },
]

function createPlaceholderPick(
  id: string,
  badge: string,
  specLabels: [string, string, string, string],
): GuideCategoryRecommendation {
  return {
    id,
    badge,
    title: "商品名（未設定）",
    modelNumber: "型番・メーカー名",
    priceLabel: "￥-",
    heading: "キャッチコピー・おすすめの見出し",
    specs: specLabels.map((label) => ({ label, value: "-" })),
    reasons: PLACEHOLDER_REASONS,
  }
}

export type GuideCategoryRecommendationId = Exclude<
  CategoryId,
  "mouse" | "keyboard" | "audio-interface" | "mic" | "camera" | "monitor-arm"
>

export const GUIDE_CATEGORY_RECOMMENDATIONS: Record<
  GuideCategoryRecommendationId,
  GuideCategoryRecommendation[]
> = {
  monitor: [
    createPlaceholderPick("monitor-placeholder-1", "タグ / モニター", [
      "サイズ",
      "解像度",
      "リフレッシュレート",
      "パネル",
    ]),
  ],
  "gaming-chair": GUIDE_GAMING_CHAIR_RECOMMENDATIONS,
}

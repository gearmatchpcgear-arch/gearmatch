/**
 * 商品画像の表示制御。
 * 本番は既定で表示。Amazon 審査などで非表示にする場合のみ
 * ビルド時に `NEXT_PUBLIC_HIDE_PRODUCT_IMAGES=true` を明示する。
 */
export function areProductImagesHiddenForReview(): boolean {
  const env = process.env.NEXT_PUBLIC_HIDE_PRODUCT_IMAGES?.trim().toLowerCase()
  return env === "true" || env === "1"
}

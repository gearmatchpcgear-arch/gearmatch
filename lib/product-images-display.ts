import { HIDE_PRODUCT_IMAGES_FOR_REVIEW } from "./site-config"

/** 審査用に商品画像を出さないとき true */
export function areProductImagesHiddenForReview(): boolean {
  const env = process.env.NEXT_PUBLIC_HIDE_PRODUCT_IMAGES?.trim().toLowerCase()
  if (env === "true" || env === "1") return true
  if (env === "false" || env === "0") return false
  return HIDE_PRODUCT_IMAGES_FOR_REVIEW
}

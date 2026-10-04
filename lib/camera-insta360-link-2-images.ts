/** Insta360 Link 2（ASIN B0DDTH3HX8）— 画像マスター（Hotlink 回避のためローカル優先） */

export const INSTA360_LINK_2_GADGET_ID = "cam-str-038-3hx8"
export const INSTA360_LINK_2_GUIDE_PICK_ID = "guide-camera-insta360-link-2"

export const INSTA360_LINK_2_LOCAL_IMAGE = "/images/cameras/insta360-link-2.jpg"

/** Amazon 公式画像（ローカル読み込み失敗時・順不同で試行） */
export const INSTA360_LINK_2_AMAZON_IMAGES = [
  "https://m.media-amazon.com/images/I/619mZp-f0L._AC_SL1500_.jpg",
  "https://m.media-amazon.com/images/I/51R6zRz7EVL._AC_SL1500_.jpg",
] as const

/** ガイド・一覧・詳細で参照する主画像 */
export const INSTA360_LINK_2_IMAGE_URL = INSTA360_LINK_2_LOCAL_IMAGE

export function isInsta360Link2ImageSource(src: string | undefined): boolean {
  if (!src) return false
  if (src === INSTA360_LINK_2_LOCAL_IMAGE) return true
  return INSTA360_LINK_2_AMAZON_IMAGES.some((url) => src === url)
}

export function isInsta360Link2ProductRef(
  pickId: string | undefined,
  gadgetId: string | undefined,
): boolean {
  return pickId === INSTA360_LINK_2_GUIDE_PICK_ID || gadgetId === INSTA360_LINK_2_GADGET_ID
}

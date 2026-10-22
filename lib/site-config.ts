/** 本番サイトの正規オリジン（末尾スラッシュなし） */
export const SITE_ORIGIN = "https://pcgearmatch.com"

/** sitemap / canonical 用。`NEXT_PUBLIC_SITE_URL` があればそちらを優先 */
export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) return raw.replace(/\/+$/, "")
  return SITE_ORIGIN
}

export const SITE_NAME = "PC GearMatch"
export const SITE_NAME_JA = "PCギアマッチ"
/** ヘッダー H1 横・下に表示するキャッチ（検索キーワードを自然に含める） */
export const SITE_TAGLINE =
  "ゲーミングデバイス・PC周辺機器の比較・検索"
export const SITE_HEADER_SUBLINE =
  "ゲーミングマウス・キーボード・モニター・マイク等の価格・スペック比較"
export const SITE_TITLE = `${SITE_NAME}（${SITE_NAME_JA}） | ゲーミングマウス・キーボード・モニター等デバイス比較・検索サイト`
export const SITE_DESCRIPTION =
  "PCギアマッチ（PC GearMatch）は、ゲーミングマウス・キーボード・モニター・マイク・Webカメラ・モニターアームなど、ゲーミング・PC周辺機器の価格とスペックを一覧で比較・検索できるサイト。条件絞り込みと用途別ガイドで失敗しないデバイス選びをサポート。"

/** お問い合わせ先（環境変数 NEXT_PUBLIC_CONTACT_EMAIL で上書き可能） */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "gearmatch.pcgear@gmail.com"

export const SITE_OPERATOR_NAME = "松本展明"

/**
 * Amazon 審査中は true（商品画像を非表示）。審査通過後は false に戻す。
 * 環境変数 `NEXT_PUBLIC_HIDE_PRODUCT_IMAGES`（true/false）で上書き可能。
 */
export const HIDE_PRODUCT_IMAGES_FOR_REVIEW = true

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "PC GearMatch は、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。"

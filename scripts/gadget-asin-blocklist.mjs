/**
 * ASINs that must not appear as keyboard/mouse/monitor body cards,
 * plus helpers to detect ranking/scrape title ↔ Amazon product mismatches.
 */
import { isKeyboardAccessoryTitle } from "./keyboard-accessory.mjs"

/** Known wrong ASINs (accessories, tools, ranking scrape mismatches). */
export const BLOCKED_GADGET_ASINS = new Set([
  "B077T9391Z", // Razer Tartarus V2 (ranking title was Keychron K2 Max)
  "B07SDQ2ZGN", // key/switch puller tool
  "B0CD56D3XQ", // Typestick TS01
  "B0FT89PKYC", // ActionRing stream controller deck
  "B0FSF1SP2Q", // Mouserpad v2 left-hand device
  "B0GVXX2YJ4", // glowing keyboard keychain (ranking title was EWIN keyboard)
  "B09BFWB28Z", // 10-pack keycaps only (ranking title was DAREU COOL68)
  "B0GXV87C2D", // switch/keycap puller tool (ranking title was Perixx keyboard)
  "B0H9Z1X3ZG", // HP laptop replacement keyboard part
])

export function isBlockedGadgetAsin(asin) {
  return BLOCKED_GADGET_ASINS.has(String(asin ?? "").toUpperCase())
}

export function amazonTitleFromSpecCache(specCache, asin) {
  const cached = specCache?.[asin]
  if (!cached) return null
  return cached.specs?.title || cached.title || null
}

/** Exclude when fetched Amazon title is clearly not a keyboard/monitor/mic body. */
export function isExcludedByAmazonSpecTitle(asin, specCache) {
  const title = amazonTitleFromSpecCache(specCache, asin)
  if (!title) return false

  if (isKeyboardAccessoryTitle(title)) return true

  if (/キーホルダー|キーリング|keychain|商品種別.*キーチェーン|fidget toy|フィジットトイ/i.test(title)) {
    return true
  }

  if (/交換用.*ノート|ノート\s*pc\s*交換|repair replacement|修理交換用|replacement keyboard/i.test(title)) {
    return true
  }

  if (
    /キーキャップのみ|keycap only|キーキャップセット|\d+個.*キーキャップ|キーキャップ.*\d+個/i.test(title) &&
    !/メカニカルキーボード|ゲーミングキーボード|キーボード本体/i.test(title)
  ) {
    return true
  }

  if (/引抜器|puller|スイッチ引抜|key puller|switch puller/i.test(title) && !/キーボード/i.test(title)) {
    return true
  }

  return false
}

export function shouldExcludeKeyboardEntry(entry, specCache, titleExcludedFn) {
  const asin = entry.asin
  const rankingTitle = entry.title ?? entry.name ?? ""
  if (isBlockedGadgetAsin(asin)) return true
  if (titleExcludedFn?.(rankingTitle)) return true
  if (isExcludedByAmazonSpecTitle(asin, specCache)) return true
  return false
}

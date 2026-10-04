/**
 * ゲーミングキーボード売れ筋2ページ目から除外（標準キーボード本体以外）
 */
import {
  isKeyboardAccessoryTitle,
  isKeyboardMouseComboTitle,
} from "./keyboard-accessory.mjs"

/** 左手デバイス・ノブ付きマクロパッド・片手キーボード等（標準キーボード本体ではない） */
export function isGamingKeyboardLeftHandOrMacroPad(title) {
  const t = String(title).toLowerCase()

  if (/左手デバイス|left.?hand device/i.test(t)) return true
  if (/koolertron|coolertron/i.test(t)) return true
  if (/tartarus|vsdinside|brimford/i.test(t) && /左手|left.?hand|マクロ|キーパッド|ノブ/i.test(t)) {
    return true
  }
  if (/片手(?:ゲーミング)?キーボード|左手キーボード|one.?handed.*(?:gaming\s*)?keyboard|left.?hand.*keyboard/i.test(t)) {
    return true
  }
  if (/ジョイスティック.*ホイール.*\d+キー|\d+キー.*ジョイスティック.*ホイール/i.test(t)) {
    return true
  }
  if (
    /(?:ノブ付き|ノブ付|プログラマブルノブ).*(?:マクロキーパッド|マクロパッド|キーパッド単体|左手)|(?:マクロキーパッド|マクロパッド|キーパッド単体|左手).*(?:ノブ付き|ノブ付|プログラマブルノブ)/i.test(
      t,
    ) &&
    !/フルサイズ|108キー|104キー|98キー|91キー|87キー|81キー|75%|65%|60%|テンキー付|テンキーレス|tenkeyless|ゲーミングキーボード/i.test(
      t,
    )
  ) {
    return true
  }
  if (
    /\d+\s*キー.*(?:マクロキーパッド|マクロパッド|ノブ付き)|(?:マクロキーパッド|マクロパッド|ノブ付き).*\d+\s*キー/i.test(
      t,
    ) &&
    !/フルサイズ|108キー|104キー|98キー|91キー|87キー|81キー|75%|65%|60%|テンキー/i.test(t)
  ) {
    return true
  }

  return false
}

export function isGamingKeyboardBestsellersPage2Excluded(title) {
  return (
    isKeyboardAccessoryTitle(title) ||
    isKeyboardMouseComboTitle(title) ||
    isGamingKeyboardLeftHandOrMacroPad(title)
  )
}

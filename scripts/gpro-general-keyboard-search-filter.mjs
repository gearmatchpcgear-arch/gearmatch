/**
 * Amazon gpro 一般検索 page3: キーボード本体のみ通す
 */
import {
  isKeyboardAccessoryTitle,
  isKeyboardMouseComboTitle,
} from "./keyboard-accessory.mjs"

export function isGproKeyboardSearchExcluded(title) {
  const t = String(title ?? "")
  const tl = t.toLowerCase()
  if (!t.trim()) return true

  if (!/キーボード|keyboard|フットスイッチ|foot switch|foot pedal|マクロキー/i.test(t)) {
    return true
  }

  if (/gaming mouse|ゲーミングマウス|g-ppd-|wireless mouse|\bmouse\b/i.test(tl) && !/keyboard|キーボード|g-pkb/i.test(tl)) {
    return true
  }

  if (/headset|ヘッドセット|イヤホン|earphone|headphone|condenser microphone|マイク付きヘッド/i.test(tl)) {
    return true
  }

  if (/mouse pad|マウスパッド|g240|g-pmp|cross surface/i.test(tl) && /keyboard|キーボード|g-pkb/i.test(tl)) {
    return true
  }
  if (/g-pkb.*\+|\+.*g240|keyboard.*mouse pad|キーボード.*マウスパッド/i.test(tl)) {
    return true
  }

  if (/grip tape|グリップテープ|mouse sole|マウスソール|replacement cable|audio cable|earpad|headphone cable/i.test(tl)) {
    return true
  }

  if (/replacement switch accessory|replacement switch|交換用.*スイッチ|gx switch.*accessory|替えスイッチ/i.test(tl)) {
    return true
  }

  if (isKeyboardAccessoryTitle(t)) return true
  if (isKeyboardMouseComboTitle(t)) return true

  if (/putter|golf|launch monitor/i.test(tl)) return true

  return false
}

export function isGproKeyboardSearchKeyboard(title) {
  return !isGproKeyboardSearchExcluded(title)
}

/**
 * Amazon gpro 一般検索（全ブランド）: マウス本体のみ通す
 */
import { isMouseAccessory } from "./mouse-accessory-filter.mjs"

function isLikelyMouseBody(title) {
  const t = String(title ?? "")
  const tl = t.toLowerCase()
  return (
    /ゲーミングマウス|gaming mouse/i.test(t) &&
    /sensor|dpi|programmable buttons|wired|wireless|有線|ワイヤレス|lightspeed|hyperspeed/i.test(tl) &&
    !/for logicool|for logitech|for razer|replacement gaming mouse sole|skates for/i.test(tl)
  )
}

export function isGproGeneralSearchExcluded(title) {
  const t = String(title ?? "")
  const tl = t.toLowerCase()
  if (!t.trim()) return true

  if (isMouseAccessory(t) && !isLikelyMouseBody(t)) return true

  // キーボード
  if (/キーボード|keyboard|g-pkb|gaming keyboard|tenkeyless keyboard|tkl keyboard|magnetic gaming keyboard/i.test(tl)) {
    return true
  }

  // ヘッドセット・イヤホン・マイク
  if (
    /ヘッドセット|headset|イヤホン|earphone|earbud|ヘッドホン|headphone|condenser microphone|gaming headset|wireless headset/i.test(
      tl,
    )
  ) {
    return true
  }

  // ヘッドセット用イヤーパッド・ケーブル
  if (
    /earpad|ear pad|ear cushion|ear cup|replacement cable|audio cable|headphone cable|ヘッドフォン.*ケーブル|イヤーパッド|gaming headphone audio cable/i.test(
      tl,
    )
  ) {
    return true
  }

  // マウスパッド単体・マウス+パッドセット
  if (/mouse pad|マウスパッド|mousepad|mouse mat|collaboration pad|cross surface/i.test(tl)) {
    if (!/ゲーミングマウス|gaming mouse/i.test(tl) || /\+\s*g240|g240.*\+|mouse pad.*\+|\+.*mouse pad/i.test(tl)) {
      return true
    }
  }
  if (/マウスパッド.*セット|セット.*マウスパッド|mouse\s*[+＋]\s*pad|mouse\s*\+\s*mouse\s*pad/i.test(tl)) {
    return true
  }

  // マウスソール・グリップテープ（第三者製 / 交換用）
  if (/mouse sole|マウスソール|mouse skate|mouse feet|mouse skates|mouse skates/i.test(tl)) {
    const isMouseBody =
      /ゲーミングマウス|gaming mouse/i.test(tl) &&
      /sensor|dpi|programmable buttons|wired|wireless|有線|ワイヤレス/i.test(tl) &&
      !/for logicool|for logitech|for razer|replacement|交換|skates for|sole for/i.test(tl)
    if (!isMouseBody) return true
  }
  if (/anti-slip tape for logicool|armor series anti-slip|mouse grip, grip tape/i.test(tl)) {
    return true
  }

  // 充電ケーブル・交換部品単体
  if (/charging cable|charger usb|compatible charging cable|replacement switch accessory|replacement gaming mouse sole/i.test(tl)) {
    return true
  }

  // ゴルフ・化粧品など gpro キーワードの別商品
  if (/putter|golf|grip tape thin|g-pro edge|g-pro gel|launch monitor|zeroputt/i.test(tl)) {
    return true
  }

  // マウス本体を示す語が無い
  if (!/ゲーミングマウス|gaming mouse|ワイヤレス.*マウス|wireless.*mouse|\bmouse\b|マウス/i.test(t)) {
    return true
  }

  return false
}

export function isGproGeneralSearchMouse(title) {
  return !isGproGeneralSearchExcluded(title)
}

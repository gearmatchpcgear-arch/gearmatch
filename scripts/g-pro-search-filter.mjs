/**
 * Amazon G-PRO 検索結果: Logicool G PRO マウス本体のみ通す
 */
import { isMouseAccessory } from "./mouse-accessory-filter.mjs"

export function isGProSearchExcluded(title) {
  const t = String(title ?? "")
  const tl = t.toLowerCase()
  if (!t.trim()) return true

  if (isMouseAccessory(t)) return true

  // Logicool G 製品のみ（Elecom EX-G PRO 等を除外）
  if (!/logicool\s*g|logitech\s*g|ロジクール\s*g/i.test(t)) return true

  // キーボード
  if (/キーボード|keyboard|g-pkb/i.test(tl)) return true

  // ヘッドセット・イヤホン
  if (
    /ヘッドセット|headset|イヤホン|earphone|earbud|ヘッドホン|gaming headset|in-ear/i.test(tl)
  ) {
    return true
  }

  // ヘッドセット用マイク等
  if (
    /マイク交換|replacement.*microphone|microphone.*replacement|替えマイク|gaming microphone|microphone boom/i.test(
      tl,
    )
  ) {
    return true
  }

  // マウスパッド単体・マウス+パッドセット
  if (/g-pmp|マウスパッド|mouse pad|mousepad|mouse mat/i.test(tl)) {
    return true
  }
  if (/マウスパッド.*セット|セット.*マウスパッド|マウス\s*[＋+]\s*マウスパッド|mouse\s*[+＋]\s*pad/i.test(tl)) {
    return true
  }
  if (/\+\s*マウスパッド|マウスパッド\s*\+/i.test(tl)) return true
  if (/\+\s*(?:mouse pad|g240|g-pmp|mp10)/i.test(tl)) return true
  if (/(?:mouse pad|g240|g-pmp|mp10gr).+\+/i.test(tl)) return true
  if (/mouse\s*\+\s*mouse\s*pad/i.test(tl)) return true

  // レーシング周辺機器
  if (/shifter|ステアリング|driving force|ドライビングフォース|ハンドル|レーシング/i.test(tl) && !/g-ppd-/i.test(t)) {
    return true
  }

  // マウスソール・グリップテープ（第三者製含む）
  if (/mouse sole|マウスソール|ソール for|feet for|mouse feet|グリップテープ|grip tape|grip grip/i.test(tl) && !/g-ppd-/i.test(t)) {
    return true
  }

  // レシーバー・ドングル単体
  if (/g-pro-wl-4krc|g-pro-wl|4krc\b/i.test(tl)) return true
  if (
    /レシーバー|receiver|ドングル|dongle/i.test(tl) &&
    /取替|交換|replacement|ユーザー向け|専用.*レシーバー|レシーバー.*専用|対応.*ドングル|マウスレシーバー/i.test(tl) &&
    !/g-ppd-/i.test(t)
  ) {
    return true
  }
  if (/8000hz.*レシーバー|レシーバー.*8000hz|8k.*ポーリング.*レシーバー/i.test(tl) && !/g-ppd-/i.test(t)) {
    return true
  }

  // グリップテープ（マウス本体名のみの表記を除外）
  if (/アンチスリップテープ|滑り止め.*テープ|grip tape|グリップテープ|グリップ\s*テープ/i.test(tl) && !/g-ppd-/i.test(t)) {
    return true
  }

  // マウス本体を示す語が無い
  if (!/ゲーミングマウス|gaming mouse|ゲーミング マウス|ワイヤレス.*マウス|\bマウス\b|\bmouse\b/i.test(t)) {
    return true
  }

  // G PRO シリーズ（G304 SUPERLIGHT 等は除外）
  if (!isGProSeriesTitle(t)) return true

  return false
}

function isGProSeriesTitle(title) {
  if (/g-ppd-/i.test(title)) return true
  if (/\bg[\s-]?pro\b/i.test(title)) return true
  if (/pro x superlight|pro x2 superstrike|pro 2 lightspeed|gpro|superlight 2c|2c コンパクト/i.test(title)) return true
  if (/\bg304x?\b/i.test(title)) return true
  return false
}

export function isGProSearchMouse(title) {
  return !isGProSearchExcluded(title)
}

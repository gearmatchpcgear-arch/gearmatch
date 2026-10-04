/**
 * パソコン用キーボード新着ランキングから除外する商品（本体以外）
 */
import {
  isKeyboardAccessoryTitle,
  isKeyboardMouseComboTitle,
} from "./keyboard-accessory.mjs"

export function isPcKeyboardNewReleaseExcluded(title) {
  const t = String(title).toLowerCase()

  if (isKeyboardAccessoryTitle(title) || isKeyboardMouseComboTitle(title)) {
    return true
  }

  if (/修理交換用|交換用.*キーボード|replacement keyboard|キーボードパーツ|keyboard part/i.test(t)) {
    return true
  }

  if (/有線化改造|有線化|適用する.*キーボード|互換用キーボード|ノートパソコン\s*キーボード/i.test(t)) {
    return true
  }

  if (/キートップセット|keycap set|キーキャップセット|ブランクキーキャップ/i.test(t)) {
    return true
  }

  if (/単一キー|1キー.*ボタン|ショートカットキー.*1個|マクロキーパッド|ミニキーパッド|キーパッド.*ノブ|ストリーミングデッキ|stream deck/i.test(t)) {
    if (!/フルキーボード|フルサイズ|108キー|104キー|メカニカルキーボード/i.test(t)) {
      return true
    }
  }

  if (
    /磁気スイッチ|サイレントスイッチ|キースイッチ.*セット|スイッチ.*\d+個|outemu.*スイッチ/i.test(t) &&
    !/メカニカルキーボード|ゲーミングキーボード|キーボード.*軸/i.test(t)
  ) {
    return true
  }

  if (/トラックパッド一体化|マジックトラックパッド.*一体化/i.test(t)) {
    return true
  }

  if (
    /テンキーパッド|テンキー\s*パッド|ナンバーパッド|numpad|number pad|数字キーパッド|18キー.*テンキー|テンキー.*18キー/i.test(
      t,
    ) &&
    !/フルキーボード|フルサイズ|108キー|104キー|キーボード.*テンキー付/i.test(t)
  ) {
    return true
  }

  if (/キーパッド単体|numpad only|テンキーのみ|数字キーのみ/i.test(t)) {
    return true
  }

  if (
    /カバー|ケース|case|cover|保護フィルム|フィルム|screen protector|シリコンカバー/i.test(t) &&
    !/キーボード一体|キーボード付|一体型|type cover|タイプカバー/i.test(t) &&
    /onexplayer|steam deck|タブレット|ipad|surface go/i.test(t)
  ) {
    return true
  }

  if (/onexplayer.*カバー|カバーキーボード.*onex/i.test(t) && !/bluetooth.*キーボード/i.test(t)) {
    return true
  }

  if (!/キーボード|keyboard/i.test(t)) {
    return true
  }

  return false
}

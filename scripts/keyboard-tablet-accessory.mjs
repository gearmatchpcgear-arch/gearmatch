/**
 * タブレット用キーボード売れ筋から除外する商品（ケース単体・アクセサリー等）
 */
export function isTabletKeyboardExcluded(title) {
  const t = String(title).toLowerCase()

  if (/スタイラス|stylus|apple pencil|ペン先|タッチペン|active pen|画面保護|保護フィルム|ガラスフィルム|フィルム\s*2枚|screen protector|tempered glass/i.test(t)) {
    return true
  }

  if (/キーボードカバー|keyboard cover|dust cover|防塵カバー/i.test(t) && !/一体|付き|ケース/i.test(t)) {
    return true
  }

  if (/ケース|case|カバー|cover|folio/i.test(t) && !/キーボード|keyboard|smart keyboard|magic keyboard/i.test(t)) {
    return true
  }

  if (!/キーボード|keyboard|smart keyboard|magic keyboard|type cover|folio keyboard/i.test(t)) {
    return true
  }

  if (/キースイッチ|key switch|キーキャップ|keycap|キー補修|keycap set|交換用.*キー/i.test(t) && !/キーボードケース|keyboard case|一体型/i.test(t)) {
    return true
  }

  if (/magic trackpad|トラックパッド単体|trackpad\s*\(/i.test(t) && !/キーボード|keyboard/i.test(t)) {
    return true
  }

  if (/キーボードカバー|keyboard cover/i.test(t) && /magic keyboard/i.test(t) && !/一体|付き|ケース|folio/i.test(t)) {
    return true
  }

  if (/マウスセット|keyboard\s*[&＆]\s*mouse|mouse\s*[&＆]\s*keyboard/i.test(t)) {
    return true
  }

  return false
}

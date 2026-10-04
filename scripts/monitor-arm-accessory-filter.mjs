/**
 * モニターアーム売れ筋ランキングから「本体以外」を厳格に除外
 */

/** 無条件除外（パーツ・アクセサリー単体） */
const HARD_EXCLUDE_RE =
  /補強プレート|補強板|reinforcement\s*plate|as-mabo\d|bma-p1|gh-npha|100-la065|archiss.*プレート|bauhutte.*補強|バウヒュッテ.*補強|ノート\s*pc\s*トレイ|ノートpcトレイ|ノートパソコン用トレイ|ノートpcトレイ単|ノートpcトレー付|ノートpcトレー付き|ノートパソコン.*トレー|トレー付.*ノート|ノートpcホルダ|laptop\s*tray|laptop\s*holder|laptop\s*mount\s*tray|vesa\s*アダプタ|vesaアダプタ|vesa変換|vesa変換プレート|変換プレート|変換アダプタ|vesa\s*マウント\s*アダプタ|マウント\s*アダプタ|マウントアダプタ|dpa[\s-]?wqb|nb-vs7510|クイックリリース|quick\s*release|qr\s*プレート|60-589-060|モニターアーム用\s*プレート|アーム用\s*プレート|取付用\s*プレート|マウント\s*プレート|ブラケット\s*のみ|ブラケット単|ヘッド\s*のみ|ヘッド単|ポール\s*のみ|ポール単|延長\s*ポール|extension\s*pole|ケーブル\s*クリップ|ケーブル\s*ホルダ|配線\s*カバー|配線\s*トレー|工具\s*セット|スペーサー|spacer|ネジ\s*セット|screw\s*kit|vesa\s*plate|mounting\s*plate|desk\s*mount\s*adapter|壁掛け金具|壁掛け\s*金具|wall\s*mount\s*bracket|100-law\d{3}|テレビ\s*壁掛け|モニター\s*壁掛け|ノートパソコンアーム|ノートpcアーム|ノートパソコン\s*スタンド.*モニターアーム|モバイルモニター.*マグネット|タブレット兼用.*マグネット|マグネットホルダー付き.*モバイル|アームマウントトレイ|マウントトレイ\s*スチール|デュアルディスプレイスタンド.*デスクトップマウント|ノートpc\s*マウントトレイ|マウントトレイ.*vesa|マジックアーム|magic\s*arm|カメラモニターアーム|カメラ用アーム|撮影用アーム|自撮りアーム|三脚アーム|グロメット\s*パーツ|グロメット\s*単体|グロメット\s*のみ|grommet\s*only|grommet\s*kit|モニターハンドル|ディスプレイ把手|ディスプレイハンドル|monitor\s*handle|display\s*handle|アーム取付用把手|取付用把手|フロア移動カート|フロアスタンド|floor\s*cart|floor\s*stand|キャスター付き|キャスター付|6画面.*スタンド|スタンドマウント.*フロア|逆さ吊り|逆吊り|吊り下げ専用|ノートpc.*壁掛け|ノートパソコン.*壁掛け|laptop.*wall\s*mount/i

/** モニターアーム本体の明示キーワード */
const ARM_BODY_RE =
  /モニターアーム|monitor\s*arm|ディスプレイアーム|display\s*arm|gas\s*spring\s*arm|ガススプリング/i

/** 先頭がアクセサリー系ブランド＋パーツ */
const ACCESSORY_HEAD_RE =
  /^(?:ZepSon|Archiss|HumanCentric|BONTEC|VIVO|WALI)\s/i

/** ASIN blocklist: accessories / misclassified listings */
const ACCESSORY_ASINS = new Set([
  "B07DHK5DHN",
  "B0GWQ3Z4MJ",
  "B0DWSBXNL8",
  "B07MC5TCS8",
  "B0GNPL4R8D",
  "B0DDQ9GJ2Q",
  "B09YY7H5CH",
  "B0FYGD7SDW",
])

export function isMonitorArmAccessory(title) {
  const t = String(title).trim()
  if (!t) return true

  if (HARD_EXCLUDE_RE.test(t)) return true

  if (/^(?:補強|取付用|交換用|予備|追加|専用)\s/i.test(t) && !ARM_BODY_RE.test(t)) {
    return true
  }

  if (/壁掛け|wall\s*mount/i.test(t) && !/モニターアーム|monitor\s*arm|デスクマウント|desk\s*mount/i.test(t)) {
    return true
  }

  if (/vesa\s*変換|変換プレート|マウントアダプタ|アダプター/i.test(t) && !/モニターアーム|monitor\s*arm/i.test(t)) {
    return true
  }

  if (/トレイ|ホルダー|プレート|アダプタ|ブラケット/i.test(t) && !ARM_BODY_RE.test(t)) {
    return true
  }

  if (/ノート\s*pc|ノートパソコン|laptop/i.test(t) && /トレイ|トレー|ホルダ/i.test(t)) {
    return true
  }

  if (ACCESSORY_HEAD_RE.test(t) && /プレート|トレイ|ホルダ|アダプタ/i.test(t)) {
    return true
  }

  if (/^VESA\s*\d/i.test(t) && !ARM_BODY_RE.test(t)) return true

  if (/デスク設置用.*スチール製|高さ調節可能.*デスク設置用/i.test(t) && !/モニターアーム|monitor\s*arm|ガススプリング|gas\s*spring/i.test(t)) {
    return true
  }

  if (/^(?:for|対応)\s/i.test(t) && !ARM_BODY_RE.test(t)) return true

  if (/マジックアーム|magic\s*arm/i.test(t) && !/モニターアーム|monitor\s*arm|ディスプレイアーム|display\s*arm/i.test(t)) {
    return true
  }

  if (/関節アーム/i.test(t) && !/モニターアーム|monitor\s*arm|ディスプレイアーム|display\s*arm|壁掛け/i.test(t)) {
    return true
  }

  if (/カメラ|camera|撮影|自撮り|三脚/i.test(t) && /アーム/i.test(t) && !/モニターアーム|monitor\s*arm|ディスプレイアーム|display\s*arm|ガススプリング|gas\s*spring/i.test(t)) {
    return true
  }

  if (/モニターハンドル|ディスプレイ把手|ディスプレイハンドル|monitor\s*handle|display\s*handle|取付用把手/i.test(t)) {
    return true
  }

  if (/フロア移動|フロアスタンド|floor\s*cart|floor\s*stand|キャスター/i.test(t) && /スタンド|stand|cart/i.test(t)) {
    return true
  }

  if (/ノート\s*pc|ノートパソコン|laptop/i.test(t) && /壁掛け|wall\s*mount|逆さ吊|逆吊/i.test(t)) {
    return true
  }

  if (/ノート\s*pc|ノートパソコン|laptop/i.test(t) && /アーム|arm|スタンド|stand/i.test(t) && !/pcモニター|pc\s*monitor|モニターアーム|monitor\s*arm|ディスプレイアーム|display\s*arm/i.test(t)) {
    return true
  }

  if (/逆さ吊|逆吊り/i.test(t) && !/モニターアーム|monitor\s*arm|ディスプレイアーム/i.test(t)) {
    return true
  }

  return false
}

export function isMonitorArmBody(title, asin) {
  const t = String(title).trim()
  if (asin && ACCESSORY_ASINS.has(String(asin).toUpperCase())) return false
  if (isMonitorArmAccessory(t)) return false
  if (/ノート\s*pc|ノートパソコン|laptop/i.test(t) && !/pcモニター|pc\s*monitor|モニターアーム|monitor\s*arm|ディスプレイアーム|display\s*arm/i.test(t)) {
    return false
  }
  return (
    ARM_BODY_RE.test(t) ||
    /シングル|デュアル|トリプル|single|dual|triple|gas\s*spring|ガススプリング|ergotron|エルゴトロン|huanuo|ファーノー|pixio|dpa-|wall\s*ma|ma1/i.test(
      t,
    )
  )
}

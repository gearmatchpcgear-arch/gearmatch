/**
 * PCゲーミングチェア売れ筋から「チェア本体以外」を厳格に除外
 */

const HARD_EXCLUDE_RE =
  /ゲーミングデスク|pcデスク|パソコンデスク|コンピューターデスク|昇降デスク|standing\s*desk|デスク単|デスク本体|desk\s*(?:only|単体)|gaming\s*desk|computer\s*desk(?!\s*chair)|チェアマット|chair\s*mat|床保護(?:シート|マット)(?!対応)|フローリング(?:シート|マット)(?!対応)|(?:クッション|座布団|首当て|腰当て|ランバーサポート)(?:のみ|単体|交換|替え|カバー)|cushion\s*cover|replacement\s*cushion|キャスター(?:交換|替え|のみ|単体)|(?:ウレタン|静音)?(?:キャスター|ホイール)\s*交換|caster(?:\s*replacement|\s*only)|ガスシリンダー|gas\s*cylinder|クッションカバー|チェアカバー|椅子カバー|ゲーミングチェア\s*カバー|chair\s*cover|cover\s*only|アームレスト(?:パッド|カバー)(?:のみ|単)|フットレスト(?:のみ|単)|椅子なし|ゲーミングオットマン(?:のみ|単)?|オットマン(?:のみ|単体)|ネックパッド|ネックピロー|車\s*ヘッドレスト/i

const CHAIR_BODY_RE =
  /ゲーミングチェア|gaming\s*chair|オフィスチェア|office\s*chair|desk\s*chair|pc\s*chair|computer\s*chair|フロアチェア|floor\s*chair|座椅子|チェア.*オットマン|オットマン付/i

export function isGamingChairAccessory(title) {
  const t = String(title).trim()
  if (!t) return true
  if (HARD_EXCLUDE_RE.test(t)) return true
  if (/^for\s/i.test(t) && !CHAIR_BODY_RE.test(t)) return true
  if (/交換用|予備|追加パーツ|replacement\s*part/i.test(t) && !CHAIR_BODY_RE.test(t)) {
    return true
  }
  return false
}

export function isGamingChairBody(title) {
  const t = String(title).trim()
  if (isGamingChairAccessory(t)) return false
  return CHAIR_BODY_RE.test(t)
}

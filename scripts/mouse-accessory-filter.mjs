/**
 * マウス本体以外（ソール・ケース・キーキャップ・ケーブル等）を除外
 */
export function isMouseAccessory(title) {
  const t = String(title ?? "").toLowerCase()
  if (!t.trim()) return true

  if (
    /mouse sole|マウスソール|grip tape|グリップテープ|mouse grip tape|mouse skate|スケート|feet kit|ptfe material|protective storage|storage case|収納ケース|専用ケース|ケースのみ|jiggler|ジグラー|unifying receiver|レシーバーのみ|receiver only/i.test(
      t,
    )
  ) {
    return true
  }

  if (
    /キーキャップ|keycap|key cap|keycaps|mouse pad|マウスパッド|mousepad|mouse mat|マウスソール|mouse sole|mouse skate|feet kit|grip tape|グリップテープ|滑り止め|マウスケース|mouse case|収納ケース|専用ケース|ケースのみ|protective case|storage case|carrying case|ポーチ|pouch/i.test(
      t,
    )
  ) {
    return true
  }

  if (/アームカバー|arm cover|wrist band cover|リストカバー|アームスリーブ|arm sleeve|eS アーム/i.test(t)) {
    return true
  }

  if (
    /ホイールエンコーダ|wheel encoder|scroll wheel encoder|エンコーダ.*\d+\s*mm|防塵.*エンコーダ|マウスホイール.*交換|交換用.*ホイール|修理用.*部品|repair part|replacement part|マイクロスイッチ.*個|スイッチ.*交換用|encoder kit|エンコーダ.*セット|スクロールホイール.*交換|マウスローラー.*交換|mouse roller|プーリーマウスローラー/i.test(
      t,
    )
  ) {
    return true
  }

  if (/充電ドック|charging dock|charge dock|磁気充電ベース|磁気接続.*充電|マグネット式充電ドック/i.test(t)) {
    const isMouseWithDock =
      /ゲーミングマウス|gaming mouse|ワイヤレスマウス|ワイヤレス.*マウス|無線.*マウス/i.test(t) ||
      (/マウス|mouse/i.test(t) && /付き|同梱|付属|搭載/i.test(t))
    if (!isMouseWithDock) return true
  }

  if (
    /トラベルケース|travel case|ハードトラベル|storage bag|ストレージバッグ|収納バッグ|ev\s*a.*bag|protective storage|専用保護収納/i.test(
      t,
    )
  ) {
    return true
  }

  if (
    /(ドングル|dongle)/i.test(t) &&
    /用|for|アダプター|adapter|高速接続/i.test(t) &&
    !/ワイヤレスマウス|wireless mouse|無線マウス|ゲーミングマウス|gaming mouse|trackball|トラックボール/i.test(t)
  ) {
    return true
  }

  if (/ペンホルダー|pen holder|シリコンペン/i.test(t) && !/マウス|mouse|trackball/i.test(t)) {
    return true
  }

  if (
    !/\bmouse\b|マウス|mice|trackball|トラックボール|trackpad/i.test(t) &&
    /エンコーダ|encoder|micro switch|マイクロスイッチ/i.test(t)
  ) {
    return true
  }

  if (/マウスソール|mouse sole|mouse skate|feet kit|for logicool|for logitech|for razer|用\s*(white|black|suruga|fuji)/i.test(t)) {
    return true
  }
  if (/for (logicool|logitech|razer)\b/i.test(t)) return true
  if (/for gaming mouse/i.test(t) && /grip tape|mouse sole|グリップ|ソール|pre-cut|アンチスリップ/i.test(t)) {
    return true
  }
  if (/^(qspec|talongames|hotline games|wallhack)\b/i.test(t.trim())) {
    return true
  }

  // マウス本体を示す語が無いアクセサリ
  if (
    !/\bmouse\b|マウス|mice|trackball|トラックボール|trackpad/i.test(t) &&
    /keycap|キーキャップ|mouse pad|マウスパッド|grip tape|ソール|cable only|pouch|ポーチ/i.test(t)
  ) {
    return true
  }

  return false
}

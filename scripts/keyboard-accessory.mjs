/**
 * キーボード本体以外（スイッチ・キーキャップ単体、工具、Stream Deck 等）の判定。
 * fetch / merge スクリプトと lib/keyboard-filter-tags.ts で同じ条件を保つ。
 */
export function isKeyboardAccessoryTitle(title) {
  const t = String(title).toLowerCase()

  if (/stream deck|ストリームデック|streaming deck/i.test(t)) {
    if (/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(t)) return false
    return true
  }
  if (
    /ストリームコントローラー|stream controller|streaming deck|ストリームコントローラーデック|actionring/i.test(
      t,
    ) &&
    !/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(t)
  ) {
    return true
  }
  if (/mouserpad|マウサーパッド/i.test(t) && /左手|left.?hand|fps/i.test(t)) {
    return true
  }

  if (
    /keycap set|キーキャップセット|キーキャップのみ|replacement keycap|キーキャップ.*\d+個|\d+個.*キーキャップ/i.test(
      t,
    )
  ) {
    return true
  }

  if (
    /キースイッチ.*セット|スイッチ.*\d+個セット|switch pack|replacement switch|スイッチセット/i.test(
      t,
    )
  ) {
    return true
  }
  if (/キースイッチ|key switch/i.test(t) && !/キーボード|keyboard/i.test(t)) {
    return true
  }

  if (/引き抜|引抜|キープラー|key puller|switch puller|キートップ.*工具|引抜工具|2in1.*工具/i.test(t)) {
    return true
  }
  if (/タイプスティック|typestick|type stick|ts01|ファーイーストガジェット/i.test(t)) {
    if (!/キーボード|keyboard/i.test(t)) return true
  }
  if (/メンテナンスキット|lube kit|潤滑剤|keyboard lube/i.test(t)) return true
  if (/スタビライザ.*(?:セット|単体|キット)|stabilizer kit/i.test(t)) return true
  if (/キーボード部品|キーボードdiy|keyboard parts/i.test(t)) return true

  if (/keyboard cover|キーボードカバー|dust cover|防塵カバー|保護カバー|protective cover/i.test(t)) {
    if (!/一体型|一体型キーボード|keyboard.*一体|タイプカバー/i.test(t)) return true
  }
  if (/wrist rest|リストレスト/i.test(t) && !/keyboard|キーボード/i.test(t)) return true
  if (/cable only|ケーブルのみ|usb receiver only|レシーバーのみ/i.test(t)) return true

  if (/キーホルダー|キーリング|keychain|key chain|fidget toy|フィジットトイ/i.test(t)) {
    if (!/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b|キーボード本体/i.test(t)) {
      return true
    }
  }

  // ストリームコントローラー・左手デバイス単体（キーボード本体ではない）
  if (
    /tartarus|vsdinside|streaming deck controller|ストリーミングデック|stream controller/i.test(t) &&
    !/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(t)
  ) {
    return true
  }
  if (/左手デバイス|左手用.*コントローラー|one.?handed.*(?:controller|keypad)/i.test(t)) {
    if (!/メカニカルキーボード|ゲーミングキーボード|\bkeyboard\b/i.test(t)) return true
  }
  if (/m18 streaming|numpad controller|キーパッド.*(?:only|単体)/i.test(t) && !/keyboard|キーボード/i.test(t)) {
    return true
  }

  return false
}

/** キーボード＋マウスセット（キーボード単体ではない） */
export function isKeyboardMouseComboTitle(title) {
  const t = String(title).toLowerCase()
  if (/マウスセット|keyboard\s*[&＆]\s*mouse|mouse\s*[&＆]\s*keyboard/i.test(t)) {
    return true
  }
  if (/キーボード.*マウス.*セット|マウス.*キーボード.*セット/i.test(t)) return true
  if (/有線キーボード.*有線マウス|キーボード.*\d+k.*マウス.*\d+m/i.test(t)) return true
  if (/320k.*320m|320m.*320k/i.test(t)) return true
  if (/ワイヤレス\s+キーボード\s+マウス\s+セット|キーボード\s+マウス\s+セット/i.test(t)) {
    return true
  }
  return false
}

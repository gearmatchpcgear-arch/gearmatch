/**
 * Shared exclusion rules for dynamic mic Amazon rankings.
 * Keeps mic bodies; excludes accessories, cable bundle sets, headsets, non-mics.
 */

export function isDynamicMicCableBundleSet(title) {
  if (/AT2040.*&(BX3|ケーブル|キャノン|canon|アーム|ブーム|Arm|Shock|ショック)/i.test(title)) return true
  if (/AT2040USB.*&(ブーム|アーム|Arm|AT8700|AT8458|ショック)/i.test(title)) return true
  if (/スターティングセット|セット買い|starting set/i.test(title)) return true
  if (/&\s*(BX3|BX3\/3\.0|キャノンケーブル|canon cable)/i.test(title)) return true
  if (/マイク\s*[＋+&]\s*(ケーブル|cable|BX3)/i.test(title) && /セット|set/i.test(title)) return true
  if (/BETA\s*58A.*[＋+].*ケーブル|ケーブル.*セット.*BETA/i.test(title)) return true
  if (/Microphone \+ Microphone Stand|マイク\s*[＋+]\s*マイクスタンド/i.test(title)) return true
  if (/&\s*Microphone Arm|&\s*Boom Arm|&\s*Shock Mount/i.test(title)) return true
  return false
}

export function isDynamicMicAccessory(title) {
  const t = title.toLowerCase()
  if (/マイク&カバー|マイク\s*&\s*カバー|mic & cover|cover set/i.test(title)) return true
  if (/マイクケース|mic case|収納ケース|キャリングケース|ハードケース/i.test(title) && !/マイク|microphone/i.test(title))
    return true
  if (/マイクアーム単|マイクスタンド単|boom arm単|アーム単体|スタンド単体/i.test(title)) return true
  if (/ポップフィルター単|pop filter単|ショックマウント単|ウインドスクリーン単|ウィンドスクリーン単/i.test(title))
    return true
  if (/ケーブル単|ケーブルのみ|延長ケーブル単/i.test(title) && !/マイク|microphone/i.test(title)) return true
  if (/変換アダプター|アダプタ単/i.test(title) && !/マイク|microphone/i.test(title)) return true
  if (/拡張マイク|YVC-MIC|用拡張/i.test(title)) return true
  if (/ボイスダンパー|voice damper|防音マスク|scream mask/i.test(title)) return true
  if (/ウタエット|UTAET/i.test(title)) return true
  if (/おもちゃ|toy|pretend stage|echo microphone|エコーマイク|なりきり|子供用.*マイク|children's toy/i.test(title)) return true
  if (/ヘッドセット|headset|headphone mic skin|over ear wired headset/i.test(title)) return true
  if (/ヘッドウォーン|headworn|WH20XLR/i.test(title)) return true
  if (/JBL Quantum|Quantum 250/i.test(title) && /ドライバー|earpad|headphone/i.test(title)) return true
  if (/レコーダー|recorder|LS-P5|PCM Recording/i.test(title) && !/マイク|microphone/i.test(title)) return true
  if (/Producer Bundle|オーディオインターフェース.*セット|配信セット|コンプリート.*セット/i.test(title)) return true
  return false
}

export function isDynamicMicBodyTitle(title) {
  if (isDynamicMicAccessory(title)) return false
  if (isDynamicMicCableBundleSet(title)) return false
  return true
}

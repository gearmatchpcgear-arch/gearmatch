/**
 * Title-based exclusion for mic ranking imports (arms, filters, cables, speakerphones).
 * Microphones sold with bundled stand/arm/pop filter are kept.
 */
export function isMicAccessoryTitle(title) {
  const t = title.toLowerCase()

  if (/スピーカーフォン|speakerphone|会議用マイクスピーカー|powerconf|yvc-330|ユニファイドコミュニケーション/i.test(title)) {
    return true
  }
  if (/マイクスピーカーシステム|拡声器|スピーカー＆マイク一体/i.test(title)) {
    return true
  }

  if (/switch.*カラオケ|カラオケマイク.*joysound/i.test(title)) {
    return true
  }

  if (/マイクケース|mic case|収納ケース|キャリングケース|ハードケース/i.test(title) && !/マイク.*本体|microphone/i.test(title)) {
    return true
  }

  if (/マイクアーム単|マイクスタンド単|boom arm単|アーム単体|スタンド単体|ショックマウント単|ポップガード単|ポップフィルター単|ウインドスクリーン単|ウィンドスクリーン単/i.test(title)) {
    return true
  }

  if (
    /(?:^|[^a-z])(?:マイクアーム|mic arm|boom arm)(?:$|[^a-z])/i.test(title) &&
    !/(?:マイク|microphone|solocast|quadcast|snowball|k669|u30k|seiren|fifine|maono|hyperx|audio-technica|オーディオテクニカ)/i.test(title)
  ) {
    return true
  }

  if (/ポップフィルター単|pop filter単|防音スポンジ単/i.test(title) && !/内蔵|付属|一体/i.test(title)) {
    return true
  }

  if (/変換アダプター|アダプタ単|adaptor only|延長ケーブル単|ケーブル単/i.test(title) && !/マイク|microphone|type-c.*マイク|usb.*マイク/i.test(title)) {
    return true
  }

  if (/(?:^|[^a-z])ケーブル(?:$|[^付])|延長ケーブル/i.test(title) && !/マイク|microphone|usbマイク|usb マイク|コンデンサー|ダイナミック|ピンマイク|ゲーミングマイク|pcマイク|pc マイク/i.test(title)) {
    return true
  }

  return false
}

/** Page 2 ranking: exclude parts/accessories only; speakerphones are valid mic bodies. */
export function isMicRankingBodyTitle(title) {
  if (/switch.*カラオケ|カラオケマイク.*joysound/i.test(title)) {
    return true
  }

  if (
    /マイクスタンド単|マイクアーム単|boom arm単|スタンド単体|gracetop.*マイクスタンド|マイクスタンド\s/i.test(title) &&
    !/マイク|microphone|スピーカーフォン|speakerphone/i.test(title)
  ) {
    return true
  }

  if (
    /replacement for|交換.*マイク|替え.*マイク|ゲームマイクの交換|microphone replacement|detachable gaming microphone boom|gaming microphone replacement|取り外し可能.*ゲームマイク|ゲームマイクブーム.*交換/i.test(
      title,
    )
  ) {
    return true
  }

  if (/b\+com.*アームマイク|arm microphone set for b\+com|純正品.*00081683/i.test(title)) {
    return true
  }

  if (/キャプチャー|capture.*box|live gamer mini|ゲームキャプチャ/i.test(title)) {
    return true
  }

  if (/マイクケース|pop filter単|ウインドスクリーン単|ショックマウント単|ポップガード単/i.test(title) && !/内蔵|付属/i.test(title)) {
    return true
  }

  if (/変換アダプター|アダプタ単|延長ケーブル単|ケーブル単/i.test(title) && !/マイク|microphone|speakerphone|スピーカーフォン/i.test(title)) {
    return true
  }

  if (
    /(?:^|[^a-z])(?:マイクアーム|mic arm|boom arm)(?:$|[^a-z])/i.test(title) &&
    !/(?:マイク|microphone|solocast|quadcast|speakerphone|スピーカーフォン|emeet|flipcast|fduce)/i.test(title)
  ) {
    return true
  }

  if (/headmount.*microphone kit|headset microphone kit|ヘッドマウント.*マイクキット/i.test(title)) {
    return true
  }

  return false
}

import type { Gadget } from "./gadgets"
import { inferMicFilterTagsMerged } from "./mic-filter-tags"

function micHaystack(gadget: Gadget) {
  return [
    gadget.name,
    gadget.brand,
    gadget.tagline,
    gadget.connection,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()
}

/** マイク本体以外（ヘッドセット、スピーカーフォン、周辺機器セット等） */
export function isMicAccessoryProduct(gadget: Gadget): boolean {
  if (gadget.category !== "mic") return false
  if (gadget.isMicAccessory) return true

  const hay = micHaystack(gadget)
  const tags = inferMicFilterTagsMerged(gadget)

  // Catalogued conference speakerphones (PC mic ranking page 2)
  if (tags.includes("conference")) return false

  if (tags.includes("headset")) return true

  if (
    /スピーカーフォン|speakerphone|拡声器|スピーカー＆マイク一体|スピーカー付きマイク/i.test(hay)
  ) {
    return true
  }

  if (/& (マイク|ショック|オーディオテクニカ).*?(スタンド|アーム|ブーム|ショックマウント)/i.test(hay)) {
    return true
  }

  if (/& マイクブームアーム|& マイクスタンド|& マイクアーム|& ショックマウント/i.test(hay)) {
    return true
  }

  if (/\+ .*マイクケーブル|マイクケーブル.*セット|ケーブルセット/i.test(hay) && /&|\+|セット/i.test(hay)) {
    return true
  }

  if (/switch.*カラオケマイク|switch2.*カラオケ/i.test(hay)) {
    return true
  }

  return false
}

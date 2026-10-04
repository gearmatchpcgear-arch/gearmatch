/**
 * Normalize mic connection strings for card display (multi-interface support).
 */
export { normalizeMicConnectionDisplay as formatMicConnectionDisplay } from "./spec-display-normalize.mjs"
export { DASH } from "./spec-display-normalize.mjs"

import {
  normalizeMicConnectionDisplay as formatMicConnectionDisplay,
  DASH,
} from "./spec-display-normalize.mjs"

/** Infer connections from product title / tagline when connection field is incomplete. */
export function inferConnectionFromText(text) {
  if (!text) return null
  const tokens = []
  const add = (t) => {
    if (!tokens.includes(t)) tokens.push(t)
  }

  if (/usb.?type.?c|type-c|type c/i.test(text)) add("USB Type-C")
  else if (/usb.?type.?a|type-a|type a/i.test(text)) add("USB Type-A")
  else if (/\busb\b/i.test(text)) add("USB Type-A")

  if (/xlr/i.test(text)) add("XLR")
  if (/6\.3\s*mm|6\.3mm/i.test(text)) add("6.3mm")
  if (/3\.5\s*mm|3\.5mm|ミニプラグ/i.test(text)) add("3.5mm")
  if (/lightning/i.test(text)) add("Lightning")
  if (/2\.4\s*ghz|2\.4ghz/i.test(text)) add("2.4GHz ワイヤレス")
  if (/bluetooth/i.test(text)) add("Bluetooth")

  if (tokens.length === 0) return null
  return formatMicConnectionDisplay(tokens.join(" / "))
}

export function pickBestMicConnection(sources) {
  let best = DASH
  let bestCount = 0
  for (const src of sources) {
    if (!src || src === DASH || src === "-") continue
    const formatted = formatMicConnectionDisplay(src)
    const count = formatted.split(" / ").filter(Boolean).length
    if (count > bestCount || (count === bestCount && formatted.length > best.length)) {
      best = formatted
      bestCount = count
    }
  }
  return best
}

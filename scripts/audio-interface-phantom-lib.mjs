import { AI_SPECS_KNOWN, DASH } from "./audio-interface-specs-known.mjs"

export { DASH }

export function extractAsinFromUrl(url) {
  return url?.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ?? null
}

export function shortCardPhantom(value) {
  if (!value || value === DASH) return DASH
  if (/非対応/.test(value)) return "非対応"
  if (/対応|\+48\s*v|48v/i.test(value)) return "+48V対応"
  return value
}

export function resolvePhantomPowerFromField(phantomPower) {
  const value = (phantomPower ?? "").trim()
  if (!value || value === DASH) return "unknown"
  if (/非対応|なし|not supported|no phantom|without phantom/i.test(value)) return "unsupported"
  if (/対応|\+48\s*v|\+24\s*v|48v|24v|phantom power/i.test(value)) return "supported"
  return "unknown"
}

export function getPhantomDisplayFromBlock(block) {
  const highlight = block.match(
    /\{ label: "ファンタム電源", value: "([^"]*)" \}/,
  )?.[1]
  if (highlight && highlight !== DASH) return highlight

  const field = block.match(/phantomPower: "([^"]*)"/)?.[1] ?? ""
  if (field && field !== DASH) return shortCardPhantom(field)
  return DASH
}

export function isPhantomSupportedBlock(block) {
  const display = getPhantomDisplayFromBlock(block)
  if (display !== DASH) {
    if (/非対応/.test(display)) return false
    if (/\+48|48v|\+24|24v|対応/i.test(display)) return true
    return false
  }
  const field = block.match(/phantomPower: "([^"]*)"/)?.[1]
  return resolvePhantomPowerFromField(field) === "supported"
}

/** @returns {string | null} canonical phantomPower from known specs */
export function resolveKnownPhantomPower(asin) {
  const known = asin ? AI_SPECS_KNOWN[asin] : null
  const value = known?.phantomPower
  if (!value || value === DASH) return null
  return value
}

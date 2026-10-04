/** Shared patterns for used / refurbished product detection in gadget data blocks */

export const USED_OR_REFURBISHED_PATTERNS = [
  /整備済み品/,
  /整備済み/,
  /再生品/,
  /中古品/,
  /(?:^|\s)中古(?:\s|$|[\[\(])/,
  /\[Refurbished\]/i,
  /\bRefurbished\b/i,
  /\bUsed\b/i,
  /\(Renewed\)/i,
  /\bRenewed\b/i,
  /\bAmazon Renewed\b/i,
  /\bAmazon Warehouse\b/i,
]

export function parseGadgetBlocks(text) {
  const gadgets = []
  let depth = 0
  let start = -1

  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("{", i) && /[\s,\[]/.test(text[i - 1] ?? "[")) {
      if (depth === 0) start = i
      depth++
    } else if (text[i] === "}") {
      depth--
      if (depth === 0 && start >= 0) {
        gadgets.push({ start, end: i + 1, text: text.slice(start, i + 1) })
        start = -1
      }
    }
  }
  return gadgets
}

export function isUsedOrRefurbishedText(name = "", tagline = "") {
  const hay = `${name} ${tagline}`
  return USED_OR_REFURBISHED_PATTERNS.some((pattern) => pattern.test(hay))
}

export function isUsedOrRefurbishedGadgetBlock(block) {
  if (/isUsed:\s*true/.test(block)) return true
  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  return isUsedOrRefurbishedText(name, tagline)
}

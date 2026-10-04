/**
 * Parse Amazon.co.jp product page HTML for the current sale price (JPY).
 */
export const LEGACY_PLACEHOLDER_PRICE = 1000

function parseYenMatch(raw) {
  const n = Number(String(raw ?? "").replace(/,/g, ""))
  return Number.isFinite(n) && n >= 100 && n <= 500_000 ? Math.round(n) : null
}

/** Prefer buybox/core price blocks; ignore obvious used/中古 snippets when possible. */
export function parseAmazonPrice(html) {
  const hay = String(html ?? "")
  if (!hay || hay.length < 5000) return null

  const scopedBlocks = [
    hay.match(/id="corePrice_feature_div"[\s\S]{0,4000}?<\/div>/i)?.[0],
    hay.match(/id="corePriceDisplay_desktop_feature_div"[\s\S]{0,4000}?<\/div>/i)?.[0],
    hay.match(/class="[^"]*reinventPricePriceToPayMargin[^"]*"[\s\S]{0,2000}/i)?.[0],
    hay.match(/id="buybox"[\s\S]{0,12000}?<\/form>/i)?.[0],
  ].filter(Boolean)

  for (const block of scopedBlocks) {
    const offscreen = [...String(block).matchAll(/class="a-offscreen">\s*[¥￥]([\d,]+)/g)].map(
      (m) => parseYenMatch(m[1])
    )
    const clean = offscreen.filter((n) => n != null)
    if (clean.length) return Math.max(...clean)
  }

  const patterns = [
    /One-time purchase:\s*¥([\d,]+)/gi,
    /class="a-offscreen">\s*¥([\d,]+)/g,
    /class="a-offscreen">\s*￥([\d,]+)/g,
    /"priceAmount"\s*:\s*([\d.]+)/g,
    /"price"\s*:\s*"([\d.]+)"/g,
    /a-price-whole[^>]*>([\d,]+)/g,
  ]

  const all = []
  for (const re of patterns) {
    for (const m of hay.matchAll(re)) {
      const n = parseYenMatch(m[1])
      if (n) all.push(n)
    }
  }
  if (all.length) return Math.max(...all)
  return null
}

/** Drop legacy ¥1,000 placeholder; keep verified overrides. */
export function normalizeImportedPrice(price, asin, overrides = {}) {
  const override = overrides[asin]?.price
  if (override != null && override > 0) return override
  if (price == null || price <= 0) return null
  if (price === LEGACY_PLACEHOLDER_PRICE) return null
  return price
}

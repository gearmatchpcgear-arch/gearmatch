/**
 * Amazon.co.jp buybox price extraction (browser Runtime.evaluate).
 * Scoped to product column; prefers new over used when both are shown.
 */
(function () {
  function parseYen(text) {
    const m = String(text ?? "").match(/[¥￥]\s*([\d,]+)/)
    if (!m) return null
    const n = Number(m[1].replace(/,/g, ""))
    return Number.isFinite(n) && n >= 100 ? n : null
  }

  function isUsedContext(text) {
    return /Used|中古|リユース|再生品/i.test(String(text ?? ""))
  }

  const center =
    document.querySelector("#centerCol") ??
    document.querySelector("#ppd") ??
    document.body

  const offerRoots = center.querySelectorAll(
    "#buybox, #buyBoxAccordion, #offerDisplayFeatures, #corePrice_feature_div, #corePriceDisplay_desktop_feature_div"
  )

  const candidates = []
  for (const root of offerRoots) {
    for (const row of root.querySelectorAll(
      "label, .a-accordion-row, [data-a-accordion-row-name], .a-button-selected"
    )) {
      const txt = row.textContent ?? ""
      if (isUsedContext(txt)) continue
      const p = parseYen(txt)
      if (p && p >= 1000) candidates.push(p)
    }
  }

  if (candidates.length) return Math.max(...candidates)

  for (const sel of [
    ".reinventPricePriceToPayMargin .a-offscreen",
    "#corePrice_feature_div .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-offscreen",
    ".centralizedApexPricePrice .a-offscreen",
  ]) {
    const el = center.querySelector(sel)
    const p = parseYen(el?.textContent)
    if (p && p >= 1000) return p
  }

  return null
})()

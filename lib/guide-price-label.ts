import { formatPrice, getCardDisplayPrice, hasCardDisplayPrice, type Gadget } from "@/lib/gadgets"

/** ガイドカードの価格表示（一覧カードと同じ {@link getCardDisplayPrice} を優先） */
export function resolveGuidePriceLabel(
  gadget: Gadget | undefined,
  priceLabel?: string,
  fallback = "￥-",
): string {
  if (gadget && hasCardDisplayPrice(gadget)) {
    return formatPrice(getCardDisplayPrice(gadget)!)
  }

  if (priceLabel && priceLabel !== "￥-") {
    return priceLabel.replace(/前後$/, "").replace(/\s*（[^）]*）\s*$/, "").replace(/\s*\([^)]*\)\s*$/, "")
  }

  return fallback
}

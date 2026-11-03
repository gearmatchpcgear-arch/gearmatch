import { buildAffiliatePurchaseUrl } from "@/lib/affiliate-purchase-url"
import type { Gadget } from "@/lib/gadgets"
import { getAffiliatePurchaseUrlOverride } from "@/lib/moshimo-cardlink-registry"
import { getMoshimoAmazonAffiliateUrl } from "@/lib/moshimo-cardlink"

/**
 * 詳細・ガイド・CSV 共通：商品の購入リンク（もしも計測 URL 優先）。
 * purchaseUrl 本体は ASIN 用に正規 Amazon URL のまま保持し、表示時に解決する。
 */
export function resolveGadgetShopUrl(gadget: {
  id: string
  purchaseUrl: string
  affiliatePurchaseUrl?: string
}): string {
  const registryAffiliate = getAffiliatePurchaseUrlOverride(gadget.id)
  if (registryAffiliate) return registryAffiliate

  const inlineAffiliate = gadget.affiliatePurchaseUrl?.trim()
  if (inlineAffiliate) return buildAffiliatePurchaseUrl(inlineAffiliate)

  const cardlinkAmazon = getMoshimoAmazonAffiliateUrl(gadget.id, gadget.purchaseUrl)
  if (cardlinkAmazon) return cardlinkAmazon

  return buildAffiliatePurchaseUrl(gadget.purchaseUrl)
}

export function resolveGadgetShopUrlFromGadget(gadget: Gadget): string {
  return resolveGadgetShopUrl(gadget)
}

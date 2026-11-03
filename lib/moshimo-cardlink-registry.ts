import moshimoCardlinkData from "@/data/moshimo-cardlinks.json"
import { extractAmazonAsin } from "@/lib/amazon-purchase-url"
import type { MoshimoCardLinkConfig } from "@/lib/moshimo-cardlink-types"

export type MoshimoCardlinkDataFile = {
  version: number
  cardLinksByGadgetId: Record<string, MoshimoCardLinkConfig>
  affiliatePurchaseUrlByGadgetId?: Record<string, string>
  cardLinksByAsin?: Record<string, MoshimoCardLinkConfig>
}

const data = moshimoCardlinkData as MoshimoCardlinkDataFile

const CARD_LINKS_BY_GADGET_ID: Record<string, MoshimoCardLinkConfig> = {
  ...data.cardLinksByGadgetId,
}

function buildAsinIndex(): Record<string, MoshimoCardLinkConfig> {
  const byAsin: Record<string, MoshimoCardLinkConfig> = {
    ...(data.cardLinksByAsin ?? {}),
  }
  for (const config of Object.values(CARD_LINKS_BY_GADGET_ID)) {
    const asin = extractAmazonAsin(config.u?.u ?? "")
    if (asin && !byAsin[asin]) {
      byAsin[asin] = config
    }
  }
  return byAsin
}

const CARD_LINKS_BY_ASIN = buildAsinIndex()

export function getMoshimoCardLinkConfigFromRegistry(
  gadgetId: string,
): MoshimoCardLinkConfig | undefined {
  return CARD_LINKS_BY_GADGET_ID[gadgetId]
}

export function getMoshimoCardLinkForGadgetFromRegistry(gadget: {
  id: string
  purchaseUrl: string
}): MoshimoCardLinkConfig | undefined {
  const byId = getMoshimoCardLinkConfigFromRegistry(gadget.id)
  if (byId) return byId

  const asin = extractAmazonAsin(gadget.purchaseUrl)
  if (asin && CARD_LINKS_BY_ASIN[asin]) {
    return CARD_LINKS_BY_ASIN[asin]
  }

  return undefined
}

export function getAffiliatePurchaseUrlOverride(gadgetId: string): string | undefined {
  const url = data.affiliatePurchaseUrlByGadgetId?.[gadgetId]?.trim()
  return url || undefined
}

export function listMoshimoCardLinkGadgetIds(): string[] {
  return Object.keys(CARD_LINKS_BY_GADGET_ID)
}

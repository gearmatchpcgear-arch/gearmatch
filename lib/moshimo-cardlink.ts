import { normalizeAmazonProductImageUrl } from "@/lib/amazon-product-image-proxy"
import { buildMoshimoAmazonClickUrl } from "@/lib/moshimo-affiliate-defaults"
import {
  getMoshimoCardLinkConfigFromRegistry,
  getMoshimoCardLinkForGadgetFromRegistry,
} from "@/lib/moshimo-cardlink-registry"
import { resolveGadgetShopUrl } from "@/lib/resolve-gadget-shop-url"

export type {
  MoshimoCardLinkButton,
  MoshimoCardLinkConfig,
} from "@/lib/moshimo-cardlink-types"
export {
  MOSHIMO_CARDLINK_SCRIPT_ID,
  MOSHIMO_CARDLINK_SCRIPT_SRC,
} from "@/lib/moshimo-cardlink-types"

import type { MoshimoCardLinkButton, MoshimoCardLinkConfig } from "@/lib/moshimo-cardlink-types"

export function getMoshimoCardLinkConfig(gadgetId: string): MoshimoCardLinkConfig | undefined {
  return getMoshimoCardLinkConfigFromRegistry(gadgetId)
}

export function getMoshimoCardLinkForGadget(gadget: {
  id: string
  purchaseUrl: string
}): MoshimoCardLinkConfig | undefined {
  return getMoshimoCardLinkForGadgetFromRegistry(gadget)
}

export function getMoshimoCardLinkMountId(config: MoshimoCardLinkConfig): string {
  return `msmaflink-${config.eid}`
}

export function buildMoshimoClickUrlFromButton(button: MoshimoCardLinkButton): string {
  return buildMoshimoAmazonClickUrl(button.u_url, {
    a_id: String(button.a_id),
    p_id: String(button.p_id),
    pc_id: String(button.pc_id),
    pl_id: String(button.pl_id),
  })
}

export function getMoshimoAmazonAffiliateUrl(
  gadgetId: string,
  purchaseUrl?: string,
): string | undefined {
  const config =
    getMoshimoCardLinkConfig(gadgetId) ??
    (purchaseUrl ? getMoshimoCardLinkForGadget({ id: gadgetId, purchaseUrl }) : undefined)
  if (!config) return undefined
  const amazon = config.b_l.find((button) => button.s_n === "amazon")
  if (!amazon) return undefined
  return buildMoshimoClickUrlFromButton(amazon)
}

export function getMoshimoPrimaryImageUrl(config: MoshimoCardLinkConfig): string | undefined {
  const path = config.p[0]
  if (!path) return undefined
  return normalizeAmazonProductImageUrl(`${config.d}${config.c_p}${path}`)
}

export function getMoshimoCardLinkButtons(config: MoshimoCardLinkConfig): MoshimoCardLinkButton[] {
  return [...config.b_l].sort((a, b) => a.u_so - b.u_so)
}

export function ensureMoshimoCardlinkScript(document: Document, window: Window): void {
  const scriptId = "msmaflink"
  const scriptSrc = "https://dn.msmstatic.com/site/cardlink/bundle.js?20220329"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  w.MoshimoAffiliateObject = scriptId
  w[scriptId] =
    w[scriptId] ||
    function (...args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      ;(w[scriptId].q = w[scriptId].q || []).push(arguments)
    }

  if (document.getElementById(scriptId)) {
    return
  }

  const script = document.createElement("script")
  script.type = "text/javascript"
  script.src = scriptSrc
  script.id = scriptId
  document.body.appendChild(script)
}

/** CSV エクスポート用：UI・詳細と同じ購入リンク */
export function resolveGadgetExportLinkUrl(gadget: {
  id: string
  purchaseUrl: string
  affiliatePurchaseUrl?: string
}): string {
  return resolveGadgetShopUrl(gadget)
}

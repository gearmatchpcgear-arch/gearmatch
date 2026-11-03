"use client"

import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { openPurchaseUrl, openShopUrl, resolveAffiliatePurchaseUrl, shopUrl, type Gadget } from "@/lib/gadgets"

export const SHOP_LINK_LABEL = "Amazonで見る"

export function ShopLink({
  gadget,
  purchaseUrl,
  label = SHOP_LINK_LABEL,
  className,
}: {
  gadget?: Gadget
  /** gadget 未指定時、またはガイド用の購入URLを直接渡す */
  purchaseUrl?: string
  label?: string
  className?: string
}) {
  const url = purchaseUrl
    ? resolveAffiliatePurchaseUrl(purchaseUrl)
    : gadget
      ? shopUrl(gadget)
      : "#"

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        if (purchaseUrl) {
          openPurchaseUrl(purchaseUrl)
        } else if (gadget) {
          openShopUrl(gadget)
        }
      }}
      className={cn(className)}
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  )
}

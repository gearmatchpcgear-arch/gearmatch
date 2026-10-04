"use client"

import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { openShopUrl, shopUrl, type Gadget } from "@/lib/gadgets"

export const SHOP_LINK_LABEL = "Amazonで見る"

export function ShopLink({
  gadget,
  label = SHOP_LINK_LABEL,
  className,
}: {
  gadget: Gadget
  label?: string
  className?: string
}) {
  const url = shopUrl(gadget)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        openShopUrl(gadget)
      }}
      className={cn(className)}
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  )
}

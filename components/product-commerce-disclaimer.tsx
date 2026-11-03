import { PRODUCT_PRICE_STOCK_DISCLAIMER } from "@/lib/product-commerce"
import { cn } from "@/lib/utils"

export function ProductCommerceDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-[10px] leading-snug text-muted-foreground sm:text-[11px]", className)}>
      {PRODUCT_PRICE_STOCK_DISCLAIMER}
    </p>
  )
}

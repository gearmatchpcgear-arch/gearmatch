import { cn } from "@/lib/utils"

export function SiteDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      aria-label="ご利用にあたって"
    >
      <ul className="space-y-1">
        <li>
          ※当サイトの掲載情報はAIにより自動収集されたデータも含まれているため、実際の情報と異なる場合があります。ご購入の際は必ず各商品ページにて詳細をご確認ください。
        </li>
        <li>
          ※当サイトで紹介している商品の価格や在庫状況は、データ取得時点のものであり、変更される場合があります。最新の情報は各販売ページにてご確認ください。
        </li>
      </ul>
    </aside>
  )
}

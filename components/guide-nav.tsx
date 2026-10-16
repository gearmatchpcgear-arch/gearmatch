import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { CategoryScrollRow } from "@/components/category-scroll-row"
import { CategoryIcon } from "@/components/category-icon"
import {
  GUIDE_CATEGORY_IDS,
  getGuideCategoryLabel,
  guideCategoryPath,
  type GuideCategorySlug,
} from "@/lib/guide-routes"
import { cn } from "@/lib/utils"

type GuideNavProps = {
  currentCategory?: GuideCategorySlug
  /** ポータル（/guide）ではカテゴリ切替チップを出さない */
  showCategoryTabs?: boolean
}

export function GuideNav({ currentCategory, showCategoryTabs = true }: GuideNavProps) {
  const currentLabel = currentCategory ? getGuideCategoryLabel(currentCategory) : null

  return (
    <div className="mb-6 min-w-0 max-w-full space-y-4 border-b border-border/60 pb-4">
      <nav aria-label="パンくず">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
          <li>
            <Link href="/" className="font-medium hover:text-foreground">
              トップ
            </Link>
          </li>
          <li aria-hidden className="flex items-center">
            <ChevronRight className="size-3.5 shrink-0 opacity-60" />
          </li>
          <li>
            {currentCategory ? (
              <Link href="/guide" className="font-medium hover:text-foreground">
                デバイス購入のポイント
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current="page">
                デバイス購入のポイント
              </span>
            )}
          </li>
          {currentLabel ? (
            <>
              <li aria-hidden className="flex items-center">
                <ChevronRight className="size-3.5 shrink-0 opacity-60" />
              </li>
              <li>
                <span className="font-medium text-foreground" aria-current="page">
                  {currentLabel}
                </span>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      {showCategoryTabs ? (
        <nav aria-label="ガイドカテゴリ" className="min-w-0 max-w-full">
          <CategoryScrollRow>
            {GUIDE_CATEGORY_IDS.map((categoryId) => {
              const active = currentCategory === categoryId
              return (
                <Link
                  key={categoryId}
                  href={guideCategoryPath(categoryId)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground shadow-sm ring-1 ring-border/70 hover:text-foreground hover:ring-primary/30",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <CategoryIcon
                    category={categoryId}
                    className={cn("size-3.5", active ? "text-primary-foreground/90" : "text-primary/70")}
                  />
                  {getGuideCategoryLabel(categoryId)}
                </Link>
              )
            })}
          </CategoryScrollRow>
        </nav>
      ) : null}
    </div>
  )
}

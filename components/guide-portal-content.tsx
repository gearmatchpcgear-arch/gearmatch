import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CategoryIcon } from "@/components/category-icon"
import { GuideNav } from "@/components/guide-nav"
import { GUIDE_CONTENTS } from "@/lib/guide-content"
import { GUIDE_CATEGORY_IDS, getGuideCategoryLabel, guideCategoryPath } from "@/lib/guide-routes"

export function GuidePortalContent() {
  return (
    <>
      <GuideNav showCategoryTabs={false} compact />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
        {GUIDE_CATEGORY_IDS.map((categoryId) => {
          const guide = GUIDE_CONTENTS[categoryId]
          const label = getGuideCategoryLabel(categoryId)
          return (
            <Link
              key={categoryId}
              href={guideCategoryPath(categoryId)}
              className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:min-h-[10.5rem] sm:p-5 lg:p-6"
            >
              <div className="mb-1 flex items-center gap-2 sm:mb-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
                  <CategoryIcon category={categoryId} className="size-5" />
                </span>
                <h2 className="min-w-0 text-sm font-bold leading-snug text-foreground sm:text-base">
                  {label}
                </h2>
              </div>
              <div className="flex min-w-0 flex-col gap-1 sm:flex-1 sm:gap-2">
                <p className="line-clamp-2 text-lg font-bold leading-snug text-pretty text-foreground sm:text-sm sm:font-normal sm:leading-relaxed sm:text-muted-foreground">
                  {guide.title}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary sm:mt-auto sm:text-sm">
                  選び方とおすすめを見る
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

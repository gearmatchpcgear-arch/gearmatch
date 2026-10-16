import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CategoryIcon } from "@/components/category-icon"
import { GuideNav } from "@/components/guide-nav"
import { GUIDE_CONTENTS } from "@/lib/guide-content"
import { GUIDE_CATEGORY_IDS, getGuideCategoryLabel, guideCategoryPath } from "@/lib/guide-routes"

export function GuidePortalContent() {
  return (
    <>
      <GuideNav showCategoryTabs={false} />
      <div className="grid gap-3 sm:grid-cols-2">
        {GUIDE_CATEGORY_IDS.map((categoryId) => {
          const guide = GUIDE_CONTENTS[categoryId]
          const label = getGuideCategoryLabel(categoryId)
          return (
            <Link
              key={categoryId}
              href={guideCategoryPath(categoryId)}
              className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CategoryIcon category={categoryId} className="size-5" />
                </span>
                <h2 className="text-base font-bold text-foreground">{label}</h2>
              </div>
              <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {guide.title}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                選び方とおすすめを見る
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

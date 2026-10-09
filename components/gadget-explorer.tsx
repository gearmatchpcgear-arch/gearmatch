"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Search, X, GitCompareArrows, ArrowUpDown, ChevronDown, Sparkles } from "lucide-react"
import { CategoryScrollRow } from "@/components/category-scroll-row"
import { headerDotOverlayClassName, headerShellClassName } from "@/components/site-brand-header"
import { cn } from "@/lib/utils"
import {
  categories,
  gadgets,
  getCardDisplayPrice,
  getEffectiveRating,
  getListableGadgets,
  type CategoryId,
  type Gadget,
} from "@/lib/gadgets"
import {
  getCategoryFilterTitle,
  getFilterGroupsForCategory,
  createFilterMatcher,
  toggleFilterSelection,
  type FilterGroup,
  type FilterId,
} from "@/lib/gadget-filters"
import { CategoryIcon } from "@/components/category-icon"
import { GadgetCard, type CardSize } from "@/components/gadget-card"
import { GadgetDetail } from "@/components/gadget-detail"
import { GadgetImage } from "@/components/gadget-image"
import { CompareView } from "@/components/compare-view"
import { PriceRangeFilter } from "@/components/price-range-filter"
import {
  EMPTY_PRICE_RANGE,
  computePriceSliderMax,
  isPriceRangeActive,
  matchesPriceRange,
  parsePrice,
  type AppliedPriceRange,
} from "@/lib/price-filter"
import { gadgetMatchesSearchQuery, getGadgetSearchHaystack } from "@/lib/gadget-search"

const MAX_COMPARE_ITEMS = 10
const DEFAULT_ITEMS_PER_PAGE = 24
const SMALL_CARD_ITEMS_PER_PAGE = 100

function getItemsPerPage(size: CardSize): number {
  return size === "small" ? SMALL_CARD_ITEMS_PER_PAGE : DEFAULT_ITEMS_PER_PAGE
}

type SearchableGadget = {
  gadget: Gadget
  searchText: string
}

function buildSearchableGadgets(list: Gadget[]): SearchableGadget[] {
  return list.map((gadget) => ({
    gadget,
    searchText: getGadgetSearchHaystack(gadget),
  }))
}

function buildGadgetsByCategory(list: Gadget[]): Map<CategoryId, Gadget[]> {
  const map = new Map<CategoryId, Gadget[]>()
  for (const gadget of list) {
    const categoryList = map.get(gadget.category)
    if (categoryList) categoryList.push(gadget)
    else map.set(gadget.category, [gadget])
  }
  return map
}

function buildSearchableByCategory(list: SearchableGadget[]): Map<CategoryId, SearchableGadget[]> {
  const map = new Map<CategoryId, SearchableGadget[]>()
  for (const item of list) {
    const categoryList = map.get(item.gadget.category)
    if (categoryList) categoryList.push(item)
    else map.set(item.gadget.category, [item])
  }
  return map
}

type SortOption = "rating-desc" | "reviews-desc" | "price-desc" | "price-asc"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rating-desc", label: "レビュー評価が高い順" },
  { value: "reviews-desc", label: "レビュー件数が多い順" },
  { value: "price-desc", label: "価格が高い順" },
  { value: "price-asc", label: "価格が安い順" },
]

const RATING_SORT_MIN_REVIEWS = 11

const CARD_SIZE_OPTIONS: { value: CardSize; label: string }[] = [
  { value: "large", label: "大" },
  { value: "medium", label: "中" },
  { value: "small", label: "小" },
]

/** Tailwind `sm` と揃える（640px 未満をスマホ表示） */
const MOBILE_CARD_SIZE_MAX_WIDTH_PX = 639

const CARD_GRID_BY_SIZE: Record<CardSize, string> = {
  large: "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6",
  medium: "grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6",
  small: "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-4 lg:grid-cols-6 lg:gap-5",
}

/** レビュー評価が高い順: 11件以上を優先 → 星降順 → 同評価は件数降順 */
function compareRatingDesc(a: Gadget, b: Gadget) {
  const aTrusted = a.reviews >= RATING_SORT_MIN_REVIEWS ? 1 : 0
  const bTrusted = b.reviews >= RATING_SORT_MIN_REVIEWS ? 1 : 0
  if (aTrusted !== bTrusted) return bTrusted - aTrusted

  const ratingDiff = getEffectiveRating(b) - getEffectiveRating(a)
  if (ratingDiff !== 0) return ratingDiff

  return b.reviews - a.reviews
}

/** レビュー件数が多い順（未設定は 0 として末尾） */
function compareReviewsDesc(a: Gadget, b: Gadget) {
  return (b.reviews ?? 0) - (a.reviews ?? 0)
}

function sortGadgets(list: Gadget[], sortBy: SortOption) {
  const sorted = [...list]
  switch (sortBy) {
    case "rating-desc":
      return sorted.sort(compareRatingDesc)
    case "reviews-desc":
      return sorted.sort(compareReviewsDesc)
    case "price-desc":
      return sorted.sort(
        (a, b) =>
          (parsePrice(getCardDisplayPrice(b)) ?? -1) -
          (parsePrice(getCardDisplayPrice(a)) ?? -1),
      )
    case "price-asc":
      return sorted.sort(
        (a, b) =>
          (parsePrice(getCardDisplayPrice(a)) ?? Number.POSITIVE_INFINITY) -
          (parsePrice(getCardDisplayPrice(b)) ?? Number.POSITIVE_INFINITY),
      )
  }
}

function wheelDeltaY(event: WheelEvent, element: HTMLElement): number {
  const { deltaY, deltaMode } = event
  if (deltaY === 0) return 0
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) return deltaY * 16
  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return deltaY * element.clientHeight
  return deltaY
}

/** ネストしたスクロール領域の端で、ページ全体へホイール操作を渡す */
function chainPageScrollOnNestedBoundary(event: WheelEvent) {
  const node = event.currentTarget as HTMLElement
  const pageDelta = wheelDeltaY(event, node)
  if (pageDelta === 0) return

  const { scrollTop, scrollHeight, clientHeight } = node
  const maxScrollTop = scrollHeight - clientHeight
  if (maxScrollTop <= 1) return

  const atTop = scrollTop <= 0
  const atBottom = scrollTop >= maxScrollTop - 1

  if ((pageDelta > 0 && atBottom) || (pageDelta < 0 && atTop)) {
    event.preventDefault()
    window.scrollBy({ top: pageDelta, left: 0 })
  }
}

export function GadgetExplorer() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc")
  const [cardSize, setCardSize] = useState<CardSize>("medium")
  const [activeFilters, setActiveFilters] = useState<FilterId[]>([])
  const [appliedPriceRange, setAppliedPriceRange] = useState<AppliedPriceRange>(EMPTY_PRICE_RANGE)
  const [priceFilterOpen, setPriceFilterOpen] = useState(false)
  const [specFilterOpen, setSpecFilterOpen] = useState(false)
  const specFilterScrollRef = useRef<HTMLDivElement>(null)
  const [openGadget, setOpenGadget] = useState<Gadget | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [visibleCount, setVisibleCount] = useState(() => getItemsPerPage("medium"))
  const listableGadgets = useMemo(() => getListableGadgets(gadgets, false), [])

  useLayoutEffect(() => {
    if (window.matchMedia(`(min-width: ${MOBILE_CARD_SIZE_MAX_WIDTH_PX + 1}px)`).matches) {
      setCardSize("large")
      setVisibleCount(getItemsPerPage("large"))
    }
  }, [])

  const searchableGadgets = useMemo(
    () => buildSearchableGadgets(listableGadgets),
    [listableGadgets],
  )

  const gadgetsByCategory = useMemo(
    () => buildGadgetsByCategory(listableGadgets),
    [listableGadgets],
  )

  const searchableByCategory = useMemo(
    () => buildSearchableByCategory(searchableGadgets),
    [searchableGadgets],
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId | "all", number> = { all: listableGadgets.length }
    for (const category of categories) {
      counts[category.id] = gadgetsByCategory.get(category.id)?.length ?? 0
    }
    return counts
  }, [listableGadgets.length, gadgetsByCategory])

  const categoryGadgets = useMemo(() => {
    if (activeCategory === "all") return listableGadgets
    return gadgetsByCategory.get(activeCategory) ?? []
  }, [activeCategory, listableGadgets, gadgetsByCategory])

  const priceSliderMax = useMemo(
    () =>
      computePriceSliderMax(
        categoryGadgets.map((gadget) => getCardDisplayPrice(gadget)),
      ),
    [categoryGadgets],
  )

  const gadgetById = useMemo(
    () => new Map(listableGadgets.map((gadget) => [gadget.id, gadget])),
    [listableGadgets],
  )

  const compareIdSet = useMemo(() => new Set(compareIds), [compareIds])
  const compareAtMax = compareIds.length >= MAX_COMPARE_ITEMS

  const visibleFilterGroups = useMemo(
    () => getFilterGroupsForCategory(activeCategory, categoryGadgets),
    [activeCategory, categoryGadgets],
  )

  const allowedFilterIds = useMemo(
    () => new Set(visibleFilterGroups.flatMap((group) => group.filters.map((filter) => filter.id))),
    [visibleFilterGroups],
  )

  useLayoutEffect(() => {
    setActiveFilters((prev) => {
      const next = prev.filter((id) => allowedFilterIds.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [allowedFilterIds])

  function selectCategory(category: CategoryId | "all") {
    setActiveCategory(category)
  }

  function clearAllFilters() {
    setActiveFilters([])
    setAppliedPriceRange(EMPTY_PRICE_RANGE)
  }

  function resetAllConditions() {
    setQuery("")
    selectCategory("all")
    clearAllFilters()
  }

  const activeFilterCount =
    activeFilters.length + (isPriceRangeActive(appliedPriceRange) ? 1 : 0)

  const categoryQueryPool = useMemo(() => {
    if (!query.trim()) return categoryGadgets

    const source =
      activeCategory === "all"
        ? searchableGadgets
        : searchableByCategory.get(activeCategory) ?? []

    const result: Gadget[] = []
    for (const item of source) {
      if (!gadgetMatchesSearchQuery(item.searchText, query)) continue
      result.push(item.gadget)
    }
    return result
  }, [categoryGadgets, searchableGadgets, searchableByCategory, activeCategory, query])

  const categoryPoolCount = categoryQueryPool.length

  const matchFilters = useMemo(
    () => createFilterMatcher(activeFilters, activeCategory, categoryGadgets, visibleFilterGroups),
    [activeFilters, activeCategory, categoryGadgets, visibleFilterGroups],
  )

  const isPriceFiltered = isPriceRangeActive(appliedPriceRange)

  function clearPriceFilter() {
    setAppliedPriceRange(EMPTY_PRICE_RANGE)
  }

  const filtered = useMemo(() => {
    const list = categoryQueryPool.filter(
      (gadget) => matchFilters(gadget) && matchesPriceRange(gadget, appliedPriceRange),
    )
    return sortGadgets(list, sortBy)
  }, [categoryQueryPool, matchFilters, appliedPriceRange, sortBy])

  useEffect(() => {
    setVisibleCount(getItemsPerPage(cardSize))
  }, [query, activeCategory, sortBy, activeFilters, appliedPriceRange, cardSize])

  const skipCategoryScrollRef = useRef(true)
  useEffect(() => {
    if (skipCategoryScrollRef.current) {
      skipCategoryScrollRef.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeCategory])

  const visibleGadgets = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  )

  const hasMoreGadgets = visibleCount < filtered.length

  const filteredCount = filtered.length
  const specFilterCardTitle =
    activeCategory === "all"
      ? "絞り込み"
      : `${getCategoryFilterTitle(activeCategory)}の絞り込み`

  const compareGadgets = useMemo(
    () =>
      compareIds
        .map((id) => gadgetById.get(id))
        .filter((gadget): gadget is Gadget => Boolean(gadget)),
    [compareIds, gadgetById],
  )

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_COMPARE_ITEMS
          ? [...prev, id]
          : prev,
    )
  }, [])

  const handleOpenGadget = useCallback(
    (id: string) => {
      const gadget = gadgetById.get(id)
      if (gadget) setOpenGadget(gadget)
    },
    [gadgetById],
  )

  const toggleFilter = useCallback((id: FilterId) => {
    setActiveFilters((prev) => toggleFilterSelection(prev, id))
  }, [])

  useEffect(() => {
    if (!specFilterOpen) return
    const node = specFilterScrollRef.current
    if (!node) return

    node.addEventListener("wheel", chainPageScrollOnNestedBoundary, { passive: false })
    return () => node.removeEventListener("wheel", chainPageScrollOnNestedBoundary)
  }, [specFilterOpen, activeCategory, visibleFilterGroups.length])

  const handleCardSizeChange = (size: CardSize) => {
    setCardSize(size)
    setVisibleCount(getItemsPerPage(size))
  }

  const searchField = (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="メーカー名・特徴等の調べたい情報で検索"
        aria-label="ガジェットを検索"
        className="w-full rounded-2xl border border-border/70 bg-card py-3 pl-10 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="検索をクリア"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )

  const sortSelect = (
    <div className="relative w-full sm:w-56">
      <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        aria-label="並べ替え"
        className="h-full w-full cursor-pointer appearance-none rounded-2xl border border-border/70 bg-card py-3 pl-10 pr-10 text-sm text-foreground shadow-sm transition-colors hover:border-primary/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
    </div>
  )

  const categoryTagsRow = (rowClassName?: string) => (
    <CategoryScrollRow className={cn("mt-3", rowClassName)}>
      <CategoryTag
        active={activeCategory === "all"}
        label="すべて"
        count={categoryCounts.all}
        showCount
        onClick={() => selectCategory("all")}
      />
      {categories.map((c) => (
        <CategoryTag
          key={c.id}
          active={activeCategory === c.id}
          label={c.label}
          count={categoryCounts[c.id]}
          showCount={activeCategory === c.id}
          category={c.id}
          onClick={() => selectCategory(c.id)}
        />
      ))}
    </CategoryScrollRow>
  )

  return (
    <div className="pb-28">
      {/* スマホ: 検索・ソート（スクロールで隠れる） */}
      <div className={cn(headerShellClassName, "w-full sm:hidden")}>
        <div className={headerDotOverlayClassName} aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-3">
            {searchField}
            {sortSelect}
          </div>
        </div>
      </div>

      {/* スマホ: カードサイズ・カテゴリのみ sticky */}
      <div className="sticky top-0 z-10 w-full border-b border-slate-200/80 bg-white shadow-sm sm:hidden">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <CardSizeToggle value={cardSize} onChange={handleCardSizeChange} />
          {categoryTagsRow("mt-2.5")}
        </div>
      </div>

      {/* PC: 検索・並べ替え・カテゴリ（従来どおり一式 sticky） */}
      <div className={cn(headerShellClassName, "sticky top-0 z-30 hidden w-full sm:block")}>
        <div className={headerDotOverlayClassName} aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-row items-stretch gap-3">
            {searchField}
            <div className="flex shrink-0 flex-row items-stretch gap-2">
              <CardSizeToggle value={cardSize} onChange={handleCardSizeChange} />
              {sortSelect}
            </div>
          </div>
          {categoryTagsRow()}
        </div>
      </div>

      {/* 絞り込み（初期は折りたたみ・スクロール領域を確保） */}
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <div className="space-y-2">
          <FilterCollapsibleCard
            title="価格で絞り込む"
            titleAddon={
              isPriceFiltered ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  適用中
                </span>
              ) : null
            }
            open={priceFilterOpen}
            onToggle={() => setPriceFilterOpen((o) => !o)}
            trailing={
              isPriceFiltered ? (
                <button
                  type="button"
                  onClick={clearPriceFilter}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  クリア
                </button>
              ) : null
            }
          >
            <PriceRangeFilter
              appliedRange={appliedPriceRange}
              sliderMax={priceSliderMax}
              onApply={setAppliedPriceRange}
              onClear={clearPriceFilter}
              hideTitle
              className="px-1 py-1"
            />
          </FilterCollapsibleCard>

          <FilterCollapsibleCard
            title={specFilterCardTitle}
            open={specFilterOpen}
            onToggle={() => setSpecFilterOpen((o) => !o)}
            trailing={
              <span className="inline-flex shrink-0 items-center gap-2">
                <FilterResultBadge filtered={filteredCount} total={categoryPoolCount} />
                {activeFilterCount > 0 && (
                  <>
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      クリア
                    </button>
                  </>
                )}
              </span>
            }
            subtitle="同一グループ内は OR、グループ間は AND で絞り込みます。"
          >
            <div
              ref={specFilterScrollRef}
              className="max-h-[min(50vh,28rem)] touch-pan-y space-y-1 overflow-y-auto overscroll-y-auto pr-0.5"
            >
              {activeCategory === "all" && (
                <div className="px-1 pb-3 pt-1">
                  <CategorySelectPrompt onSelect={selectCategory} />
                </div>
              )}
              {visibleFilterGroups.map((group) => (
                <FlatFilterGroup
                  key={group.id}
                  group={group}
                  activeFilters={activeFilters}
                  onToggle={toggleFilter}
                />
              ))}
            </div>
          </FilterCollapsibleCard>
        </div>
      </div>

      {/* カードリスト */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {categoryPoolCount > filteredCount ? (
              <>
                全
                <span className="mx-0.5 font-mono font-medium text-foreground">
                  {categoryPoolCount}
                </span>
                件中
              </>
            ) : null}
            <span className="font-mono font-medium text-foreground">{filteredCount}</span>
            件のガジェット
          </p>
          <FilterResultBadge filtered={filteredCount} total={categoryPoolCount} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card py-20 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">条件に一致するガジェットがありません。</p>
            {(activeFilterCount > 0 || query || activeCategory !== "all") && (
              <button
                type="button"
                onClick={resetAllConditions}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                すべての条件をリセット
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={cn(CARD_GRID_BY_SIZE[cardSize], "transition-[gap] duration-200")}>
              {visibleGadgets.map((g) => (
                <GadgetCard
                  key={g.purchaseUrl || g.id}
                  gadget={g}
                  size={cardSize}
                  onOpen={handleOpenGadget}
                  onToggleCompare={toggleCompare}
                  isComparing={compareIdSet.has(g.id)}
                  compareDisabled={compareAtMax}
                />
              ))}
            </div>
            {hasMoreGadgets && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) =>
                      Math.min(count + getItemsPerPage(cardSize), filtered.length),
                    )
                  }
                  className="inline-flex items-center rounded-xl border border-border/70 bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  もっと見る（残り {filtered.length - visibleCount} 件）
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 比較バー */}
      {compareGadgets.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 shadow-[0_-4px_24px_oklch(0.22_0.02_260_/_6%)] backdrop-blur-md animate-in slide-in-from-bottom">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              比較
              <span className="ml-1 font-mono font-medium text-foreground">
                {compareGadgets.length}/{MAX_COMPARE_ITEMS}
              </span>
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:thin]">
              {compareGadgets.map((g) => (
                <div key={g.id} className="relative shrink-0">
                  <div className="relative size-10 overflow-hidden rounded-lg bg-gradient-to-b from-secondary/40 to-card shadow-sm ring-1 ring-border/60 sm:size-11">
                    <GadgetImage
                      src={g.image}
                      alt={`${g.brand} ${g.name}`}
                      category={g.category}
                      sizes="44px"
                      className="p-1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(g.id)}
                    aria-label={`${g.name} を外す`}
                    className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-border/60 transition-colors hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="hidden shrink-0 text-xs text-muted-foreground hover:text-foreground sm:inline"
            >
              クリア
            </button>
            <button
              type="button"
              disabled={compareGadgets.length < 2}
              onClick={() => setShowCompare(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2"
            >
              <GitCompareArrows className="size-4" />
              <span className="hidden sm:inline">比較する</span>
              <span className="sm:hidden">比較</span>
            </button>
          </div>
        </div>
      )}

      <GadgetDetail gadget={openGadget} onClose={() => setOpenGadget(null)} />

      {showCompare && compareGadgets.length >= 2 && (
        <CompareView
          gadgets={compareGadgets}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => {
            const next = compareIds.filter((x) => x !== id)
            setCompareIds(next)
            if (next.length < 2) setShowCompare(false)
          }}
        />
      )}
    </div>
  )
}

function CardSizeToggle({
  value,
  onChange,
}: {
  value: CardSize
  onChange: (value: CardSize) => void
}) {
  return (
    <div
      role="group"
      aria-label="カード表示サイズ"
      className="inline-flex self-stretch rounded-2xl border border-border/70 bg-card p-1 shadow-sm"
    >
      {CARD_SIZE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-w-[2.75rem] flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:min-w-0 sm:flex-none sm:text-sm",
            value === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function CountSkeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block animate-pulse rounded bg-muted", className)}
      aria-hidden
    />
  )
}

function FilterResultBadge({
  filtered,
  total,
  ready = true,
}: {
  filtered: number
  total: number
  ready?: boolean
}) {
  if (!ready) {
    return <CountSkeleton className="h-5 w-14 rounded-full" />
  }

  const isNarrowed = filtered < total

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5"
      aria-label={
        isNarrowed ? `全${total}件中${filtered}件を表示` : `${filtered}件を表示`
      }
    >
      {isNarrowed && (
        <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
          全{total}件中
        </span>
      )}
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-primary ring-1 ring-primary/25">
        {filtered}件
      </span>
    </span>
  )
}

function CategorySelectPrompt({ onSelect }: { onSelect: (category: CategoryId) => void }) {
  return (
    <div className="rounded-xl bg-accent/50 px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            カテゴリを選ぶと、専用の絞り込みが使えます
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            接続方式・DPI・レイアウト・解像度など、カテゴリごとに最適なフィルターが表示されます。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/60"
              >
                <CategoryIcon category={c.id} className="size-3.5 text-primary/80" />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterCollapsibleCard({
  title,
  titleAddon,
  open,
  onToggle,
  trailing,
  subtitle,
  children,
}: {
  title: string
  titleAddon?: ReactNode
  open: boolean
  onToggle: () => void
  trailing?: ReactNode
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="overflow-clip rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex w-full items-center gap-2 border-b border-border/40 bg-secondary/25 px-3 py-2.5 transition-colors hover:bg-secondary/40">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <span className="min-w-0 text-xs font-semibold text-foreground">{title}</span>
          {titleAddon}
        </button>
        {trailing ? <div className="flex shrink-0 items-center">{trailing}</div> : null}
      </div>
      {open && (
        <div className="px-3 py-3">
          {subtitle && (
            <p className="mb-3 text-[10px] leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

function FlatFilterGroup({
  group,
  activeFilters,
  onToggle,
}: {
  group: FilterGroup
  activeFilters: FilterId[]
  onToggle: (id: FilterId) => void
}) {
  const activeCount = group.filters.filter((f) => activeFilters.includes(f.id)).length

  return (
    <div className="border-b border-border/40 px-1 py-3 last:border-b-0 first:pt-0">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-xs font-semibold text-foreground">{group.label}</h4>
        {activeCount > 0 && (
          <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            active={activeFilters.includes(filter.id)}
            onClick={() => onToggle(filter.id)}
            compact
          />
        ))}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  label,
  onClick,
  compact = false,
}: {
  active: boolean
  label: string
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}

function CategoryTag({
  active,
  label,
  count,
  showCount = false,
  countsReady = true,
  category,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  showCount?: boolean
  countsReady?: boolean
  category?: CategoryId
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-card text-muted-foreground shadow-sm ring-1 ring-border/70 hover:text-foreground hover:ring-primary/30",
      )}
    >
      {category && (
        <CategoryIcon
          category={category}
          className={cn("size-3.5", active ? "text-primary-foreground/90" : "text-primary/70")}
        />
      )}
      {label}
      {showCount &&
        (countsReady ? (
          <span
            className={cn(
              "font-mono text-xs",
              active ? "text-primary-foreground/75" : "text-muted-foreground/70",
            )}
          >
            {count}
          </span>
        ) : (
          <CountSkeleton className="h-3.5 w-8 rounded-full" />
        ))}
    </button>
  )
}

import type { GuidePoint, GuidePointSegment, GuidePointsLayout } from "@/lib/guide-content"
import { cn } from "@/lib/utils"

/** 日本語本文：リード・箇条書きで同じ折り返し（auto-phrase + 禁則）。text-pretty / max-w-* は使わない */
const guideJapaneseBodyClassName =
  "w-full min-w-0 whitespace-normal break-normal leading-relaxed text-muted-foreground [line-break:strict] [overflow-wrap:break-word] [word-break:auto-phrase] [text-wrap:wrap]"

const guidePointProseClassName = cn(guideJapaneseBodyClassName, "text-sm")

const guidePointBulletProseClassName = cn(guideJapaneseBodyClassName, "text-xs sm:text-sm")

function renderSegments(segments: GuidePointSegment[]) {
  return segments.map((segment, index) =>
    segment.type === "strong" ? (
      <strong key={index} className="font-semibold text-foreground">
        {segment.value}
      </strong>
    ) : (
      <span key={index}>{segment.value}</span>
    ),
  )
}

function renderGuidePointDescription(point: GuidePoint) {
  if (point.descSegments?.length) {
    return renderSegments(point.descSegments)
  }
  return point.desc ?? null
}

function GuidePointNumberBadge({ index }: { index: number }) {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold tabular-nums text-primary sm:size-9 sm:text-base"
    >
      {index + 1}
    </span>
  )
}

function GuidePointCallout({ point }: { point: GuidePoint }) {
  if (point.calloutSegments?.length) {
    return (
      <div
        className={cn(
          "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:px-4 sm:py-3 sm:text-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
          guideJapaneseBodyClassName,
        )}
      >
        {renderSegments(point.calloutSegments)}
      </div>
    )
  }
  if (point.callout) {
    return (
      <p
        className={cn(
          "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:px-4 sm:py-3 sm:text-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
          guideJapaneseBodyClassName,
        )}
      >
        {point.callout}
      </p>
    )
  }
  return null
}

function GuidePointBulletList({
  bullets,
  variant,
  stackedColumns = 2,
}: {
  bullets: NonNullable<GuidePoint["bullets"]>
  variant: "stacked" | "compact"
  stackedColumns?: 1 | 2
}) {
  if (variant === "stacked") {
    return (
      <ul
        className={cn(
          "grid list-none gap-2.5 sm:gap-3",
          stackedColumns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {bullets.map((bullet) => (
          <li
            key={bullet.label}
            className="min-w-0 rounded-lg border border-slate-200/90 bg-slate-50/90 p-3 sm:p-3.5"
          >
            <strong className="block text-sm font-bold leading-snug text-foreground">
              {bullet.label}
            </strong>
            <p className={cn("mt-1.5", guidePointBulletProseClassName)}>{bullet.text}</p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-2 text-xs sm:space-y-2.5 md:text-sm">
      {bullets.map((bullet) => (
        <li
          key={bullet.label}
          className="flex flex-col gap-1 border-l-2 border-primary/25 pl-3 sm:pl-3.5"
        >
          <strong className="font-bold leading-snug text-foreground">{bullet.label}</strong>
          <span className={guidePointBulletProseClassName}>{bullet.text}</span>
        </li>
      ))}
    </ul>
  )
}

function StackedWideGuidePointCard({
  point,
  index,
}: {
  point: GuidePoint
  index: number
}) {
  const description = renderGuidePointDescription(point)
  const bulletCount = point.bullets?.length ?? 0
  const stackedColumns: 1 | 2 = bulletCount === 1 || bulletCount === 3 ? 1 : 2

  return (
    <article
      lang="ja"
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-start gap-3">
          <GuidePointNumberBadge index={index} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
              ポイント {index + 1}
            </p>
            <h3 className="mt-0.5 text-base font-bold leading-snug text-foreground sm:text-lg md:text-xl">
              {point.head}
            </h3>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
        {description ? (
          <p className={guidePointProseClassName}>{description}</p>
        ) : null}

        {point.bullets?.length ? (
          <GuidePointBulletList
            bullets={point.bullets}
            variant="stacked"
            stackedColumns={stackedColumns}
          />
        ) : null}

        {point.subCards?.length ? (
          <div
            className={cn(
              "grid gap-2.5 text-xs sm:gap-3",
              point.subCardsColumns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1",
            )}
          >
            {point.subCards.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-3.5"
              >
                <div className="text-sm font-bold text-foreground">{card.title}</div>
                {card.text ? (
                  <p className={cn("mt-1", guidePointBulletProseClassName)}>{card.text}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <GuidePointCallout point={point} />
      </div>
    </article>
  )
}

type GuidePointsSectionProps = {
  title: string
  titleIcon?: string
  subtitle: string
  points: GuidePoint[]
  layout?: GuidePointsLayout
  boxed?: boolean
}

export function GuidePointsSection({
  title,
  titleIcon,
  subtitle,
  points,
  layout = "single-column",
  boxed = false,
}: GuidePointsSectionProps) {
  const isStackedWide = layout === "stacked-wide"
  const isFourColumn = layout === "four-column"
  const isThreeColumn = layout === "three-column"
  const isTwoColumn = layout === "two-column"
  const isCardGrid = isTwoColumn || isThreeColumn || isFourColumn

  const inner = (
    <>
      <div
        className={cn(
          "space-y-2",
          boxed ? "mb-6" : isStackedWide ? undefined : "mb-2",
        )}
      >
        <h2
          className={cn(
            "font-bold tracking-tight text-foreground",
            boxed
              ? "mb-1.5 flex items-center gap-2 text-lg sm:text-xl md:text-2xl"
              : "text-lg sm:text-xl md:text-2xl",
          )}
        >
          {boxed && titleIcon ? (
            <span aria-hidden className="shrink-0">
              {titleIcon}
            </span>
          ) : null}
          {title}
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{subtitle}</p>
      </div>

      {isStackedWide ? (
        <div className="flex w-full flex-col gap-4 sm:gap-5">
          {points.map((point, index) => (
            <StackedWideGuidePointCard key={point.head} point={point} index={index} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid items-start",
            isFourColumn
              ? "grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
              : isThreeColumn
                ? "grid-cols-1 gap-6 md:grid-cols-3"
                : isTwoColumn
                  ? "grid-cols-1 gap-6 md:grid-cols-2"
                  : "grid-cols-1 gap-4 md:gap-5",
          )}
        >
          {points.map((point, index) => {
            const description = renderGuidePointDescription(point)
            return (
              <div
                key={point.head}
                className={cn(
                  "rounded-xl border shadow-sm",
                  isCardGrid
                    ? cn(
                        "flex h-full flex-col justify-between border-slate-200 bg-white p-4 sm:p-6",
                        isThreeColumn && "rounded-2xl",
                      )
                    : "space-y-1.5 border-slate-200 bg-white p-4 sm:space-y-2 sm:p-5",
                  isTwoColumn && point.fullWidth && "md:col-span-2",
                )}
              >
                <div>
                  <h3
                    className={cn(
                      "mb-2 text-base font-bold text-foreground md:text-lg",
                      isCardGrid && point.subCardsColumns === 3 && "mb-3",
                    )}
                  >
                    ポイント{index + 1} {point.head}
                  </h3>
                  {description ? (
                    <p
                      className={cn(
                        guidePointBulletProseClassName,
                        point.subCardsVariant === "plain" ? "mb-4" : "mb-3",
                        !point.subCards?.length && !point.bullets?.length && "mb-0",
                      )}
                    >
                      {description}
                    </p>
                  ) : null}
                  {point.bullets?.length ? (
                    <div className="mt-1 border-t border-border/50 pt-3">
                      <GuidePointBulletList bullets={point.bullets} variant="compact" />
                    </div>
                  ) : null}
                  {point.subCards?.length ? (
                    <div
                      className={cn(
                        "text-xs",
                        point.subCardsColumns === 3 && point.subCardsVariant === "plain"
                          ? "grid grid-cols-1 gap-1.5 border-t border-border/60 pt-2 sm:grid-cols-3 sm:gap-2 sm:pt-3 md:gap-3"
                          : point.subCardsColumns === 3
                            ? "grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5"
                            : "space-y-1.5 sm:space-y-2.5",
                      )}
                    >
                      {point.subCards.map((card, cardIndex) => {
                        const isPlainRow =
                          point.subCardsColumns === 3 && point.subCardsVariant === "plain"
                        return (
                          <div
                            key={card.title}
                            className={cn(
                              isPlainRow
                                ? cn(
                                    "flex min-w-0 flex-col gap-0.5 sm:gap-1",
                                    cardIndex > 0 &&
                                      "border-t border-border/60 pt-1.5 sm:border-l sm:border-t-0 sm:pt-0 sm:pl-2.5 md:pl-3",
                                  )
                                : cn(
                                    "rounded-lg border border-slate-200 bg-slate-50",
                                    point.subCardsColumns === 3
                                      ? "flex min-w-0 flex-col justify-between p-3"
                                      : "space-y-1 p-2.5",
                                  ),
                            )}
                          >
                            <p
                              className={cn(
                                "font-bold text-foreground",
                                isPlainRow
                                  ? "text-sm font-bold sm:whitespace-nowrap sm:text-xs md:text-sm"
                                  : point.subCardsColumns === 3
                                    ? "text-xs"
                                    : undefined,
                              )}
                            >
                              {card.title}
                              {card.titleSuffix ? (
                                <span className="ml-1 text-[10px] font-normal text-primary">
                                  {card.titleSuffix}
                                </span>
                              ) : null}
                            </p>
                            {card.kicker ? (
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {card.kicker}
                              </p>
                            ) : null}
                            {card.textSegments?.length ? (
                              <p
                                className={cn(
                                  guideJapaneseBodyClassName,
                                  isPlainRow
                                    ? "text-[11px] md:text-xs"
                                    : point.subCardsColumns === 3
                                      ? "mt-1 text-[11px]"
                                      : "text-[11px]",
                                )}
                              >
                                {renderSegments(card.textSegments)}
                              </p>
                            ) : card.text ? (
                              <p
                                className={cn(
                                  guideJapaneseBodyClassName,
                                  isPlainRow
                                    ? "text-[11px] md:text-xs"
                                    : point.subCardsColumns === 3
                                      ? "mt-1 text-[11px]"
                                      : "text-[11px]",
                                )}
                              >
                                {card.text}
                              </p>
                            ) : null}
                            {card.note ? (
                              <p className="pt-0.5 text-[11px] text-muted-foreground/80">
                                {card.note}
                              </p>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                  {point.callout || point.calloutSegments?.length ? (
                    <div className="mt-3">
                      <GuidePointCallout point={point} />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  return (
    <section
      lang="ja"
      className={cn(
        "mb-12",
        isStackedWide && !boxed && "space-y-6",
        boxed && "my-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:my-10 sm:p-6 md:p-8",
      )}
    >
      {inner}
    </section>
  )
}

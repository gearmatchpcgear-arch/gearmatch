import type { GuidePoint, GuidePointSegment, GuidePointsLayout } from "@/lib/guide-content"
import { cn } from "@/lib/utils"

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

function StackedWideGuidePointCard({
  point,
  index,
}: {
  point: GuidePoint
  index: number
}) {
  const description = renderGuidePointDescription(point)

  return (
    <div className="w-full space-y-2 rounded-2xl border bg-card p-4 shadow-sm sm:space-y-4 sm:p-6">
      <div>
        <h3 className="text-base font-bold text-foreground sm:text-xl">
          ポイント{index + 1} {point.head}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:mt-1 sm:text-sm sm:leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {point.bullets?.length ? (
        <ul className="space-y-1 border-t border-border/60 pt-2 text-xs text-muted-foreground sm:space-y-2 sm:pt-3">
          {point.bullets.map((bullet) => (
            <li
              key={bullet.label}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-1.5"
            >
              <span className="shrink-0 font-bold text-foreground sm:whitespace-nowrap">
                ・{bullet.label}:
              </span>
              <span className="leading-snug sm:leading-relaxed">{bullet.text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {point.subCards?.length ? (
        <div
          className={cn(
            "grid gap-2 border-t pt-2 text-xs",
            point.subCardsColumns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1",
          )}
        >
          {point.subCards.map((card) => (
            <div key={card.title} className="rounded-lg bg-muted p-2.5">
              <div className="font-bold text-foreground">{card.title}</div>
              {card.text ? (
                <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{card.text}</div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {point.calloutSegments?.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {renderSegments(point.calloutSegments)}
        </div>
      ) : point.callout ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {point.callout}
        </p>
      ) : null}
    </div>
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
            boxed ? "mb-1.5 flex items-center gap-2 text-xl md:text-2xl" : "text-2xl",
          )}
        >
          {boxed && titleIcon ? (
            <span aria-hidden className="shrink-0">
              {titleIcon}
            </span>
          ) : null}
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {isStackedWide ? (
        <div className="flex w-full flex-col gap-4">
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
                        "flex h-full flex-col justify-between bg-card p-6",
                        isThreeColumn && "rounded-2xl",
                      )
                    : "space-y-1.5 bg-card p-4 sm:space-y-2 sm:p-5",
                  isTwoColumn && point.fullWidth && "md:col-span-2",
                )}
              >
                <div>
                  {isCardGrid ? (
                    <div className={cn("mb-4", point.subCardsColumns === 3 && "mb-3")}>
                      <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        ポイント {index + 1}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-foreground md:text-lg">
                        {point.head}
                      </h3>
                    </div>
                  ) : (
                    <h3 className="mb-2 text-base font-bold text-foreground md:text-lg">
                      ポイント{index + 1} {point.head}
                    </h3>
                  )}
                  {description ? (
                    <p
                      className={cn(
                        "text-xs leading-relaxed text-muted-foreground",
                        point.subCardsVariant === "plain" ? "mb-4" : "mb-3",
                        !point.subCards?.length && !point.bullets?.length && "mb-0",
                      )}
                    >
                      {description}
                    </p>
                  ) : null}
                  {point.bullets?.length ? (
                    <ul className="space-y-1 text-xs text-foreground/90 sm:space-y-1.5 md:text-sm">
                      {point.bullets.map((bullet) => (
                        <li
                          key={bullet.label}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-1"
                        >
                          <strong className="shrink-0 font-bold">{bullet.label}:</strong>
                          <span className="leading-snug text-muted-foreground sm:leading-normal sm:text-foreground/90">
                            {bullet.text}
                          </span>
                        </li>
                      ))}
                    </ul>
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
                                    "rounded-lg border bg-muted/40",
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
                                  "leading-relaxed text-muted-foreground",
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
                                  "leading-relaxed text-muted-foreground",
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
                  {point.calloutSegments?.length ? (
                    <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      {renderSegments(point.calloutSegments)}
                    </div>
                  ) : point.callout ? (
                    <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      {point.callout}
                    </p>
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
      className={cn(
        "mb-12",
        isStackedWide && !boxed && "space-y-6",
        boxed && "my-10 rounded-2xl border bg-card p-6 shadow-sm md:p-8",
      )}
    >
      {inner}
    </section>
  )
}

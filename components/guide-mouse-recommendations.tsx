"use client"

import { useMemo } from "react"
import { CheckCircle2 } from "lucide-react"
import {
  GuideRecommendationsHeader,
  GuideRecommendationsPanel,
  GuideRecommendationsSection,
  GuideRecommendationsTabs,
  guideRecommendationsHeroImageClassName,
  guideRecommendationsImageAreaClassName,
  guideRecommendationsInnerInsetClassName,
  guideRecommendationsMidGridClassName,
  guideRecommendationsProductColumnClassName,
  guideRecommendationsProductSummaryClassName,
  guideRecommendationsReasonColumnClassName,
} from "@/components/guide-recommendations-layout"
import { GuideCardBadge } from "@/components/guide-card-badge"
import { GuideRecommendationImageBlock } from "@/components/guide-recommendation-image-block"
import { GadgetImage } from "@/components/gadget-image"
import { ShopLink } from "@/components/shop-link"
import {
  GUIDE_MOUSE_BEGINNER_HYPERX,
  GUIDE_MOUSE_BEGINNER_UPGRADE,
  GUIDE_MOUSE_OFFICE_M750,
  GUIDE_MOUSE_OFFICE_MX_MASTER_3S,
  GUIDE_MOUSE_OFFICE_TECKNET,
  GUIDE_MOUSE_PRO_G502,
  GUIDE_MOUSE_PRO_SUPERSTRIKE,
  GUIDE_MOUSE_RECOMMENDATIONS,
  GUIDE_MOUSE_TABS,
  type GuideMouseReason,
} from "@/lib/guide-mouse-recommendations"
import {
  gadgets,
  type Gadget,
} from "@/lib/gadgets"
import { resolveGuidePriceLabel } from "@/lib/guide-price-label"
import {
  guideProductMetaLineClassName,
  guideProductPriceSlotClassName,
  guideProductReasonHeadingClassName,
  guideProductShopButtonSlotClassName,
  guideProductSpecRowClassName,
  guideProductSpecSlotClassName,
  guideProductSpecValueClassName,
  guideProductSummaryPanelClassName,
  guideProductTitleTwoLineClassName,
} from "@/lib/product-card-layout"
import { guideCategoryPath } from "@/lib/guide-routes"
import { useGuideRecommendationTabId } from "@/lib/use-guide-recommendation-tab-id"
import { cn } from "@/lib/utils"

function resolveGadget(gadgetId: string, pool: Gadget[]): Gadget | undefined {
  return pool.find((g) => g.id === gadgetId) ?? gadgets.find((g) => g.id === gadgetId)
}

function reasonKey(reason: GuideMouseReason): string {
  return typeof reason === "string" ? reason : reason.emphasis
}

function renderReasonContent(reason: GuideMouseReason) {
  if (typeof reason === "string") return reason
  return (
    <>
      <strong>{reason.emphasis}</strong> {reason.text}
    </>
  )
}

const MOUSE_TAB_IDS = GUIDE_MOUSE_TABS.map((tab) => tab.id)

export function GuideMouseRecommendations({ pool }: { pool: Gadget[] }) {
  const selectedType = useGuideRecommendationTabId(MOUSE_TAB_IDS, "beginner")

  const currentItem =
    selectedType === "office"
      ? undefined
      : (GUIDE_MOUSE_RECOMMENDATIONS.find((item) => item.id === selectedType) ??
        GUIDE_MOUSE_RECOMMENDATIONS[0])

  const currentGadget = useMemo(
    () => (currentItem ? resolveGadget(currentItem.gadgetId, pool) : undefined),
    [currentItem, pool],
  )

  const upgradeGadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_BEGINNER_UPGRADE.gadgetId, pool),
    [pool],
  )

  const hyperxGadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_BEGINNER_HYPERX.gadgetId, pool),
    [pool],
  )

  const superstrikeGadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_PRO_SUPERSTRIKE.gadgetId, pool),
    [pool],
  )

  const g502Gadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_PRO_G502.gadgetId, pool),
    [pool],
  )

  const tecknetGadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_OFFICE_TECKNET.gadgetId, pool),
    [pool],
  )

  const m750Gadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_OFFICE_M750.gadgetId, pool),
    [pool],
  )

  const mxMaster3sGadget = useMemo(
    () => resolveGadget(GUIDE_MOUSE_OFFICE_MX_MASTER_3S.gadgetId, pool),
    [pool],
  )

  return (
    <GuideRecommendationsSection>
      <GuideRecommendationsHeader categoryLabel="マウス" compareHref="/" />
      <GuideRecommendationsTabs
        tabs={GUIDE_MOUSE_TABS}
        selectedId={selectedType}
        tabHrefBase={guideCategoryPath("mouse")}
      />

      <GuideRecommendationsPanel tabId={selectedType}>
      {currentItem ? (
      <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
        <div className={guideRecommendationsProductColumnClassName}>
          <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
          <GuideRecommendationImageBlock
            className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
            badge={<GuideCardBadge>{currentItem.badge}</GuideCardBadge>}
          >
            {currentGadget ? (
              <GadgetImage
                src={currentGadget.image}
                alt={currentItem.title}
                category="mouse"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                画像を準備中
              </div>
            )}
          </GuideRecommendationImageBlock>

          <h3 className={guideProductTitleTwoLineClassName}>{currentItem.title}</h3>

          <p className={guideProductMetaLineClassName}>
            {currentItem.modelNumber ? `型番: ${currentItem.modelNumber}` : "\u00A0"}
          </p>

          <div className={guideProductPriceSlotClassName}>
            {resolveGuidePriceLabel(
              currentGadget,
              currentItem.priceLabel,
              "価格はAmazonでご確認ください",
            )}
          </div>

          <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
            <div className={guideProductSpecRowClassName}>
              <span>重量</span>
              <span className={guideProductSpecValueClassName}>{currentItem.specs.weight}</span>
            </div>
            <div className={guideProductSpecRowClassName}>
              <span>接続</span>
              <span className={guideProductSpecValueClassName}>
                {currentItem.specs.connection}
              </span>
            </div>
            {currentItem.specs.sensitivity ? (
              <>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {currentItem.specs.sensitivity}
                  </span>
                </div>
                {currentItem.specs.buttons ? (
                  <div className={guideProductSpecRowClassName}>
                    <span>ボタン数</span>
                    <span className={guideProductSpecValueClassName}>
                      {currentItem.specs.buttons}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className={guideProductSpecRowClassName}>
                  <span>センサー</span>
                  <span className={guideProductSpecValueClassName}>
                    {currentItem.specs.sensor}
                  </span>
                </div>
                {currentItem.specs.battery ? (
                  <div className={guideProductSpecRowClassName}>
                    <span>バッテリー</span>
                    <span className={guideProductSpecValueClassName}>
                      {currentItem.specs.battery}
                    </span>
                  </div>
                ) : null}
                {currentItem.specs.buttons ? (
                  <div className={guideProductSpecRowClassName}>
                    <span>ボタン数</span>
                    <span className={guideProductSpecValueClassName}>
                      {currentItem.specs.buttons}
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>
          </div>

          {currentGadget ? (
            <div className={guideProductShopButtonSlotClassName}>
              <ShopLink
                gadget={currentGadget}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              />
            </div>
          ) : null}
          </div>
        </div>

        <div className={guideRecommendationsReasonColumnClassName}>
          <h4 className={guideProductReasonHeadingClassName}>
            {currentItem.reasonsHeading ?? "なぜこのマウスがおすすめなのか？"}
          </h4>

          <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
            {currentItem.reasons.map((reason) => (
              <li key={reasonKey(reason)} className="flex items-start gap-2">
                {currentItem.reasonsHeading ? (
                  <span className="shrink-0 text-primary" aria-hidden>
                    ✔
                  </span>
                ) : (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" aria-hidden />
                )}
                <span>{renderReasonContent(reason)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      ) : null}

      {selectedType === "beginner" ? (
        <div className="mt-8 space-y-8 border-t border-slate-200 pt-6">
          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_BEGINNER_UPGRADE.badge}</GuideCardBadge>}
              >
                {upgradeGadget ? (
                  <GadgetImage
                    src={upgradeGadget.image}
                    alt={GUIDE_MOUSE_BEGINNER_UPGRADE.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_BEGINNER_UPGRADE.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_BEGINNER_UPGRADE.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(upgradeGadget)}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {upgradeGadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={upgradeGadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                予算に余裕があるなら「これを選んでおけば間違いなし」の最高峰
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_BEGINNER_UPGRADE.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_BEGINNER_HYPERX.badge}</GuideCardBadge>}
              >
                {hyperxGadget ? (
                  <GadgetImage
                    src={hyperxGadget.image}
                    alt={GUIDE_MOUSE_BEGINNER_HYPERX.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_BEGINNER_HYPERX.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_BEGINNER_HYPERX.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(hyperxGadget)}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {hyperxGadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={hyperxGadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                {GUIDE_MOUSE_BEGINNER_HYPERX.heading}
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_BEGINNER_HYPERX.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {selectedType === "pro" ? (
        <div className="mt-8 space-y-8 border-t border-slate-200 pt-6">
          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_PRO_SUPERSTRIKE.badge}</GuideCardBadge>}
              >
                {superstrikeGadget ? (
                  <GadgetImage
                    src={superstrikeGadget.image}
                    alt={GUIDE_MOUSE_PRO_SUPERSTRIKE.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_PRO_SUPERSTRIKE.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_PRO_SUPERSTRIKE.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(superstrikeGadget)}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {superstrikeGadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={superstrikeGadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                {GUIDE_MOUSE_PRO_SUPERSTRIKE.heading}
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_PRO_SUPERSTRIKE.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_PRO_G502.badge}</GuideCardBadge>}
              >
                {g502Gadget ? (
                  <GadgetImage
                    src={g502Gadget.image}
                    alt={GUIDE_MOUSE_PRO_G502.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_PRO_G502.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_PRO_G502.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(g502Gadget)}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_G502.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_G502.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_G502.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_PRO_G502.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {g502Gadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={g502Gadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                {GUIDE_MOUSE_PRO_G502.heading}
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_PRO_G502.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {selectedType === "office" ? (
        <div className="space-y-8">
          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_OFFICE_TECKNET.badge}</GuideCardBadge>}
              >
                {tecknetGadget ? (
                  <GadgetImage
                    src={tecknetGadget.image}
                    alt={GUIDE_MOUSE_OFFICE_TECKNET.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_OFFICE_TECKNET.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_OFFICE_TECKNET.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(
                  tecknetGadget,
                  GUIDE_MOUSE_OFFICE_TECKNET.priceLabel,
                )}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {tecknetGadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={tecknetGadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                {GUIDE_MOUSE_OFFICE_TECKNET.heading}
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_OFFICE_TECKNET.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_OFFICE_M750.badge}</GuideCardBadge>}
              >
                {m750Gadget ? (
                  <GadgetImage
                    src={m750Gadget.image}
                    alt={GUIDE_MOUSE_OFFICE_M750.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_OFFICE_M750.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_OFFICE_M750.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(m750Gadget, GUIDE_MOUSE_OFFICE_M750.priceLabel)}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_M750.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_M750.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_M750.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_M750.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {m750Gadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={m750Gadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                {GUIDE_MOUSE_OFFICE_M750.heading}
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_OFFICE_M750.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={cn(guideRecommendationsMidGridClassName, "min-w-0 max-w-full")}>
            <div className={guideRecommendationsProductColumnClassName}>
              <div className={cn(guideRecommendationsProductSummaryClassName, guideProductSummaryPanelClassName)}>
              <GuideRecommendationImageBlock
                className={cn(guideRecommendationsImageAreaClassName, guideRecommendationsHeroImageClassName)}
                badge={<GuideCardBadge>{GUIDE_MOUSE_OFFICE_MX_MASTER_3S.badge}</GuideCardBadge>}
              >
                {mxMaster3sGadget ? (
                  <GadgetImage
                    src={mxMaster3sGadget.image}
                    alt={GUIDE_MOUSE_OFFICE_MX_MASTER_3S.title}
                    category="mouse"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    画像を準備中
                  </div>
                )}
              </GuideRecommendationImageBlock>

              <h3 className={guideProductTitleTwoLineClassName}>
                {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.title}
              </h3>
              <p className={guideProductMetaLineClassName}>
                型番: {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.modelNumber}
              </p>

              <div className={guideProductPriceSlotClassName}>
                {resolveGuidePriceLabel(
                  mxMaster3sGadget,
                  GUIDE_MOUSE_OFFICE_MX_MASTER_3S.priceLabel,
                )}
              </div>

              <div className={guideProductSpecSlotClassName}>
            <div className={cn(guideRecommendationsInnerInsetClassName, "mt-0 space-y-1.5 text-xs text-muted-foreground")}>
                <div className={guideProductSpecRowClassName}>
                  <span>重量</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.weight}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>接続</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.connection}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>感度</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.sensitivity}
                  </span>
                </div>
                <div className={guideProductSpecRowClassName}>
                  <span>ボタン数</span>
                  <span className={guideProductSpecValueClassName}>
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.buttons}
                  </span>
                </div>
              </div>
              </div>

              {mxMaster3sGadget ? (
                <div className={guideProductShopButtonSlotClassName}>
                  <ShopLink
                    gadget={mxMaster3sGadget}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                </div>
              ) : null}
              </div>
            </div>

            <div className={guideRecommendationsReasonColumnClassName}>
              <h4 className={guideProductReasonHeadingClassName}>
                {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.heading}
              </h4>

              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 sm:space-y-2.5 sm:text-xs md:text-sm">
                {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.reasons.map((reason) => (
                  <li key={reason.emphasis} className="flex items-start gap-2">
                    <span className="shrink-0 text-primary" aria-hidden>
                      ✔
                    </span>
                    <span>
                      <strong>{reason.emphasis}</strong> {reason.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
      </GuideRecommendationsPanel>
    </GuideRecommendationsSection>
  )
}

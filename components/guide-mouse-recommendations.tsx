"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Sparkles } from "lucide-react"
import { GuideCardBadge } from "@/components/guide-card-badge"
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
  type GuideMouseRecommendationId,
  type GuideMouseReason,
} from "@/lib/guide-mouse-recommendations"
import {
  gadgets,
  type Gadget,
} from "@/lib/gadgets"
import { resolveGuidePriceLabel } from "@/lib/guide-price-label"
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

export function GuideMouseRecommendations({ pool }: { pool: Gadget[] }) {
  const [selectedType, setSelectedType] = useState<GuideMouseRecommendationId>("beginner")

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
    <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Sparkles className="size-5 text-primary" aria-hidden />
            あなたに合うおすすめのマウスを選ぶ
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            用途ボタンを選択すると、最適なおすすめモデルと選定理由が表示されます。
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          トップの一覧で比較する →
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {GUIDE_MOUSE_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedType(item.id)}
            aria-pressed={selectedType === item.id}
            className={cn(
              "rounded-lg border px-4 py-3 text-center text-sm font-semibold transition-all",
              selectedType === item.id
                ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                : "border-input bg-background text-foreground hover:bg-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {currentItem ? (
      <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
        <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
          <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
            <GuideCardBadge>{currentItem.badge}</GuideCardBadge>
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
          </div>

          <h3 className="text-base font-bold text-foreground">{currentItem.title}</h3>

          {currentItem.modelNumber ? (
            <p className="mt-1 text-xs text-muted-foreground">型番: {currentItem.modelNumber}</p>
          ) : null}

          <div className="mt-2 text-lg font-bold text-primary">
            {resolveGuidePriceLabel(
              currentGadget,
              currentItem.priceLabel,
              "価格はAmazonでご確認ください",
            )}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <div className="flex justify-between gap-3">
              <span>重量</span>
              <span className="font-medium text-foreground">{currentItem.specs.weight}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>接続</span>
              <span className="text-right font-medium text-foreground">
                {currentItem.specs.connection}
              </span>
            </div>
            {currentItem.specs.sensitivity ? (
              <>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {currentItem.specs.sensitivity}
                  </span>
                </div>
                {currentItem.specs.buttons ? (
                  <div className="flex justify-between gap-3">
                    <span>ボタン数</span>
                    <span className="font-medium text-foreground">
                      {currentItem.specs.buttons}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex justify-between gap-3">
                  <span>センサー</span>
                  <span className="text-right font-medium text-foreground">
                    {currentItem.specs.sensor}
                  </span>
                </div>
                {currentItem.specs.battery ? (
                  <div className="flex justify-between gap-3">
                    <span>バッテリー</span>
                    <span className="text-right font-medium text-foreground">
                      {currentItem.specs.battery}
                    </span>
                  </div>
                ) : null}
                {currentItem.specs.buttons ? (
                  <div className="flex justify-between gap-3">
                    <span>ボタン数</span>
                    <span className="text-right font-medium text-foreground">
                      {currentItem.specs.buttons}
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {currentGadget ? (
            <ShopLink
              gadget={currentGadget}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            />
          ) : null}
        </div>

        <div className="space-y-4 md:col-span-7">
          <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
            {currentItem.reasonsHeading ?? "なぜこのマウスがおすすめなのか？"}
          </h4>

          <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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
        <div className="mt-8 space-y-8 border-t border-border/60 pt-6">
          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_BEGINNER_UPGRADE.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_BEGINNER_UPGRADE.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_BEGINNER_UPGRADE.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(upgradeGadget)}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_UPGRADE.specs.buttons}
                  </span>
                </div>
              </div>

              {upgradeGadget ? (
                <ShopLink
                  gadget={upgradeGadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                予算に余裕があるなら「これを選んでおけば間違いなし」の最高峰
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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

          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_BEGINNER_HYPERX.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_BEGINNER_HYPERX.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_BEGINNER_HYPERX.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(hyperxGadget)}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_BEGINNER_HYPERX.specs.buttons}
                  </span>
                </div>
              </div>

              {hyperxGadget ? (
                <ShopLink
                  gadget={hyperxGadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                {GUIDE_MOUSE_BEGINNER_HYPERX.heading}
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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
        <div className="mt-8 space-y-8 border-t border-border/60 pt-6">
          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_PRO_SUPERSTRIKE.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_PRO_SUPERSTRIKE.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_PRO_SUPERSTRIKE.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(superstrikeGadget)}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_SUPERSTRIKE.specs.buttons}
                  </span>
                </div>
              </div>

              {superstrikeGadget ? (
                <ShopLink
                  gadget={superstrikeGadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                {GUIDE_MOUSE_PRO_SUPERSTRIKE.heading}
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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

          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_PRO_G502.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_PRO_G502.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_PRO_G502.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(g502Gadget)}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_G502.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_G502.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_G502.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_PRO_G502.specs.buttons}
                  </span>
                </div>
              </div>

              {g502Gadget ? (
                <ShopLink
                  gadget={g502Gadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                {GUIDE_MOUSE_PRO_G502.heading}
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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
          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_OFFICE_TECKNET.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_OFFICE_TECKNET.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_OFFICE_TECKNET.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(
                  tecknetGadget,
                  GUIDE_MOUSE_OFFICE_TECKNET.priceLabel,
                )}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_TECKNET.specs.buttons}
                  </span>
                </div>
              </div>

              {tecknetGadget ? (
                <ShopLink
                  gadget={tecknetGadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                {GUIDE_MOUSE_OFFICE_TECKNET.heading}
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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

          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_OFFICE_M750.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_OFFICE_M750.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_OFFICE_M750.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(m750Gadget, GUIDE_MOUSE_OFFICE_M750.priceLabel)}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_M750.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_M750.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_M750.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_M750.specs.buttons}
                  </span>
                </div>
              </div>

              {m750Gadget ? (
                <ShopLink
                  gadget={m750Gadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                {GUIDE_MOUSE_OFFICE_M750.heading}
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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

          <div className="grid items-start gap-6 rounded-xl border border-border/60 bg-muted/40 p-5 md:grid-cols-12 md:p-6">
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm md:col-span-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                <GuideCardBadge>{GUIDE_MOUSE_OFFICE_MX_MASTER_3S.badge}</GuideCardBadge>
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
              </div>

              <h3 className="text-base font-bold text-foreground">
                {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                型番: {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.modelNumber}
              </p>

              <div className="mt-2 text-lg font-bold text-primary">
                {resolveGuidePriceLabel(
                  mxMaster3sGadget,
                  GUIDE_MOUSE_OFFICE_MX_MASTER_3S.priceLabel,
                )}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>重量</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.weight}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>接続</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.connection}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>感度</span>
                  <span className="text-right font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.sensitivity}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>ボタン数</span>
                  <span className="font-medium text-foreground">
                    {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.specs.buttons}
                  </span>
                </div>
              </div>

              {mxMaster3sGadget ? (
                <ShopLink
                  gadget={mxMaster3sGadget}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                />
              ) : null}
            </div>

            <div className="space-y-4 md:col-span-7">
              <h4 className="border-b border-border/60 pb-2 text-base font-bold text-foreground">
                {GUIDE_MOUSE_OFFICE_MX_MASTER_3S.heading}
              </h4>

              <ul className="space-y-2.5 text-xs leading-relaxed text-foreground/90 md:text-sm">
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
    </section>
  )
}

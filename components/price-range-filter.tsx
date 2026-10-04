"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import {
  appliedRangeToSliderValues,
  formatPriceSliderLabel,
  isFullPriceSliderRange,
  isPriceRangeActive,
  PRICE_SLIDER_MIN,
  PRICE_SLIDER_STEP,
  sliderValuesToAppliedRange,
  type AppliedPriceRange,
} from "@/lib/price-filter"

type PriceRangeFilterProps = {
  appliedRange: AppliedPriceRange
  sliderMax: number
  onApply: (range: AppliedPriceRange) => void
  onClear: () => void
  className?: string
  /** 親カードで見出しを出す場合は true */
  hideTitle?: boolean
}

export function PriceRangeFilter({
  appliedRange,
  sliderMax,
  onApply,
  onClear,
  className,
  hideTitle = false,
}: PriceRangeFilterProps) {
  const [sliderValue, setSliderValue] = useState<[number, number]>(() =>
    appliedRangeToSliderValues(appliedRange, sliderMax),
  )

  useEffect(() => {
    setSliderValue(appliedRangeToSliderValues(appliedRange, sliderMax))
  }, [appliedRange.min, appliedRange.max, sliderMax])

  function handleSliderChange(value: number | readonly number[]) {
    const next = value as [number, number]
    setSliderValue(next)
    if (isFullPriceSliderRange(next, sliderMax)) {
      onClear()
      return
    }
    onApply(sliderValuesToAppliedRange(next, sliderMax))
  }

  const [lo, hi] = sliderValue

  return (
    <div className={cn("w-full space-y-4 py-1", className)}>
      {!hideTitle && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            価格で絞り込む
          </p>
          {isPriceRangeActive(appliedRange) ? (
            <button
              type="button"
              onClick={() => {
                setSliderValue([PRICE_SLIDER_MIN, sliderMax])
                onClear()
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              クリア
            </button>
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">価格帯</span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {formatPriceSliderLabel(lo, sliderMax)} 〜 {formatPriceSliderLabel(hi, sliderMax)}
        </span>
      </div>

      <div className="px-2 py-1">
        <Slider
          min={PRICE_SLIDER_MIN}
          max={sliderMax}
          step={PRICE_SLIDER_STEP}
          minStepsBetweenValues={1}
          value={sliderValue}
          onValueChange={handleSliderChange}
          aria-label="価格帯"
          className="w-full"
        />
      </div>

      <div className="flex justify-between px-1 text-xs tabular-nums text-muted-foreground">
        <span>{formatPriceSliderLabel(PRICE_SLIDER_MIN, sliderMax)}</span>
        <span>{formatPriceSliderLabel(sliderMax, sliderMax)}</span>
      </div>
    </div>
  )
}

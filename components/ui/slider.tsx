"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

const thumbClassName =
  "block size-4 shrink-0 rounded-full border border-primary/40 bg-background shadow-sm ring-ring/40 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"

type SliderProps = SliderPrimitive.Root.Props<number | readonly number[]> & {
  className?: string
}

function Slider({ className, ...props }: SliderProps) {
  const isRange = Array.isArray(props.value ?? props.defaultValue)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center py-3">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Indicator className="absolute h-full rounded-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb index={0} className={thumbClassName} />
        {isRange ? <SliderPrimitive.Thumb index={1} className={thumbClassName} /> : null}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }

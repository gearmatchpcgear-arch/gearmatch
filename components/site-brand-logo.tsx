import { useId } from "react"
import { cn } from "@/lib/utils"

const GEAR_CX = 12.5
const GEAR_CY = 16
const TOOTH_ANGLES = [0, 60, 120, 180, 240, 300] as const

const ROYAL = "#2563EB"
const CYAN = "#06B6D4"
const MINT = "#14B8A6"
const SLATE = "#1E293B"

type SiteBrandLogoProps = {
  className?: string
  markClassName?: string
}

/** PC GearMatch ブランドマーク（ギア × デバイス比較） */
export function SiteBrandLogo({ className, markClassName }: SiteBrandLogoProps) {
  const rawId = useId().replace(/:/g, "")
  const brandId = `pgm-brand-${rawId}`
  const accentId = `pgm-accent-${rawId}`

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/15 via-cyan-500/10 to-teal-500/15 p-px shadow-md shadow-blue-900/8 ring-1 ring-slate-200/90",
        className,
      )}
      aria-hidden
    >
      <div className="flex size-full items-center justify-center rounded-[calc(1rem-1px)] bg-gradient-to-br from-white via-slate-50/80 to-sky-50/90">
        <svg
          viewBox="0 0 32 32"
          className={cn("size-[88%] min-h-0 min-w-0 max-h-full max-w-full sm:size-[90%]", markClassName)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={brandId} x1="6" y1="8" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor={ROYAL} />
              <stop offset="1" stopColor={CYAN} />
            </linearGradient>
            <linearGradient id={accentId} x1="20" y1="10" x2="28" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor={CYAN} />
              <stop offset="1" stopColor={MINT} />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="7" fill="#ffffff" fillOpacity="0" />
          <g transform="translate(16 16) scale(1.22) translate(-16 -16)">
            <circle
              cx={GEAR_CX}
              cy={GEAR_CY}
              r="4.35"
              stroke={`url(#${brandId})`}
              strokeWidth="1.2"
              fill="#ffffff"
            />
            {TOOTH_ANGLES.map((deg) => {
              const rad = ((deg - 90) * Math.PI) / 180
              const inner = 5.1
              const outer = 6.55
              const x1 = GEAR_CX + inner * Math.cos(rad)
              const y1 = GEAR_CY + inner * Math.sin(rad)
              const x2 = GEAR_CX + outer * Math.cos(rad)
              const y2 = GEAR_CY + outer * Math.sin(rad)
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={`url(#${brandId})`}
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
              )
            })}
            <circle cx={GEAR_CX} cy={GEAR_CY} r="1.25" fill={SLATE} fillOpacity="0.92" />
            <circle cx={GEAR_CX} cy={GEAR_CY} r="0.55" fill={CYAN} />
            <rect
              x="19"
              y="10.1"
              width="6.35"
              height="4.85"
              rx="1.05"
              stroke={`url(#${brandId})`}
              strokeWidth="1.05"
              fill="#EFF6FF"
            />
            <rect
              x="20.7"
              y="16.35"
              width="6.35"
              height="4.85"
              rx="1.05"
              stroke={SLATE}
              strokeWidth="0.95"
              strokeOpacity="0.55"
              fill="#F0FDFA"
            />
            <rect
              x="20.7"
              y="16.35"
              width="6.35"
              height="4.85"
              rx="1.05"
              stroke={`url(#${accentId})`}
              strokeWidth="0.85"
              fill="none"
            />
            <path
              d="M17.3 13.55h2.15M18.5 15.15v1.55"
              stroke={SLATE}
              strokeWidth="1"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
            <circle cx="24.75" cy="9.35" r="0.7" fill={CYAN} />
          </g>
        </svg>
      </div>
    </div>
  )
}
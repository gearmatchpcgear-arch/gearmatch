import { useId } from "react"
import { cn } from "@/lib/utils"

const GEAR_CX = 12.5
const GEAR_CY = 16
const TOOTH_ANGLES = [0, 60, 120, 180, 240, 300] as const

type SiteBrandLogoProps = {
  className?: string
  markClassName?: string
}

/** PC GearMatch ブランドマーク（ギア × デバイス比較） */
export function SiteBrandLogo({ className, markClassName }: SiteBrandLogoProps) {
  const rawId = useId().replace(/:/g, "")
  const accentId = `pgm-accent-${rawId}`

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-0.5 shadow-md ring-1 ring-sky-400/30",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        className={cn("size-[88%] min-h-0 min-w-0 max-h-full max-w-full sm:size-[90%]", markClassName)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={accentId} x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="0.5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <g transform="translate(16 16) scale(1.24) translate(-16 -16)">
        {/* ギア */}
        <circle
          cx={GEAR_CX}
          cy={GEAR_CY}
          r="4.35"
          stroke={`url(#${accentId})`}
          strokeWidth="1.15"
          fill="rgba(15, 23, 42, 0.55)"
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
              stroke={`url(#${accentId})`}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          )
        })}
        <circle cx={GEAR_CX} cy={GEAR_CY} r="1.25" fill={`url(#${accentId})`} />
        {/* 比較デバイス（カード） */}
        <rect
          x="19"
          y="10.25"
          width="6.25"
          height="4.75"
          rx="1"
          stroke={`url(#${accentId})`}
          strokeWidth="1.05"
          fill="rgba(56, 189, 248, 0.14)"
        />
        <rect
          x="20.75"
          y="16.5"
          width="6.25"
          height="4.75"
          rx="1"
          stroke="#e2e8f0"
          strokeWidth="0.95"
          strokeOpacity="0.85"
          fill="rgba(129, 140, 248, 0.18)"
        />
        {/* マッチングリンク */}
        <path
          d="M17.35 13.6h2.05M18.55 15.2v1.55"
          stroke={`url(#${accentId})`}
          strokeWidth="1.05"
          strokeLinecap="round"
        />
        <circle cx="24.75" cy="9.35" r="0.75" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import {
  buildMoshimoClickUrlFromButton,
  ensureMoshimoCardlinkScript,
  getMoshimoCardLinkButtons,
  getMoshimoCardLinkMountId,
  getMoshimoPrimaryImageUrl,
  type MoshimoCardLinkConfig,
} from "@/lib/moshimo-cardlink"
import { cn } from "@/lib/utils"

function MoshimoCardLinkStatic({ config }: { config: MoshimoCardLinkConfig }) {
  const imageUrl = getMoshimoPrimaryImageUrl(config)
  const buttons = getMoshimoCardLinkButtons(config)

  return (
    <div className="space-y-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={config.n}
          width={500}
          height={500}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="mx-auto max-h-52 w-auto max-w-full object-contain"
        />
      ) : null}
      <p className="text-center text-xs font-medium text-foreground">{config.b}</p>
      <div className="flex flex-col gap-2">
        {buttons.map((button) => (
          <a
            key={button.id}
            href={buildMoshimoClickUrlFromButton(button)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: button.u_bc }}
          >
            {button.u_tx}
            <ExternalLink className="size-3.5 shrink-0 opacity-90" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  )
}

type MoshimoCardLinkWidgetProps = {
  config: MoshimoCardLinkConfig
  className?: string
}

export function MoshimoCardLinkWidget({ config, className }: MoshimoCardLinkWidgetProps) {
  const mountId = getMoshimoCardLinkMountId(config)
  const [widgetEnhanced, setWidgetEnhanced] = useState(false)

  useEffect(() => {
    setWidgetEnhanced(false)
    ensureMoshimoCardlinkScript(document, window)

    const invoke = () => {
      const mount = document.getElementById(mountId)
      if (!mount) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (typeof w.msmaflink === "function") {
        w.msmaflink(config)
      }
    }

    invoke()

    const delays = [0, 150, 400, 900, 1800, 3200]
    const timers = delays.map((ms) => window.setTimeout(invoke, ms))

    const mount = document.getElementById(mountId)
    let observer: MutationObserver | undefined
    if (mount) {
      observer = new MutationObserver(() => {
        const el = document.getElementById(mountId)
        if (el?.querySelector("a, img")) {
          setWidgetEnhanced(true)
        }
      })
      observer.observe(mount, { childList: true, subtree: true })
    }

    const fallbackTimer = window.setTimeout(() => {
      const el = document.getElementById(mountId)
      if (el?.querySelector("a, img")) {
        setWidgetEnhanced(true)
      }
    }, 3500)

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.clearTimeout(fallbackTimer)
      observer?.disconnect()
    }
  }, [config, mountId])

  return (
    <div
      className={cn(
        "moshimo-cardlink-root min-w-0 max-w-full overflow-hidden rounded-xl border border-border/60 bg-card p-3 shadow-sm",
        "[&_a]:max-w-full [&_img]:mx-auto [&_img]:h-auto [&_img]:max-w-full",
        className,
      )}
      aria-label="購入リンク"
    >
      <div
        id={mountId}
        className={cn("min-w-0", !widgetEnhanced && "sr-only")}
        aria-hidden={!widgetEnhanced}
      />
      {!widgetEnhanced ? <MoshimoCardLinkStatic config={config} /> : null}
    </div>
  )
}

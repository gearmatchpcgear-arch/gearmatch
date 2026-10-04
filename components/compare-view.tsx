"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { GadgetImage } from "@/components/gadget-image"
import {
  formatPrice,
  getCardDisplayPrice,
  hasCardDisplayPrice,
  formatSpecRowDisplayValue,
  type Gadget,
} from "@/lib/gadgets"

type Row = { label: string; values: (string | null)[] }
type Group = { title: string; rows: Row[] }

function buildGroups(gadgets: Gadget[]): Group[] {
  const groupTitles: string[] = []
  for (const g of gadgets) {
    for (const grp of g.specGroups) {
      if (!groupTitles.includes(grp.title)) groupTitles.push(grp.title)
    }
  }

  return groupTitles.map((title) => {
    const labels: string[] = []
    for (const g of gadgets) {
      const grp = g.specGroups.find((x) => x.title === title)
      if (!grp) continue
      for (const r of grp.rows) if (!labels.includes(r.label)) labels.push(r.label)
    }
    const rows: Row[] = labels.map((label) => ({
      label,
      values: gadgets.map((g) => {
        const grp = g.specGroups.find((x) => x.title === title)
        const value = grp?.rows.find((r) => r.label === label)?.value ?? null
        if (value) return formatSpecRowDisplayValue(g, label, value)
        return value
      }),
    }))
    return { title, rows }
  })
}

export function CompareView({
  gadgets,
  onClose,
  onRemove,
}: {
  gadgets: Gadget[]
  onClose: () => void
  onRemove: (id: string) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const groups = buildGroups(gadgets)
  const gridCols = { gridTemplateColumns: `minmax(7rem,1fr) repeat(${gadgets.length}, minmax(8rem,1fr))` }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
      />
      <div className="relative mx-auto mt-auto flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl ring-1 ring-border/60 animate-in slide-in-from-bottom duration-300 sm:mb-4 sm:h-[86vh] sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-border/50 p-4">
          <h2 className="text-base font-semibold text-card-foreground">スペック比較</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="min-w-[36rem]">
            {/* 見出し行 */}
            <div
              className="sticky top-0 z-10 grid gap-px border-b border-border/50 bg-card"
              style={gridCols}
            >
              <div className="bg-card p-2" />
              {gadgets.map((g) => (
                <div key={g.purchaseUrl || g.id} className="relative bg-card p-2 pr-8">
                  <button
                    type="button"
                    onClick={() => onRemove(g.id)}
                    aria-label={`${g.name} を比較から外す`}
                    className="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                  <div className="relative mx-auto size-16 overflow-hidden rounded-lg bg-gradient-to-b from-secondary/40 to-card shadow-sm ring-1 ring-border/60">
                    <GadgetImage
                      src={g.image}
                      alt={`${g.brand} ${g.name}`}
                      category={g.category}
                      sizes="72px"
                      className="p-1.5"
                    />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-snug text-card-foreground">
                    {g.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {hasCardDisplayPrice(g) ? formatPrice(getCardDisplayPrice(g)!) : "—"}
                  </p>
                </div>
              ))}
            </div>

            {groups.map((group) => (
              <div key={group.title}>
                <div className="bg-secondary/60 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                  {group.title}
                </div>
                {group.rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-px border-b border-border/40 text-sm leading-snug"
                    style={gridCols}
                  >
                    <div className="px-3 py-2 text-muted-foreground">{row.label}</div>
                    {row.values.map((v, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 font-mono text-card-foreground"
                      >
                        {v ?? <span className="text-muted-foreground/50">—</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

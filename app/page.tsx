import { Sparkles } from "lucide-react"
import Link from "next/link"
import { GadgetExplorer } from "@/components/gadget-explorer"
import { SiteBrandHeader } from "@/components/site-brand-header"
import { SiteDisclaimer } from "@/components/site-disclaimer"

export default function Page() {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <SiteBrandHeader>
        <SiteDisclaimer className="border-zinc-300/80 bg-white/55 text-zinc-700" />
        <div className="mt-4">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
          >
            <Sparkles className="size-4" aria-hidden />
            自分に合ったGearを見つける
          </Link>
        </div>
      </SiteBrandHeader>

      <GadgetExplorer />
    </main>
  )
}

import Link from "next/link"
import { AMAZON_ASSOCIATE_DISCLOSURE, SITE_NAME } from "@/lib/site-config"

const FOOTER_LINKS = [
  { href: "/", label: "トップ" },
  { href: "/guide", label: "選び方ガイド" },
  { href: "/about", label: "運営者情報" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/contact", label: "お問い合わせ" },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="フッターナビゲーション">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          {AMAZON_ASSOCIATE_DISCLOSURE}
        </p>

        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  )
}

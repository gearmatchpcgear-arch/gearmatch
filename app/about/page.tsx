import type { Metadata } from "next"
import Link from "next/link"
import { SitePageShell } from "@/components/site-page-shell"
import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_OPERATOR_NAME,
} from "@/lib/site-config"

export const metadata: Metadata = {
  title: `運営者情報 | ${SITE_NAME}`,
  description: `${SITE_NAME}の運営者情報、運営方針、およびサイト概要。`,
}

function AboutRow({
  label,
  children,
  align = "center",
}: {
  label: string
  children: React.ReactNode
  align?: "center" | "start"
}) {
  return (
    <div
      className={`flex flex-col gap-1 border-b border-border/60 pb-2 sm:flex-row sm:gap-6 ${
        align === "start" ? "sm:items-start" : "sm:items-center"
      }`}
    >
      <span className="min-w-[140px] shrink-0 font-semibold text-foreground">{label}</span>
      <div className="leading-normal text-muted-foreground">{children}</div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <SitePageShell title="運営者情報" compact>
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-between px-4 py-4 text-xs md:py-6 md:text-sm">
        <div>
          <h1 className="mb-1 border-b border-border pb-2 text-xl font-bold text-foreground md:text-2xl">
            運営者情報
          </h1>
          <p className="mb-4 text-xs text-muted-foreground">
            {SITE_NAME} の運営概要とお問い合わせ先です。
          </p>

          <div className="space-y-3">
            <AboutRow label="サイト名">
              <span>{SITE_NAME}</span>
            </AboutRow>

            <AboutRow label="運営者">
              <span>{SITE_OPERATOR_NAME}</span>
            </AboutRow>

            <AboutRow label="運営目的・概要" align="start">
              <p>
                当サイトは、自分に合ったPC周辺機器（マウス・キーボード等）を簡単に検索・比較できるようにして、自分のおすすめするガジェットも紹介する情報サイトです。
              </p>
            </AboutRow>

            <AboutRow label="開設理由・背景" align="start">
              <p>
                PCゲーマー歴10年。「PCギアを購入検討する際、手軽に比較検討したい」と思いサイトを立ち上げました。
              </p>
            </AboutRow>

            <AboutRow label="情報更新方針" align="start">
              <p>
                各メーカー公式サイトやAmazon等の公開データを基に定期的に更新・確認を行っております。
              </p>
            </AboutRow>

            <AboutRow label="お問い合わせ" align="start">
              <p>
                <Link href="/contact" className="mr-2 text-primary underline-offset-4 hover:underline">
                  お問い合わせフォーム
                </Link>
                | メール:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </AboutRow>
          </div>
        </div>

        <p className="border-t border-border/60 pt-2 text-[11px] leading-normal text-muted-foreground/80">
          {AMAZON_ASSOCIATE_DISCLOSURE}
        </p>
      </div>
    </SitePageShell>
  )
}

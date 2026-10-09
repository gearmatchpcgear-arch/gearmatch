import type { Metadata } from "next"
import { SitePageShell } from "@/components/site-page-shell"
import { GuidePageContent } from "@/components/guide-page-content"
import { SITE_NAME } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `デバイス購入のポイント | ${SITE_NAME}`,
  description: `${SITE_NAME}のデバイス選び方ガイド。カテゴリ別の選定ポイントとおすすめモデルを紹介します。`,
}

export default function GuidePage() {
  return (
    <SitePageShell
      title="デバイス購入のポイント"
      description="カテゴリを選んで、失敗しないデバイスの選び方とおすすめモデルをチェックしましょう。"
    >
      <GuidePageContent />
    </SitePageShell>
  )
}

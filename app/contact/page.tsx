import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { SitePageShell } from "@/components/site-page-shell"
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `お問い合わせ | ${SITE_NAME}`,
  description: `${SITE_NAME}へのお問い合わせフォーム。`,
}

export default function ContactPage() {
  return (
    <SitePageShell
      title="お問い合わせ"
      description="サイトに関するご質問・ご意見・掲載内容の修正依頼などは、以下のフォームよりお問い合わせください。"
    >
      <ContactForm />
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        フォームがご利用いただけない場合は、
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mx-1 text-primary underline-offset-4 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        まで直接メールをお送りください。
      </p>
    </SitePageShell>
  )
}

import type { Metadata } from "next"
import { SitePageShell } from "@/components/site-page-shell"
import { AMAZON_ASSOCIATE_DISCLOSURE, SITE_NAME } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${SITE_NAME}`,
  description: `${SITE_NAME}のプライバシーポリシー。個人情報の取り扱い、Amazonアソシエイト・プログラム、Cookieについて。`,
}

function PolicySection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-border/60 pb-2">
      <h2 className="mb-0.5 font-semibold text-foreground">{title}</h2>
      <div className="leading-normal text-muted-foreground">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <SitePageShell title="プライバシーポリシー" compact>
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-between px-4 py-4 text-xs md:py-6 md:text-sm">
        <div>
          <h1 className="mb-1 border-b border-border pb-2 text-xl font-bold text-foreground md:text-2xl">
            プライバシーポリシー
          </h1>
          <p className="mb-3 text-xs text-muted-foreground">
            {SITE_NAME}（以下「当サイト」）における個人情報およびCookie等の取り扱いについて定めます。
          </p>

          <div className="space-y-3">
            <PolicySection title="個人情報の利用目的">
              <p>
                当サイトでは、お問い合わせの際、名前やメールアドレス等の個人情報をご入力いただく場合がございます。取得した個人情報はお問い合わせに対する回答や必要な情報を電子メールでご連絡する場合にのみ利用し、目的外利用はいたしません。
              </p>
            </PolicySection>

            <PolicySection title="広告配信について（Amazonアソシエイト等）">
              <p>
                第三者配信事業者（Amazon等）は、ユーザーの興味に応じた広告を表示するためクッキー（Cookie）を使用することがあります。クッキーによりお客様のコンピュータを識別できますが、個人を特定できるものではありません。
              </p>
            </PolicySection>

            <PolicySection title="アクセス解析ツールについて">
              <p>
                当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。トラフィックデータの収集のためにクッキー（Cookie）を使用しておりますが、データは匿名で収集されており個人を特定するものではありません。
              </p>
            </PolicySection>

            <PolicySection title="免責事項">
              <p>
                当サイトからのリンク先で提供される情報・サービス等について一切の責任を負いません。また、コンテンツの正確性や安全性を保証するものではなく、掲載情報によって生じた損害等の責任は負いかねます。
              </p>
              <p className="mt-2">
                実際の価格・仕様・在庫状況は変動するため、最終的な情報は遷移先の各販売ページで確認してください。
              </p>
            </PolicySection>
          </div>
        </div>

        <p className="border-t border-border/60 pt-2 text-[11px] leading-normal text-muted-foreground/80">
          {AMAZON_ASSOCIATE_DISCLOSURE}
        </p>
      </div>
    </SitePageShell>
  )
}

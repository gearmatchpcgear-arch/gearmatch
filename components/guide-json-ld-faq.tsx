import type { GuideMouseTabSeoFaq } from "@/lib/guide-mouse-tab-seo"

type GuideJsonLdFaqProps = {
  faqs: GuideMouseTabSeoFaq[]
  /** 同一ページ内の複数 JSON-LD を識別 */
  scriptId?: string
}

export function GuideJsonLdFaq({ faqs, scriptId }: GuideJsonLdFaqProps) {
  if (faqs.length === 0) return null

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
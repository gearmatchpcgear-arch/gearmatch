export type GuideTabSeoFaq = {
  question: string
  answer: string
}

export type GuideTabSeoContent = {
  tabId: string
  title: string
  description: string
  h2: string
  h3: string
  intro: string
  faq: GuideTabSeoFaq[]
}
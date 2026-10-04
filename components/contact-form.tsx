"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { CONTACT_EMAIL } from "@/lib/site-config"

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

const INITIAL: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const name = form.name.trim()
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()

    if (!name || !email || !subject || !message) {
      setError("すべての項目を入力してください。")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("メールアドレスの形式が正しくありません。")
      return
    }

    const body = [
      `お名前: ${name}`,
      `メールアドレス: ${email}`,
      "",
      message,
    ].join("\n")

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-5 text-sm leading-relaxed text-foreground"
        role="status"
      >
        <p className="font-medium">お問い合わせ内容をメールアプリに引き継ぎました。</p>
        <p className="mt-2 text-muted-foreground">
          メールアプリが開かない場合は、
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mx-1 text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          宛に直接ご連絡ください。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="contact-name" className="block text-sm font-medium text-foreground">
          お名前 <span className="text-destructive">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-email" className="block text-sm font-medium text-foreground">
          メールアドレス <span className="text-destructive">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground">
          件名 <span className="text-destructive">*</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          className="w-full rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="block text-sm font-medium text-foreground">
          お問い合わせ内容 <span className="text-destructive">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className="w-full resize-y rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-muted-foreground">
        送信ボタンを押すと、お使いのメールアプリが起動します。内容をご確認のうえ送信してください。
      </p>

      <Button type="submit" size="lg" className="min-w-32">
        送信する
      </Button>
    </form>
  )
}

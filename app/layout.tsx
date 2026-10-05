import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site-config'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fafbfd',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`light ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-100/70 font-sans antialiased">
        <div className="flex min-h-svh flex-col">
          {children}
          <SiteFooter />
        </div>
        {process.env.NODE_ENV === 'production' && (
          <>
            <GoogleAnalytics gaId="G-QRDBKNHP58" />
            <Analytics />
          </>
        )}
      </body>
    </html>
  )
}

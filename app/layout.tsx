import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { getSiteOrigin, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site-config'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
  width: 'device-width',
  initialScale: 1,
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
      <head>
        <meta
          name="google-site-verification"
          content="nTRjXV5fTw_A1BebY6r4M5UFlxm_MaQcBh78gbHSJ-A"
        />
      </head>
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

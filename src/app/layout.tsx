import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'Nolance — The World\'s Greatest Freelancing Platform',
    template: '%s | Nolance',
  },
  description: 'One platform. Four powerful sections. Gigs, Scout, Marketplace, and Community. Built for the future of work.',
  keywords: ['freelancing', 'hire freelancers', 'gigs', 'remote work', 'nolance'],
  authors: [{ name: 'Joshua Eniola' }],
  creator: 'Joshua Eniola',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nolance.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nolance.com',
    title: 'Nolance — The World\'s Greatest Freelancing Platform',
    description: 'One platform. Four powerful sections. Gigs, Scout, Marketplace, and Community.',
    siteName: 'Nolance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nolance',
    description: 'The world\'s greatest freelancing platform',
    creator: '@nolance',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-white text-navy-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0a1628',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#1aab5f', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}

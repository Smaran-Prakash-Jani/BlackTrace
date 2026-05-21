import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlackTrace — AI-Native URL Intelligence',
  description:
    'Analyze any URL for phishing threats, malicious indicators, and security risks using layered AI-assisted threat analysis.',
  keywords: 'phishing detection, URL scanner, cybersecurity, threat intelligence, malware detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-base text-primary antialiased">
        {children}
      </body>
    </html>
  )
}

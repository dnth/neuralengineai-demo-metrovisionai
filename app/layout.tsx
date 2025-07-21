import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Metro Vision AI - AI-powered Eyewear Recommendations',
  description: 'Find your perfect eyewear with AI-powered virtual try-on and personalized recommendations',
  generator: 'Metro Vision AI',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {children}
      </body>
    </html>
  )
}

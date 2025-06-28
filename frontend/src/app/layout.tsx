import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LexiFlow - Vocabulary Learning App',
  description: 'A modern vocabulary learning application built with Next.js and Rust',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <Providers> */}
          {children}
        {/* </Providers> */}
      </body>
    </html>
  )
}
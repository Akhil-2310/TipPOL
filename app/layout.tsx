import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppKitProvider from "@/components/AppKitProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TipPOL - Social Tipping Platform",
  description: "Celebrate achievements and support others through crypto tipping",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  )
}

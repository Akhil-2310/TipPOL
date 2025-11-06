"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
// import { useAppKit } from '@reown/appkit/react'

export default function Navigation() {
  const pathname = usePathname()
  // const { open } = useAppKit()

  const navItems = [
    { href: "/", label: "Feed", icon: "🏠" },
    { href: "/my-posts", label: "My Posts", icon: "📝" },
    { href: "/create", label: "Create", icon: "➕" },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            TipPOL
          </Link>

          <div className="flex items-center space-x-8">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
           <appkit-button/>
          </div>
        </div>
      </div>
    </nav>
  )
}

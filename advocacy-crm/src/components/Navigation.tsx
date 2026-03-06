'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Accounts', href: '/accounts' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Import', href: '/import' },
  { label: 'Settings', href: '/settings' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-8">
          <Link href="/accounts" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600 text-white text-xs font-bold">
              A
            </span>
            <span className="font-semibold text-gray-900 hidden sm:block">Advocacy CRM</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

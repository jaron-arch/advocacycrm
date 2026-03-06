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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-8">
          <Link href="/" className="text-indigo-600 font-bold text-lg shrink-0">
            Advocacy CRM
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

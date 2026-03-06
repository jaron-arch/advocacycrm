import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const [accountCount, contactCount] = await Promise.all([
    prisma.account.count(),
    prisma.contact.count(),
  ])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Database stats and app info</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        <div className="card">
          <h2 className="section-title">Database Summary</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 mb-1">Total Accounts</dt>
              <dd className="text-2xl font-semibold text-gray-900">{accountCount}</dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Total Contacts</dt>
              <dd className="text-2xl font-semibold text-gray-900">{contactCount}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="section-title">About</h2>
          <dl className="text-sm space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">App Name</dt>
              <dd className="font-medium text-gray-900">Customer Advocacy CRM</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Version</dt>
              <dd className="font-medium text-gray-900">0.2.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Framework</dt>
              <dd className="font-medium text-gray-900">Next.js 14 + Prisma + PostgreSQL</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

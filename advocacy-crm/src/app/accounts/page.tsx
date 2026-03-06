import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const TIER_BADGE: Record<string, string> = {
  CHAMPION: 'badge-indigo',
  ADVOCATE: 'badge-green',
  REFERENCE: 'badge-blue',
  PROSPECT: 'badge-gray',
}

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { contacts: true } } },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">{accounts.length} total</p>
        </div>
        <Link href="/accounts/new" className="btn btn-primary">+ New Account</Link>
      </div>

      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No accounts yet.</p>
          <Link href="/accounts/new" className="btn btn-primary">Add your first account</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Industry</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contacts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map(account => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/accounts/${account.id}`} className="font-medium text-indigo-600 hover:underline">
                      {account.name}
                    </Link>
                    {account.website && (
                      <div className="text-xs text-gray-400 truncate max-w-xs">{account.website}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{account.industry || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${TIER_BADGE[account.tier] || 'badge-gray'}`}>
                      {account.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{account.relationshipOwner || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{account._count.contacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

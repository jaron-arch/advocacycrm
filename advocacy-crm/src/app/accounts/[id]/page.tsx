import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteAccount } from '../actions'

const TIER_BADGE: Record<string, string> = {
  CHAMPION: 'badge-indigo',
  ADVOCATE: 'badge-green',
  REFERENCE: 'badge-blue',
  PROSPECT: 'badge-gray',
}

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const account = await prisma.account.findUnique({
    where: { id: params.id },
    include: { contacts: { orderBy: { lastName: 'asc' } } },
  })
  if (!account) notFound()

  async function handleDelete() {
    'use server'
    await deleteAccount(account!.id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/accounts" className="text-sm text-gray-500 hover:text-gray-700">← Accounts</Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title">{account.name}</h1>
            <span className={`badge ${TIER_BADGE[account.tier] || 'badge-gray'}`}>{account.tier}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/accounts/${account.id}/edit`} className="btn btn-secondary">Edit</Link>
          <form action={handleDelete}>
            <button type="submit" className="btn btn-danger"
              onClick={(e) => { if (!confirm('Delete this account? This cannot be undone.')) e.preventDefault() }}>
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="section-title">Account Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 mb-1">Industry</dt>
                <dd className="font-medium text-gray-900">{account.industry || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Website</dt>
                <dd className="font-medium text-gray-900">
                  {account.website ? (
                    <a href={account.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{account.website}</a>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Relationship Owner</dt>
                <dd className="font-medium text-gray-900">{account.relationshipOwner || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Added</dt>
                <dd className="font-medium text-gray-900">{new Date(account.createdAt).toLocaleDateString()}</dd>
              </div>
              {account.notes && (
                <div className="col-span-2">
                  <dt className="text-gray-500 mb-1">Notes</dt>
                  <dd className="text-gray-900 whitespace-pre-wrap">{account.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Contacts ({account.contacts.length})</h2>
              <Link href={`/contacts/new?accountId=${account.id}`} className="btn btn-secondary text-xs py-1 px-3">
                + Add Contact
              </Link>
            </div>
            {account.contacts.length === 0 ? (
              <p className="text-sm text-gray-500">No contacts yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {account.contacts.map(contact => (
                  <div key={contact.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-indigo-600 hover:underline text-sm">
                        {contact.firstName} {contact.lastName}
                      </Link>
                      <div className="text-xs text-gray-500">{contact.jobTitle || contact.email}</div>
                    </div>
                    <span className="text-xs text-gray-400">{contact.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

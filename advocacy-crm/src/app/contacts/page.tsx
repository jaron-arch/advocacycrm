import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: { account: { select: { id: true, name: true } } },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} total</p>
        </div>
        <Link href="/contacts/new" className="btn btn-primary">+ New Contact</Link>
      </div>

      {contacts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No contacts yet.</p>
          <Link href="/contacts/new" className="btn btn-primary">Add your first contact</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Job Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="font-medium text-indigo-600 hover:underline">
                      {contact.firstName} {contact.lastName}
                    </Link>
                    <div className="text-xs text-gray-400">{contact.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.jobTitle || '—'}</td>
                  <td className="px-4 py-3">
                    {contact.account ? (
                      <Link href={`/accounts/${contact.account.id}`} className="text-indigo-600 hover:underline">
                        {contact.account.name}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.relationshipOwner || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

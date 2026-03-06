import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteContact } from '../actions'

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: { account: { select: { id: true, name: true } } },
  })
  if (!contact) notFound()

  async function handleDelete() {
    'use server'
    await deleteContact(contact!.id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/contacts" className="text-sm text-gray-500 hover:text-gray-700">← Contacts</Link>
          <h1 className="page-title mt-1">{contact.firstName} {contact.lastName}</h1>
          {contact.jobTitle && <p className="text-gray-500 text-sm mt-1">{contact.jobTitle}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/contacts/${contact.id}/edit`} className="btn btn-secondary">Edit</Link>
          <form action={handleDelete}>
            <button type="submit" className="btn btn-danger"
              onClick={(e) => { if (!confirm('Delete this contact?')) e.preventDefault() }}>
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="card max-w-2xl">
        <h2 className="section-title">Contact Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 mb-1">Email</dt>
            <dd><a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">{contact.email}</a></dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Company</dt>
            <dd className="font-medium text-gray-900">
              {contact.account ? (
                <Link href={`/accounts/${contact.account.id}`} className="text-indigo-600 hover:underline">
                  {contact.account.name}
                </Link>
              ) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Relationship Owner</dt>
            <dd className="font-medium text-gray-900">{contact.relationshipOwner || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">LinkedIn</dt>
            <dd className="font-medium text-gray-900">
              {contact.linkedinUrl ? (
                <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View Profile</a>
              ) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Added</dt>
            <dd className="font-medium text-gray-900">{new Date(contact.createdAt).toLocaleDateString()}</dd>
          </div>
          {contact.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500 mb-1">Notes</dt>
              <dd className="text-gray-900 whitespace-pre-wrap">{contact.notes}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

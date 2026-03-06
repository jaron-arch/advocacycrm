'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateContact } from '../../actions'

export default function EditContactPage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<any>(null)
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/contacts/${params.id}`).then(r => r.json()).then(setContact)
    fetch('/api/accounts-list').then(r => r.json()).then(setAccounts)
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await updateContact(params.id, formData)
    router.push(`/contacts/${params.id}`)
  }

  if (!contact) return <div className="card">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/contacts/${params.id}`} className="text-sm text-gray-500 hover:text-gray-700">
            ← {contact.firstName} {contact.lastName}
          </Link>
          <h1 className="page-title mt-1">Edit Contact</h1>
        </div>
      </div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-section">
              <label className="label">First Name *</label>
              <input name="firstName" required className="input" defaultValue={contact.firstName} />
            </div>
            <div className="form-section">
              <label className="label">Last Name *</label>
              <input name="lastName" required className="input" defaultValue={contact.lastName} />
            </div>
          </div>
          <div className="form-section">
            <label className="label">Email *</label>
            <input name="email" type="email" required className="input" defaultValue={contact.email} />
          </div>
          <div className="form-section">
            <label className="label">Job Title</label>
            <input name="jobTitle" className="input" defaultValue={contact.jobTitle} />
          </div>
          <div className="form-section">
            <label className="label">Company (Account)</label>
            <select name="accountId" className="input" defaultValue={contact.accountId || ''}>
              <option value="">— No account —</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label className="label">LinkedIn URL</label>
            <input name="linkedinUrl" className="input" defaultValue={contact.linkedinUrl} />
          </div>
          <div className="form-section">
            <label className="label">Relationship Owner</label>
            <input name="relationshipOwner" className="input" defaultValue={contact.relationshipOwner} />
          </div>
          <div className="form-section">
            <label className="label">Notes</label>
            <textarea name="notes" rows={4} className="input" defaultValue={contact.notes} />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href={`/contacts/${params.id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

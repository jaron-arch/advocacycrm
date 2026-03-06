'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createContact } from '../actions'

export default function NewContactPage() {
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultAccountId = searchParams.get('accountId') || ''

  useEffect(() => {
    fetch('/api/accounts-list').then(r => r.json()).then(setAccounts)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createContact(formData)
    router.push('/contacts')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/contacts" className="text-sm text-gray-500 hover:text-gray-700">← Contacts</Link>
          <h1 className="page-title mt-1">New Contact</h1>
        </div>
      </div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-section">
              <label className="label">First Name *</label>
              <input name="firstName" required className="input" placeholder="Jane" />
            </div>
            <div className="form-section">
              <label className="label">Last Name *</label>
              <input name="lastName" required className="input" placeholder="Smith" />
            </div>
          </div>
          <div className="form-section">
            <label className="label">Email *</label>
            <input name="email" type="email" required className="input" placeholder="jane@company.com" />
          </div>
          <div className="form-section">
            <label className="label">Job Title</label>
            <input name="jobTitle" className="input" placeholder="e.g. VP of Marketing" />
          </div>
          <div className="form-section">
            <label className="label">Company (Account)</label>
            <select name="accountId" className="input" defaultValue={defaultAccountId}>
              <option value="">— No account —</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label className="label">LinkedIn URL</label>
            <input name="linkedinUrl" className="input" placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="form-section">
            <label className="label">Relationship Owner</label>
            <input name="relationshipOwner" className="input" placeholder="e.g. Mike Chen" />
          </div>
          <div className="form-section">
            <label className="label">Notes</label>
            <textarea name="notes" rows={4} className="input" placeholder="Any additional notes..." />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Contact'}
            </button>
            <Link href="/contacts" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAccount } from '../actions'

export default function NewAccountPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createAccount(formData)
    router.push('/accounts')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/accounts" className="text-sm text-gray-500 hover:text-gray-700">← Accounts</Link>
          <h1 className="page-title mt-1">New Account</h1>
        </div>
      </div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label className="label">Account Name *</label>
            <input name="name" required className="input" placeholder="e.g. Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-section">
              <label className="label">Industry</label>
              <input name="industry" className="input" placeholder="e.g. Technology" />
            </div>
            <div className="form-section">
              <label className="label">Tier</label>
              <select name="tier" className="input">
                <option value="PROSPECT">Prospect</option>
                <option value="REFERENCE">Reference</option>
                <option value="ADVOCATE">Advocate</option>
                <option value="CHAMPION">Champion</option>
              </select>
            </div>
          </div>
          <div className="form-section">
            <label className="label">Website</label>
            <input name="website" className="input" placeholder="https://example.com" />
          </div>
          <div className="form-section">
            <label className="label">Relationship Owner</label>
            <input name="relationshipOwner" className="input" placeholder="e.g. Sarah Johnson" />
          </div>
          <div className="form-section">
            <label className="label">Notes</label>
            <textarea name="notes" rows={4} className="input" placeholder="Any additional notes..." />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <Link href="/accounts" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

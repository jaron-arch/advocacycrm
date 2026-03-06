'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateAccount } from '../../actions'

export default function EditAccountPage({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/accounts/${params.id}`)
      .then(r => r.json())
      .then(setAccount)
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await updateAccount(params.id, formData)
    router.push(`/accounts/${params.id}`)
  }

  if (!account) return <div className="card">Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href={`/accounts/${params.id}`} className="text-sm text-gray-500 hover:text-gray-700">← {account.name}</Link>
          <h1 className="page-title mt-1">Edit Account</h1>
        </div>
      </div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label className="label">Account Name *</label>
            <input name="name" required className="input" defaultValue={account.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-section">
              <label className="label">Industry</label>
              <input name="industry" className="input" defaultValue={account.industry} />
            </div>
            <div className="form-section">
              <label className="label">Tier</label>
              <select name="tier" className="input" defaultValue={account.tier}>
                <option value="PROSPECT">Prospect</option>
                <option value="REFERENCE">Reference</option>
                <option value="ADVOCATE">Advocate</option>
                <option value="CHAMPION">Champion</option>
              </select>
            </div>
          </div>
          <div className="form-section">
            <label className="label">Website</label>
            <input name="website" className="input" defaultValue={account.website} />
          </div>
          <div className="form-section">
            <label className="label">Relationship Owner</label>
            <input name="relationshipOwner" className="input" defaultValue={account.relationshipOwner} />
          </div>
          <div className="form-section">
            <label className="label">Notes</label>
            <textarea name="notes" rows={4} className="input" defaultValue={account.notes} />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href={`/accounts/${params.id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { importAccounts, importContacts } from './actions'
import type { ImportResult } from './actions'

function ResultBanner({ result }: { result: ImportResult }) {
  if (result.error) {
    return (
      <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
        <p className="text-sm font-medium" style={{ color: '#991b1b' }}>✗ {result.error}</p>
      </div>
    )
  }
  return (
    <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
      <p className="text-sm font-medium" style={{ color: '#166534' }}>
        ✓ {result.created} record{result.created !== 1 ? 's' : ''} imported
        {result.skipped > 0 && `, ${result.skipped} skipped (duplicates or missing required fields)`}
      </p>
      {result.errors.length > 0 && (
        <ul className="mt-1" style={{ color: '#991b1b', fontSize: '0.75rem' }}>
          {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}

export default function ImportPage() {
  const [accountResult, setAccountResult] = useState<ImportResult | null>(null)
  const [contactResult, setContactResult] = useState<ImportResult | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)

  async function handleAccountImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAccountLoading(true)
    setAccountResult(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await importAccounts(formData)
      setAccountResult(result)
    } catch {
      setAccountResult({ error: 'Something went wrong. Please try again.', created: 0, skipped: 0, errors: [] })
    }
    setAccountLoading(false)
  }

  async function handleContactImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactLoading(true)
    setContactResult(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await importContacts(formData)
      setContactResult(result)
    } catch {
      setContactResult({ error: 'Something went wrong. Please try again.', created: 0, skipped: 0, errors: [] })
    }
    setContactLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Import Data</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bulk import accounts and contacts from CSV files</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="card p-4 mb-6" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <p className="text-sm font-medium" style={{ color: '#1e40af' }}>
          💡 Import accounts first, then contacts.
        </p>
        <p className="text-sm mt-0.5" style={{ color: '#1d4ed8' }}>
          Contacts will automatically link to accounts by matching the "Company Name" column.
          Duplicate account names are skipped automatically.
        </p>
      </div>

      {/* Step 1: Accounts */}
      <div className="card p-6 mb-6">
        <h2 className="section-title">Step 1 — Import Accounts</h2>

        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Required column</p>
          <p className="text-sm text-gray-700"><span className="font-medium">Name</span> — the company name</p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1">Optional columns</p>
          <p className="text-sm text-gray-700">
            Industry, Tier <span className="text-gray-400">(Strategic / Growth / Standard)</span>,
            Website, Relationship Owner, Notes, Salesforce ID
          </p>
          <a
            href="/sample-accounts.csv"
            download
            className="inline-block mt-3 text-sm font-medium"
            style={{ color: '#4f46e5' }}
          >
            ↓ Download sample accounts CSV
          </a>
        </div>

        <form onSubmit={handleAccountImport}>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              name="file"
              accept=".csv"
              required
              className="text-sm text-gray-600"
            />
            <button type="submit" className="btn-primary" disabled={accountLoading}>
              {accountLoading ? 'Importing…' : 'Import Accounts'}
            </button>
          </div>
          {accountResult && <ResultBanner result={accountResult} />}
        </form>
      </div>

      {/* Step 2: Contacts */}
      <div className="card p-6 mb-6">
        <h2 className="section-title">Step 2 — Import Contacts</h2>

        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Required columns</p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">First Name</span>, <span className="font-medium">Last Name</span>
          </p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1">Optional columns</p>
          <p className="text-sm text-gray-700">
            Email, Job Title, Company Name <span className="text-gray-400">(links to account)</span>,
            LinkedIn URL, Relationship Owner, Notes, Salesforce ID
          </p>
          <a
            href="/sample-contacts.csv"
            download
            className="inline-block mt-3 text-sm font-medium"
            style={{ color: '#4f46e5' }}
          >
            ↓ Download sample contacts CSV
          </a>
        </div>

        <form onSubmit={handleContactImport}>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              name="file"
              accept=".csv"
              required
              className="text-sm text-gray-600"
            />
            <button type="submit" className="btn-primary" disabled={contactLoading}>
              {contactLoading ? 'Importing…' : 'Import Contacts'}
            </button>
          </div>
          {contactResult && <ResultBanner result={contactResult} />}
        </form>
      </div>

      {/* After import */}
      <div className="flex gap-3">
        <a href="/accounts" className="btn-secondary">View Accounts →</a>
        <a href="/contacts" className="btn-secondary">View Contacts →</a>
      </div>
    </div>
  )
}

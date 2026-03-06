'use client'
import { useState, useRef } from 'react'
import { importAccounts, importContacts, ImportResult } from './actions'

function ResultBox({ result, type }: { result: ImportResult; type: string }) {
  if (result.error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">Error: {result.error}</p>
      </div>
    )
  }
  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-700 font-medium">
        Import complete: {result.created} {type} created, {result.skipped} skipped
      </p>
      {result.errors.length > 0 && (
        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
          {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
          {result.errors.length > 10 && <li>…and {result.errors.length - 10} more</li>}
        </ul>
      )}
    </div>
  )
}

export default function ImportPage() {
  const [accountResult, setAccountResult] = useState<ImportResult | null>(null)
  const [contactResult, setContactResult] = useState<ImportResult | null>(null)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)
  const accountFileRef = useRef<HTMLInputElement>(null)
  const contactFileRef = useRef<HTMLInputElement>(null)

  async function handleAccountImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingAccounts(true)
    setAccountResult(null)
    const formData = new FormData(e.currentTarget)
    const result = await importAccounts(formData)
    setAccountResult(result)
    setLoadingAccounts(false)
    if (accountFileRef.current) accountFileRef.current.value = ''
  }

  async function handleContactImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingContacts(true)
    setContactResult(null)
    const formData = new FormData(e.currentTarget)
    const result = await importContacts(formData)
    setContactResult(result)
    setLoadingContacts(false)
    if (contactFileRef.current) contactFileRef.current.value = ''
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Import Data</h1>
          <p className="text-sm text-gray-500 mt-1">Upload CSV files to bulk-import accounts or contacts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        {/* Import Accounts */}
        <div className="card">
          <h2 className="section-title">Import Accounts</h2>
          <p className="text-sm text-gray-500 mb-4">
            Required column: <code className="bg-gray-100 px-1 rounded">Name</code>.
            Optional: <code className="bg-gray-100 px-1 rounded">Industry</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Tier</code> (CHAMPION / ADVOCATE / REFERENCE / PROSPECT),{' '}
            <code className="bg-gray-100 px-1 rounded">Website</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Relationship Owner</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Notes</code>.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            <a href="/sample-accounts.csv" className="text-indigo-600 hover:underline">Download sample CSV</a>
          </p>
          <form onSubmit={handleAccountImport}>
            <div className="flex gap-3 items-center">
              <input
                ref={accountFileRef}
                type="file"
                name="file"
                accept=".csv"
                required
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button type="submit" disabled={loadingAccounts} className="btn btn-primary whitespace-nowrap">
                {loadingAccounts ? 'Importing…' : 'Import Accounts'}
              </button>
            </div>
          </form>
          {accountResult && <ResultBox result={accountResult} type="accounts" />}
        </div>

        {/* Import Contacts */}
        <div className="card">
          <h2 className="section-title">Import Contacts</h2>
          <p className="text-sm text-gray-500 mb-4">
            Required columns: <code className="bg-gray-100 px-1 rounded">First Name</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Last Name</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Email</code>.
            Optional: <code className="bg-gray-100 px-1 rounded">Company Name</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Job Title</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">LinkedIn URL</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Relationship Owner</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">Notes</code>.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            <a href="/sample-contacts.csv" className="text-indigo-600 hover:underline">Download sample CSV</a>
          </p>
          <form onSubmit={handleContactImport}>
            <div className="flex gap-3 items-center">
              <input
                ref={contactFileRef}
                type="file"
                name="file"
                accept=".csv"
                required
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button type="submit" disabled={loadingContacts} className="btn btn-primary whitespace-nowrap">
                {loadingContacts ? 'Importing…' : 'Import Contacts'}
              </button>
            </div>
          </form>
          {contactResult && <ResultBox result={contactResult} type="contacts" />}
        </div>
      </div>
    </div>
  )
}

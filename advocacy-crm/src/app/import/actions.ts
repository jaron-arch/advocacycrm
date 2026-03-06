'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type ImportResult = {
  created: number
  skipped: number
  errors: string[]
  error?: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''))
  return lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = parseCSVLine(line)
      return Object.fromEntries(
        headers.map((h, i) => [h, (values[i] ?? '').trim().replace(/^"|"$/g, '')])
      )
    })
}

export async function importAccounts(formData: FormData): Promise<ImportResult> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'No file selected', created: 0, skipped: 0, errors: [] }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { error: 'Could not read file', created: 0, skipped: 0, errors: [] }
  }

  const rows = parseCSV(text)
  if (rows.length === 0) {
    return { error: 'No valid rows found in CSV', created: 0, skipped: 0, errors: [] }
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const name = (row['Name'] || row['Company Name'] || row['Account Name'] || '').trim()

    if (!name) {
      skipped++
      continue
    }

    try {
      const existing = await prisma.account.findFirst({ where: { name } })
      if (existing) {
        skipped++
        continue
      }

      const tier = row['Tier'] || 'Standard'
      const validTiers = ['Strategic', 'Growth', 'Standard']
      const tierValue = validTiers.includes(tier) ? tier : 'Standard'

      await prisma.account.create({
        data: {
          name,
          industry: row['Industry'] || null,
          tier: tierValue,
          website: row['Website'] || null,
          relationshipOwner: row['Relationship Owner'] || row['Owner'] || null,
          salesforceId: row['Salesforce ID'] || row['SalesforceId'] || null,
          notes: row['Notes'] || null,
        },
      })
      created++
    } catch (e) {
      errors.push(`Row ${i + 2}: ${(e as Error).message}`)
      skipped++
    }
  }

  revalidatePath('/accounts')
  return { created, skipped, errors }
}

export async function importContacts(formData: FormData): Promise<ImportResult> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'No file selected', created: 0, skipped: 0, errors: [] }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { error: 'Could not read file', created: 0, skipped: 0, errors: [] }
  }

  const rows = parseCSV(text)
  if (rows.length === 0) {
    return { error: 'No valid rows found in CSV', created: 0, skipped: 0, errors: [] }
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const firstName = (row['First Name'] || row['FirstName'] || '').trim()
    const lastName = (row['Last Name'] || row['LastName'] || '').trim()

    if (!firstName && !lastName) {
      skipped++
      continue
    }

    try {
      // Find linked account by company name
      let accountId: string | null = null
      const companyName = (row['Company Name'] || row['Account'] || row['Account Name'] || '').trim()
      if (companyName) {
        const account = await prisma.account.findFirst({
          where: { name: { equals: companyName, mode: 'insensitive' } },
        })
        accountId = account?.id ?? null
      }

      await prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: row['Email'] || null,
          jobTitle: row['Job Title'] || row['Title'] || null,
          accountId,
          linkedinUrl: row['LinkedIn URL'] || row['LinkedIn'] || null,
          relationshipOwner: row['Relationship Owner'] || row['Owner'] || null,
          salesforceId: row['Salesforce ID'] || row['SalesforceId'] || null,
          notes: row['Notes'] || null,
        },
      })
      created++
    } catch (e) {
      errors.push(`Row ${i + 2}: ${(e as Error).message}`)
      skipped++
    }
  }

  revalidatePath('/contacts')
  return { created, skipped, errors }
}

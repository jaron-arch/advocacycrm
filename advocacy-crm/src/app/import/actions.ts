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
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }

  return rows
}

export async function importAccounts(formData: FormData): Promise<ImportResult> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { created: 0, skipped: 0, errors: [], error: 'No file provided' }
  }

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return { created: 0, skipped: 0, errors: [], error: 'CSV file is empty or has no data rows' }
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    const name = row['Name'] || row['Account Name'] || row['Company']
    if (!name) {
      errors.push(`Skipped row: missing Name field`)
      skipped++
      continue
    }

    try {
      const existing = await prisma.account.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
      })

      if (existing) {
        skipped++
        continue
      }

      const tierRaw = row['Tier'] || row['tier'] || ''
      const validTiers = ['CHAMPION', 'ADVOCATE', 'REFERENCE', 'PROSPECT']
      const tierValue = validTiers.includes(tierRaw.toUpperCase())
        ? tierRaw.toUpperCase()
        : 'PROSPECT'

      await prisma.account.create({
        data: {
          name,
          industry: row['Industry'] || undefined,
          tier: tierValue,
          website: row['Website'] || undefined,
          relationshipOwner: row['Relationship Owner'] || row['Owner'] || undefined,
          notes: row['Notes'] || undefined,
        }
      })

      created++
    } catch (err) {
      errors.push(`Error importing "${name}": ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  revalidatePath('/accounts')
  return { created, skipped, errors }
}

export async function importContacts(formData: FormData): Promise<ImportResult> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { created: 0, skipped: 0, errors: [], error: 'No file provided' }
  }

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return { created: 0, skipped: 0, errors: [], error: 'CSV file is empty or has no data rows' }
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    const firstName = row['First Name'] || row['firstName'] || ''
    const lastName = row['Last Name'] || row['lastName'] || ''
    const email = row['Email'] || row['email'] || ''

    if (!firstName && !lastName) {
      errors.push(`Skipped row: missing First Name and Last Name`)
      skipped++
      continue
    }

    if (!email) {
      errors.push(`Skipped row for ${firstName} ${lastName}: missing Email`)
      skipped++
      continue
    }

    try {
      const existing = await prisma.contact.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      })

      if (existing) {
        skipped++
        continue
      }

      const companyName = row['Company Name'] || row['Company'] || row['Account'] || ''
      let accountId: string | undefined = undefined

      if (companyName) {
        const account = await prisma.account.findFirst({
          where: { name: { equals: companyName, mode: 'insensitive' } }
        })
        if (account) {
          accountId = account.id
        }
      }

      await prisma.contact.create({
        data: {
          firstName,
          lastName,
          email,
          jobTitle: row['Job Title'] || row['Title'] || undefined,
          linkedinUrl: row['LinkedIn URL'] || row['LinkedIn'] || undefined,
          relationshipOwner: row['Relationship Owner'] || row['Owner'] || undefined,
          notes: row['Notes'] || undefined,
          accountId: accountId || undefined,
        }
      })

      created++
    } catch (err) {
      errors.push(`Error importing "${firstName} ${lastName}": ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  revalidatePath('/contacts')
  return { created, skipped, errors }
}

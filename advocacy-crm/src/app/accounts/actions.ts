'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAccount(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Name is required')
  const account = await prisma.account.create({
    data: {
      name,
      industry: (formData.get('industry') as string) || '',
      tier: (formData.get('tier') as string) || 'PROSPECT',
      website: (formData.get('website') as string) || '',
      relationshipOwner: (formData.get('relationshipOwner') as string) || '',
      notes: (formData.get('notes') as string) || '',
    }
  })
  revalidatePath('/accounts')
  redirect(`/accounts/${account.id}`)
}

export async function updateAccount(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Name is required')
  await prisma.account.update({
    where: { id },
    data: {
      name,
      industry: (formData.get('industry') as string) || '',
      tier: (formData.get('tier') as string) || 'PROSPECT',
      website: (formData.get('website') as string) || '',
      relationshipOwner: (formData.get('relationshipOwner') as string) || '',
      notes: (formData.get('notes') as string) || '',
    }
  })
  revalidatePath('/accounts')
  revalidatePath(`/accounts/${id}`)
  redirect(`/accounts/${id}`)
}

export async function deleteAccount(id: string) {
  await prisma.account.delete({ where: { id } })
  revalidatePath('/accounts')
  redirect('/accounts')
}

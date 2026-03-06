'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createContact(formData: FormData) {
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  if (!firstName || !lastName || !email) throw new Error('First name, last name, and email are required')
  const accountId = (formData.get('accountId') as string) || null

  const contact = await prisma.contact.create({
    data: {
      firstName,
      lastName,
      email,
      jobTitle: (formData.get('jobTitle') as string) || '',
      linkedinUrl: (formData.get('linkedinUrl') as string) || '',
      relationshipOwner: (formData.get('relationshipOwner') as string) || '',
      notes: (formData.get('notes') as string) || '',
      accountId: accountId || undefined,
    }
  })
  revalidatePath('/contacts')
  redirect(`/contacts/${contact.id}`)
}

export async function updateContact(id: string, formData: FormData) {
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  if (!firstName || !lastName || !email) throw new Error('First name, last name, and email are required')
  const accountId = (formData.get('accountId') as string) || null

  await prisma.contact.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      jobTitle: (formData.get('jobTitle') as string) || '',
      linkedinUrl: (formData.get('linkedinUrl') as string) || '',
      relationshipOwner: (formData.get('relationshipOwner') as string) || '',
      notes: (formData.get('notes') as string) || '',
      accountId: accountId || undefined,
    }
  })
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  redirect(`/contacts/${id}`)
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } })
  revalidatePath('/contacts')
  redirect('/contacts')
}

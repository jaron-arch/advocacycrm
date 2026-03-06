import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const account = await prisma.account.findUnique({ where: { id: params.id } })
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(account)
}

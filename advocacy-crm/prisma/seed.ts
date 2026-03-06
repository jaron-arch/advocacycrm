import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const accountCount = await prisma.account.count()
  if (accountCount > 0) {
    console.log('Database already has data, skipping seed.')
    return
  }

  console.log('Seeding database...')

  const acme = await prisma.account.create({
    data: {
      name: 'Acme Corp',
      industry: 'Technology',
      tier: 'CHAMPION',
      website: 'https://acme.com',
      relationshipOwner: 'Sarah Johnson',
      notes: 'Long-term partner, very engaged in our community.',
    }
  })

  await prisma.account.create({
    data: {
      name: 'TechFlow Inc',
      industry: 'SaaS',
      tier: 'ADVOCATE',
      website: 'https://techflow.io',
      relationshipOwner: 'Mike Chen',
      notes: 'Active case study participant.',
    }
  })

  await prisma.contact.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@acme.com',
      jobTitle: 'VP of Marketing',
      linkedinUrl: 'https://linkedin.com/in/janesmith',
      relationshipOwner: 'Sarah Johnson',
      notes: 'Key decision maker, speaks at our events.',
      accountId: acme.id,
    }
  })

  await prisma.contact.create({
    data: {
      firstName: 'Bob',
      lastName: 'Williams',
      email: 'bob@techflow.io',
      jobTitle: 'CTO',
      relationshipOwner: 'Mike Chen',
      notes: 'Technical champion.',
    }
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

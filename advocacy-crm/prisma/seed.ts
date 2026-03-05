import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Activity Types
  const activityTypes = [
    { name: "Testimonial", slug: "testimonial", sortOrder: 0 },
    { name: "Webinar Participation", slug: "webinar", sortOrder: 1 },
    { name: "Event / Conference Speaking", slug: "event-speaking", sortOrder: 2 },
    { name: "Social Media Post", slug: "social-media", sortOrder: 3 },
    { name: "Swag Sent", slug: "swag-sent", sortOrder: 4 },
    { name: "Swag Confirmed Received", slug: "swag-received", sortOrder: 5 },
    { name: "Reference Call", slug: "reference-call", sortOrder: 6 },
    { name: "G2 / Peer Review", slug: "g2-review", sortOrder: 7 },
    { name: "Beta Program", slug: "beta-program", sortOrder: 8 },
    { name: "Advisory Board Session", slug: "advisory-board", sortOrder: 9 },
    { name: "Other", slug: "other", sortOrder: 10 },
  ];

  for (const at of activityTypes) {
    await prisma.activityType.upsert({
      where: { slug: at.slug },
      update: {},
      create: at,
    });
  }
  console.log(`✓ Seeded ${activityTypes.length} activity types`);

  // Communities
  const communities = [
    { name: "Slack Community", sortOrder: 0 },
    { name: "Advisory Board / Customer Council", sortOrder: 1 },
    { name: "Beta Program", sortOrder: 2 },
    { name: "Ambassador Program", sortOrder: 3 },
  ];

  for (const c of communities) {
    await prisma.community.upsert({
      where: { id: c.name },
      update: {},
      create: c,
    });
  }
  // Re-seed communities by name check
  const existingCommunities = await prisma.community.findMany();
  for (const c of communities) {
    const exists = existingCommunities.find((e) => e.name === c.name);
    if (!exists) {
      await prisma.community.create({ data: c });
    }
  }
  console.log(`✓ Seeded communities`);

  // Willingness Tags
  const willingnessTags = [
    { name: "Open to case study", sortOrder: 0 },
    { name: "Willing to do reference calls", sortOrder: 1 },
    { name: "Happy to write a G2 / review site review", sortOrder: 2 },
    { name: "Open to speaking at events", sortOrder: 3 },
    { name: "Willing to join a webinar", sortOrder: 4 },
    { name: "Open to social media promotion", sortOrder: 5 },
    { name: "Available for product feedback / beta testing", sortOrder: 6 },
  ];

  const existingWtags = await prisma.willingnessTag.findMany();
  for (const wt of willingnessTags) {
    const exists = existingWtags.find((e) => e.name === wt.name);
    if (!exists) {
      await prisma.willingnessTag.create({ data: wt });
    }
  }
  console.log(`✓ Seeded willingness tags`);

  // Industries
  const industries = [
    "SaaS / Software",
    "Fintech",
    "Healthcare / Life Sciences",
    "E-commerce / Retail",
    "Media & Entertainment",
    "Education",
    "Manufacturing",
    "Professional Services",
    "Real Estate",
    "Logistics / Supply Chain",
    "Government / Public Sector",
    "Non-profit",
    "Other",
  ];

  const existingIndustries = await prisma.industry.findMany();
  for (let i = 0; i < industries.length; i++) {
    const name = industries[i];
    const exists = existingIndustries.find((e) => e.name === name);
    if (!exists) {
      await prisma.industry.create({ data: { name, sortOrder: i } });
    }
  }
  console.log(`✓ Seeded industries`);

  // Products — placeholder defaults (edit in Settings)
  const products = [
    { name: "Core Platform", sortOrder: 0 },
    { name: "Analytics Add-on", sortOrder: 1 },
    { name: "Enterprise Suite", sortOrder: 2 },
  ];

  const existingProducts = await prisma.product.findMany();
  for (const p of products) {
    const exists = existingProducts.find((e) => e.name === p.name);
    if (!exists) {
      await prisma.product.create({ data: p });
    }
  }
  console.log(`✓ Seeded products`);

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

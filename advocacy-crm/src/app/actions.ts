"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function createAccount(prevState: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Account name is required." };

  const productsUsed = formData.getAll("productsUsed") as string[];

  const account = await prisma.account.create({
    data: {
      name,
      companySize: formData.get("companySize") as string,
      industry: formData.get("industry") as string,
      productsUsed,
      npsScore: formData.get("npsScore") ? Number(formData.get("npsScore")) : null,
      internalOwner: (formData.get("internalOwner") as string)?.trim(),
      notes: (formData.get("notes") as string) || null,
      salesforceId: (formData.get("salesforceId") as string) || null,
    },
  });

  redirect(`/accounts/${account.id}`);
}

export async function updateAccount(id: string, prevState: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Account name is required." };

  const productsUsed = formData.getAll("productsUsed") as string[];

  await prisma.account.update({
    where: { id },
    data: {
      name,
      companySize: formData.get("companySize") as string,
      industry: formData.get("industry") as string,
      productsUsed,
      npsScore: formData.get("npsScore") ? Number(formData.get("npsScore")) : null,
      internalOwner: (formData.get("internalOwner") as string)?.trim(),
      notes: (formData.get("notes") as string) || null,
      salesforceId: (formData.get("salesforceId") as string) || null,
    },
  });

  revalidatePath(`/accounts/${id}`);
  redirect(`/accounts/${id}`);
}

export async function deleteAccount(id: string) {
  await prisma.account.delete({ where: { id } });
  revalidatePath("/accounts");
  redirect("/accounts");
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function createContact(prevState: unknown, formData: FormData) {
  const firstName = (formData.get("firstName") as string)?.trim();
  const accountId = formData.get("accountId") as string;
  if (!firstName) return { error: "First name is required." };
  if (!accountId) return { error: "Account is required." };

  const communities = formData.getAll("communities") as string[];
  const willingnessTags = formData.getAll("willingnessTags") as string[];

  const contact = await prisma.contact.create({
    data: {
      firstName,
      lastName: (formData.get("lastName") as string)?.trim() || "",
      email: (formData.get("email") as string) || null,
      jobTitle: (formData.get("jobTitle") as string) || null,
      linkedinUrl: (formData.get("linkedinUrl") as string) || null,
      accountId,
      relationshipOwner: (formData.get("relationshipOwner") as string) || null,
      communities,
      willingnessTags,
      notes: (formData.get("notes") as string) || null,
      salesforceId: (formData.get("salesforceId") as string) || null,
    },
  });

  revalidatePath(`/accounts/${accountId}`);
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(id: string, prevState: unknown, formData: FormData) {
  const firstName = (formData.get("firstName") as string)?.trim();
  if (!firstName) return { error: "First name is required." };

  const communities = formData.getAll("communities") as string[];
  const willingnessTags = formData.getAll("willingnessTags") as string[];

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      firstName,
      lastName: (formData.get("lastName") as string)?.trim() || "",
      email: (formData.get("email") as string) || null,
      jobTitle: (formData.get("jobTitle") as string) || null,
      linkedinUrl: (formData.get("linkedinUrl") as string) || null,
      relationshipOwner: (formData.get("relationshipOwner") as string) || null,
      communities,
      willingnessTags,
      notes: (formData.get("notes") as string) || null,
      salesforceId: (formData.get("salesforceId") as string) || null,
    },
  });

  revalidatePath(`/contacts/${id}`);
  revalidatePath(`/accounts/${contact.accountId}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContact(id: string, accountId: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/contacts");
  redirect(`/accounts/${accountId}`);
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function createActivity(prevState: unknown, formData: FormData) {
  const contactId = formData.get("contactId") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!contactId) return { error: "Contact is required." };
  if (!title) return { error: "Title is required." };

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) return { error: "Contact not found." };

  await prisma.activity.create({
    data: {
      contactId,
      activityTypeId: formData.get("activityTypeId") as string,
      date: new Date(formData.get("date") as string),
      title,
      notes: (formData.get("notes") as string) || null,
      loggedBy: (formData.get("loggedBy") as string) || null,
    },
  });

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath(`/accounts/${contact.accountId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteActivity(id: string, contactId: string) {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  await prisma.activity.delete({ where: { id } });
  revalidatePath(`/contacts/${contactId}`);
  if (contact) revalidatePath(`/accounts/${contact.accountId}`);
  redirect(`/contacts/${contactId}`);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

type SettingsType = "activityType" | "community" | "willingnessTag" | "industry" | "product";

export async function createSettingsItem(type: SettingsType, name: string) {
  name = name.trim();
  if (!name) return { error: "Name is required." };

  switch (type) {
    case "activityType": {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const count = await prisma.activityType.count();
      await prisma.activityType.create({ data: { name, slug: `${slug}-${Date.now()}`, sortOrder: count } });
      break;
    }
    case "community":
      await prisma.community.create({ data: { name } });
      break;
    case "willingnessTag":
      await prisma.willingnessTag.create({ data: { name } });
      break;
    case "industry":
      await prisma.industry.create({ data: { name } });
      break;
    case "product":
      await prisma.product.create({ data: { name } });
      break;
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateSettingsItem(type: SettingsType, id: string, name: string) {
  name = name.trim();
  if (!name) return { error: "Name is required." };

  switch (type) {
    case "activityType":
      await prisma.activityType.update({ where: { id }, data: { name } });
      break;
    case "community":
      await prisma.community.update({ where: { id }, data: { name } });
      break;
    case "willingnessTag":
      await prisma.willingnessTag.update({ where: { id }, data: { name } });
      break;
    case "industry":
      await prisma.industry.update({ where: { id }, data: { name } });
      break;
    case "product":
      await prisma.product.update({ where: { id }, data: { name } });
      break;
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function archiveSettingsItem(type: SettingsType, id: string) {
  switch (type) {
    case "activityType":
      await prisma.activityType.update({ where: { id }, data: { archived: true } });
      break;
    case "community":
      await prisma.community.update({ where: { id }, data: { archived: true } });
      break;
    case "willingnessTag":
      await prisma.willingnessTag.update({ where: { id }, data: { archived: true } });
      break;
    case "industry":
      await prisma.industry.update({ where: { id }, data: { archived: true } });
      break;
    case "product":
      await prisma.product.update({ where: { id }, data: { archived: true } });
      break;
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function restoreSettingsItem(type: SettingsType, id: string) {
  switch (type) {
    case "activityType":
      await prisma.activityType.update({ where: { id }, data: { archived: false } });
      break;
    case "community":
      await prisma.community.update({ where: { id }, data: { archived: false } });
      break;
    case "willingnessTag":
      await prisma.willingnessTag.update({ where: { id }, data: { archived: false } });
      break;
    case "industry":
      await prisma.industry.update({ where: { id }, data: { archived: false } });
      break;
    case "product":
      await prisma.product.update({ where: { id }, data: { archived: false } });
      break;
  }

  revalidatePath("/settings");
  return { success: true };
}

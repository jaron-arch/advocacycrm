import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/ContactForm";
import { updateContact } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [contact, accounts, communities, willingnessTags] = await Promise.all([
    prisma.contact.findUnique({ where: { id } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.community.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!contact) notFound();

  const boundAction = updateContact.bind(null, id);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/contacts/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {contact.firstName} {contact.lastName}
        </Link>
        <h1 className="page-title mt-1">Edit Contact</h1>
      </div>

      <ContactForm
        action={boundAction}
        defaultValues={{
          ...contact,
          email: contact.email ?? undefined,
          jobTitle: contact.jobTitle ?? undefined,
          linkedinUrl: contact.linkedinUrl ?? undefined,
          relationshipOwner: contact.relationshipOwner ?? undefined,
          notes: contact.notes ?? undefined,
          salesforceId: contact.salesforceId ?? undefined,
        }}
        accounts={accounts}
        communities={communities}
        willingnessTags={willingnessTags}
        cancelHref={`/contacts/${id}`}
      />
    </div>
  );
}

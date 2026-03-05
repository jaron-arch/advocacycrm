import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ActivityForm from "@/components/ActivityForm";
import { createActivity } from "@/app/actions";

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: { contactId?: string };
}) {
  const { contactId } = searchParams;

  if (!contactId) notFound();

  const [contact, activityTypes] = await Promise.all([
    prisma.contact.findUnique({
      where: { id: contactId },
      include: { account: true },
    }),
    prisma.activityType.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!contact) notFound();

  const contactName = `${contact.firstName} ${contact.lastName}`;
  const cancelHref = `/contacts/${contactId}`;

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
          <Link href={`/accounts/${contact.accountId}`} className="hover:text-gray-700">
            {contact.account.name}
          </Link>
          <span>›</span>
          <Link href={`/contacts/${contactId}`} className="hover:text-gray-700">
            {contactName}
          </Link>
        </div>
        <h1 className="page-title">Log Activity</h1>
      </div>

      <ActivityForm
        action={createActivity}
        contactId={contactId}
        contactName={contactName}
        activityTypes={activityTypes}
        cancelHref={cancelHref}
      />
    </div>
  );
}

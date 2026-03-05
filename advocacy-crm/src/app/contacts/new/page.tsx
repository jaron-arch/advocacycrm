import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/ContactForm";
import { createContact } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: { accountId?: string };
}) {
  const { accountId } = searchParams;

  const [accounts, communities, willingnessTags] = await Promise.all([
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.community.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  const backHref = accountId ? `/accounts/${accountId}` : "/contacts";

  return (
    <div>
      <div className="mb-6">
        <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-700">
          ← {accountId ? "Account" : "Contacts"}
        </Link>
        <h1 className="page-title mt-1">New Contact</h1>
      </div>

      <ContactForm
        action={createContact}
        defaultValues={{ accountId }}
        accounts={accounts}
        communities={communities}
        willingnessTags={willingnessTags}
        cancelHref={backHref}
        lockedAccountId={accountId}
      />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteAccount } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = 'force-dynamic';

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [account, activityTypes, communities, willingnessTags] = await Promise.all([
    prisma.account.findUnique({
      where: { id },
      include: {
        contacts: {
          include: {
            activities: {
              include: { activityType: true },
              orderBy: { date: "desc" },
            },
          },
          orderBy: { firstName: "asc" },
        },
      },
    }),
    prisma.activityType.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.community.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!account) notFound();

  const usedTypeIds = new Set(
    account.contacts.flatMap((c) => c.activities.map((a) => a.activityTypeId))
  );

  const totalActivities = account.contacts.reduce((sum, c) => sum + c.activities.length, 0);

  const communityMap = Object.fromEntries(communities.map((c) => [c.id, c.name]));
  const willingnessMap = Object.fromEntries(willingnessTags.map((w) => [w.id, w.name]));

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/accounts" className="text-sm text-gray-500 hover:text-gray-700">
        ← Accounts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mt-2 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
            <span>{account.industry}</span>
            <span>·</span>
            <span>{account.companySize} employees</span>
            <span>·</span>
            <span>Owner: {account.internalOwner}</span>
            {account.npsScore != null && (
              <>
                <span>·</span>
                <span className="badge-green">NPS {account.npsScore}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/accounts/${id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <DeleteButton
            action={deleteAccount.bind(null, id)}
            confirmMessage={`Delete ${account.name}? This will also delete all contacts and activities. This cannot be undone.`}
          />
        </div>
      </div>

      {/* Advocacy Summary */}
      <div className="card p-5 mb-6">
        <h2 className="section-title">Advocacy Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {activityTypes.map((at) => {
            const done = usedTypeIds.has(at.id);
            return (
              <div
                key={at.id}
                className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                  done ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-100"
                }`}
              >
                <span className={`text-lg leading-none ${done ? "text-green-600" : "text-gray-300"}`}>
                  {done ? "✓" : "—"}
                </span>
                <span className={`text-xs font-medium ${done ? "text-green-800" : "text-gray-400"}`}>
                  {at.name}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {totalActivities} total {totalActivities === 1 ? "activity" : "activities"} across{" "}
          {account.contacts.length} {account.contacts.length === 1 ? "contact" : "contacts"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account info */}
        <div className="space-y-4">
          {account.productsUsed.length > 0 && (
            <div className="card p-4">
              <h3 className="section-title">Products Used</h3>
              <div className="flex flex-wrap gap-1.5">
                {account.productsUsed.map((p) => (
                  <span key={p} className="badge-indigo">{p}</span>
                ))}
              </div>
            </div>
          )}

          {account.notes && (
            <div className="card p-4">
              <h3 className="section-title">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{account.notes}</p>
            </div>
          )}

          <div className="card p-4 text-xs text-gray-400 space-y-1">
            <p>Added {formatDate(account.createdAt)}</p>
            <p>Updated {formatDate(account.updatedAt)}</p>
            {account.salesforceId && <p>SF: {account.salesforceId}</p>}
          </div>
        </div>

        {/* Right: Contacts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">
              Contacts ({account.contacts.length})
            </h2>
            <Link
              href={`/contacts/new?accountId=${id}`}
              className="btn-secondary text-sm"
            >
              + Add Contact
            </Link>
          </div>

          {account.contacts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-500">No contacts yet for this account.</p>
              <Link href={`/contacts/new?accountId=${id}`} className="btn-primary mt-3 inline-flex">
                + Add Contact
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {account.contacts.map((contact) => {
                const contactCommunities = contact.communities
                  .map((id) => communityMap[id])
                  .filter(Boolean);
                const contactWillingTags = contact.willingnessTags
                  .map((id) => willingnessMap[id])
                  .filter(Boolean);

                return (
                  <div key={contact.id} className="card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {[contact.jobTitle, contact.email].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {contact.activities.length} {contact.activities.length === 1 ? "activity" : "activities"}
                      </span>
                    </div>

                    {contactCommunities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contactCommunities.map((c) => (
                          <span key={c} className="badge-indigo">{c}</span>
                        ))}
                      </div>
                    )}

                    {contactWillingTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {contactWillingTags.map((w) => (
                          <span key={w} className="badge-amber">{w}</span>
                        ))}
                      </div>
                    )}

                    {contact.activities.length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                        {contact.activities.slice(0, 3).map((a) => (
                          <div key={a.id} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="badge-gray">{a.activityType.name}</span>
                            <span className="text-gray-400">{formatDate(a.date)}</span>
                            <span className="truncate">{a.title}</span>
                          </div>
                        ))}
                        {contact.activities.length > 3 && (
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="text-xs text-indigo-500 hover:underline"
                          >
                            +{contact.activities.length - 3} more →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

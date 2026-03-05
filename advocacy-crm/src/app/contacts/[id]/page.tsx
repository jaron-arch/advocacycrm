import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteContact, deleteActivity } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [contact, communities, willingnessTags] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
      include: {
        account: true,
        activities: {
          include: { activityType: true },
          orderBy: { date: "desc" },
        },
      },
    }),
    prisma.community.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!contact) notFound();

  const communityMap = Object.fromEntries(communities.map((c) => [c.id, c.name]));
  const willingnessMap = Object.fromEntries(willingnessTags.map((w) => [w.id, w.name]));

  const contactCommunities = contact.communities.map((cId) => communityMap[cId]).filter(Boolean);
  const contactWillingTags = contact.willingnessTags.map((wId) => willingnessMap[wId]).filter(Boolean);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
        <Link href="/accounts" className="hover:text-gray-700">Accounts</Link>
        <span>›</span>
        <Link href={`/accounts/${contact.accountId}`} className="hover:text-gray-700">
          {contact.account.name}
        </Link>
        <span>›</span>
        <span className="text-gray-700">{contact.firstName} {contact.lastName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {contact.firstName} {contact.lastName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-gray-500">
            {contact.jobTitle && <span>{contact.jobTitle}</span>}
            {contact.jobTitle && contact.email && <span>·</span>}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">
                {contact.email}
              </a>
            )}
            {contact.linkedinUrl && (
              <>
                <span>·</span>
                <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline">LinkedIn ↗</a>
              </>
            )}
          </div>
          {contact.relationshipOwner && (
            <p className="text-sm text-gray-400 mt-1">Relationship owner: {contact.relationshipOwner}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/contacts/${id}/edit`} className="btn-secondary">Edit</Link>
          <DeleteButton
            action={deleteContact.bind(null, id, contact.accountId)}
            confirmMessage={`Delete ${contact.firstName} ${contact.lastName}? All their activities will also be deleted.`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="section-title">Communities</h3>
            {contactCommunities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {contactCommunities.map((c) => (
                  <span key={c} className="badge-indigo">{c}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not in any communities</p>
            )}
          </div>

          <div className="card p-4">
            <h3 className="section-title">Willingness to Help</h3>
            {contactWillingTags.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {contactWillingTags.map((w) => (
                  <span key={w} className="badge-amber self-start">{w}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No tags set</p>
            )}
          </div>

          {contact.notes && (
            <div className="card p-4">
              <h3 className="section-title">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          <div className="card p-4 text-xs text-gray-400 space-y-1">
            <p>Added {formatDate(contact.createdAt)}</p>
            <p>Updated {formatDate(contact.updatedAt)}</p>
            {contact.salesforceId && <p>SF: {contact.salesforceId}</p>}
          </div>
        </div>

        {/* Activity history */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">
              Activity Log ({contact.activities.length})
            </h2>
            <Link href={`/activities/new?contactId=${id}`} className="btn-primary text-sm">
              + Log Activity
            </Link>
          </div>

          {contact.activities.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-500">No activities logged yet.</p>
              <Link href={`/activities/new?contactId=${id}`} className="btn-primary mt-3 inline-flex">
                + Log First Activity
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.activities.map((activity) => (
                <div key={activity.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="badge-indigo">{activity.activityType.name}</span>
                        <span className="text-sm text-gray-500">{formatDate(activity.date)}</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      {activity.notes && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{activity.notes}</p>
                      )}
                      {activity.loggedBy && (
                        <p className="text-xs text-gray-400 mt-2">Logged by {activity.loggedBy}</p>
                      )}
                    </div>
                    <DeleteButton
                      action={deleteActivity.bind(null, activity.id, id)}
                      label="✕"
                      confirmMessage="Delete this activity? This cannot be undone."
                      className="text-gray-400 hover:text-red-500 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    />
                  </div>
                </div>
              ))}
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

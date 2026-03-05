import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface SearchParams {
  q?: string;
  accountId?: string;
  community?: string;
  willingnessTag?: string;
  hasActivity?: string;
  noActivity?: string;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams;
  const {
    q = "",
    accountId = "",
    community = "",
    willingnessTag = "",
    hasActivity = "",
    noActivity = "",
  } = params;

  const [communities, willingnessTags, activityTypes, accounts] = await Promise.all([
    prisma.community.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.activityType.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.account.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const andClauses: Prisma.ContactWhereInput[] = [];

  if (q) {
    andClauses.push({
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { jobTitle: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { account: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  if (accountId) andClauses.push({ accountId });
  if (community) andClauses.push({ communities: { has: community } });
  if (willingnessTag) andClauses.push({ willingnessTags: { has: willingnessTag } });
  if (hasActivity) {
    andClauses.push({ activities: { some: { activityTypeId: hasActivity } } });
  }
  if (noActivity) {
    // Has the willingness tag but NOT the corresponding activity type
    andClauses.push({ activities: { none: { activityTypeId: noActivity } } });
  }

  const contacts = await prisma.contact.findMany({
    where: andClauses.length > 0 ? { AND: andClauses } : undefined,
    include: {
      account: true,
      activities: { select: { activityTypeId: true } },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const communityMap = Object.fromEntries(communities.map((c) => [c.id, c.name]));
  const willingnessMap = Object.fromEntries(willingnessTags.map((w) => [w.id, w.name]));

  const hasFilters = q || accountId || community || willingnessTag || hasActivity || noActivity;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
            {hasFilters ? " (filtered)" : ""}
          </p>
        </div>
        <Link href="/contacts/new" className="btn-primary">+ New Contact</Link>
      </div>

      {/* Filters */}
      <form method="GET" className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search contacts, accounts, emails, notes…"
            className="input flex-1"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
          {hasFilters && (
            <Link href="/contacts" className="btn-secondary whitespace-nowrap">Clear</Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">Account</label>
            <select name="accountId" defaultValue={accountId} className="input">
              <option value="">Any account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Community</label>
            <select name="community" defaultValue={community} className="input">
              <option value="">Any community</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Willing to…</label>
            <select name="willingnessTag" defaultValue={willingnessTag} className="input">
              <option value="">Any</option>
              {willingnessTags.map((wt) => (
                <option key={wt.id} value={wt.id}>{wt.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Has done…</label>
            <select name="hasActivity" defaultValue={hasActivity} className="input">
              <option value="">Any activity</option>
              {activityTypes.map((at) => (
                <option key={at.id} value={at.id}>{at.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Has NOT done…</label>
            <select name="noActivity" defaultValue={noActivity} className="input">
              <option value="">—</option>
              {activityTypes.map((at) => (
                <option key={at.id} value={at.id}>{at.name}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Tip: Combine &ldquo;Willing to…&rdquo; + &ldquo;Has NOT done…&rdquo; to find untapped advocates — e.g., open to case studies but haven&rsquo;t done one yet.
        </p>
      </form>

      {/* Results */}
      {contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-sm">
            {hasFilters ? "No contacts match your filters." : "No contacts yet."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Account</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Communities</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Willing to</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Activities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map((contact) => {
                const cNames = contact.communities.map((cId) => communityMap[cId]).filter(Boolean);
                const wNames = contact.willingnessTags.map((wId) => willingnessMap[wId]).filter(Boolean);
                return (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                      {contact.email && (
                        <p className="text-xs text-gray-400 mt-0.5">{contact.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts/${contact.accountId}`}
                        className="text-gray-700 hover:text-indigo-600 hover:underline"
                      >
                        {contact.account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {contact.jobTitle ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {cNames.slice(0, 2).map((c) => (
                          <span key={c} className="badge-indigo">{c}</span>
                        ))}
                        {cNames.length > 2 && (
                          <span className="badge-gray">+{cNames.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {wNames.slice(0, 2).map((w) => (
                          <span key={w} className="badge-amber">{w}</span>
                        ))}
                        {wNames.length > 2 && (
                          <span className="badge-gray">+{wNames.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {contact.activities.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

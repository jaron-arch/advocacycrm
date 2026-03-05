import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  industry?: string;
  owner?: string;
  activityType?: string;
  community?: string;
  willingnessTag?: string;
  product?: string;
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams;
  const {
    q = "",
    industry = "",
    owner = "",
    activityType = "",
    community = "",
    willingnessTag = "",
    product = "",
  } = params;

  // Fetch config for filter dropdowns
  const [activityTypes, communities, willingnessTags, industries, products] = await Promise.all([
    prisma.activityType.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.community.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.industry.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  // Build where clause
  const andClauses: Prisma.AccountWhereInput[] = [];

  if (q) {
    andClauses.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { internalOwner: { contains: q, mode: "insensitive" } },
        {
          contacts: {
            some: {
              OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { notes: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  if (industry) andClauses.push({ industry });
  if (owner) andClauses.push({ internalOwner: { contains: owner, mode: "insensitive" } });
  if (product) andClauses.push({ productsUsed: { has: product } });
  if (activityType) {
    andClauses.push({
      contacts: { some: { activities: { some: { activityTypeId: activityType } } } },
    });
  }
  if (community) {
    andClauses.push({ contacts: { some: { communities: { has: community } } } });
  }
  if (willingnessTag) {
    andClauses.push({ contacts: { some: { willingnessTags: { has: willingnessTag } } } });
  }

  const accounts = await prisma.account.findMany({
    where: andClauses.length > 0 ? { AND: andClauses } : undefined,
    include: {
      contacts: {
        include: { activities: { select: { activityTypeId: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const hasFilters = q || industry || owner || activityType || community || willingnessTag || product;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
            {hasFilters ? " (filtered)" : ""}
          </p>
        </div>
        <Link href="/accounts/new" className="btn-primary">
          + New Account
        </Link>
      </div>

      {/* Search + Filters */}
      <form method="GET" className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search accounts, contacts, notes…"
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            Search
          </button>
          {hasFilters && (
            <Link href="/accounts" className="btn-secondary whitespace-nowrap">
              Clear
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="label">Industry</label>
            <select name="industry" defaultValue={industry} className="input">
              <option value="">All industries</option>
              {industries.map((i) => (
                <option key={i.id} value={i.name}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Owner</label>
            <input name="owner" defaultValue={owner} placeholder="Any owner" className="input" />
          </div>

          <div>
            <label className="label">Activity type</label>
            <select name="activityType" defaultValue={activityType} className="input">
              <option value="">Any activity</option>
              {activityTypes.map((at) => (
                <option key={at.id} value={at.id}>
                  {at.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Community</label>
            <select name="community" defaultValue={community} className="input">
              <option value="">Any community</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Willing to…</label>
            <select name="willingnessTag" defaultValue={willingnessTag} className="input">
              <option value="">Any</option>
              {willingnessTags.map((wt) => (
                <option key={wt.id} value={wt.id}>
                  {wt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Product</label>
            <select name="product" defaultValue={product} className="input">
              <option value="">Any product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* Accounts table */}
      {accounts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-sm">
            {hasFilters
              ? "No accounts match your filters."
              : "No accounts yet. Add your first customer advocate!"}
          </p>
          {!hasFilters && (
            <Link href="/accounts/new" className="btn-primary mt-4 inline-flex">
              + New Account
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[200px] sticky left-0 bg-gray-50">
                    Account
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                    Industry
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                    Owner
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                    Contacts
                  </th>
                  {activityTypes.map((at) => (
                    <th
                      key={at.id}
                      title={at.name}
                      className="text-center px-3 py-3 font-medium text-gray-600 whitespace-nowrap max-w-[100px]"
                    >
                      <span className="text-xs">{abbreviate(at.name)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.map((account) => {
                  const usedTypeIds = new Set(
                    account.contacts.flatMap((c) => c.activities.map((a) => a.activityTypeId))
                  );
                  const totalActivities = account.contacts.reduce(
                    (sum, c) => sum + c.activities.length,
                    0
                  );

                  return (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50">
                        <div>
                          <Link
                            href={`/accounts/${account.id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {account.name}
                          </Link>
                          {totalActivities > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {totalActivities} {totalActivities === 1 ? "activity" : "activities"}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{account.industry}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{account.internalOwner}</td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {account.contacts.length}
                      </td>
                      {activityTypes.map((at) => (
                        <td key={at.id} className="px-3 py-3 text-center">
                          {usedTypeIds.has(at.id) ? (
                            <span className="text-green-600 font-bold" title={at.name}>
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function abbreviate(name: string): string {
  // Shorten common phrases for column headers
  const map: Record<string, string> = {
    "Testimonial": "Testim.",
    "Webinar Participation": "Webinar",
    "Event / Conference Speaking": "Event",
    "Social Media Post": "Social",
    "Swag Sent": "Swag↑",
    "Swag Confirmed Received": "Swag↓",
    "Reference Call": "Ref. Call",
    "G2 / Peer Review": "G2",
    "Beta Program": "Beta",
    "Advisory Board Session": "Advisory",
    "Other": "Other",
  };
  return map[name] ?? (name.length > 10 ? name.slice(0, 9) + "…" : name);
}

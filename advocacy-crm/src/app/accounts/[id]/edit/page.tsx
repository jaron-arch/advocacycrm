import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AccountForm from "@/components/AccountForm";
import { updateAccount } from "@/app/actions";

export default async function EditAccountPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [account, industries, products] = await Promise.all([
    prisma.account.findUnique({ where: { id } }),
    prisma.industry.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!account) notFound();

  const boundAction = updateAccount.bind(null, id);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/accounts/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {account.name}
        </Link>
        <h1 className="page-title mt-1">Edit Account</h1>
      </div>

      <AccountForm
        action={boundAction}
        defaultValues={account}
        industries={industries}
        products={products}
        cancelHref={`/accounts/${id}`}
      />
    </div>
  );
}

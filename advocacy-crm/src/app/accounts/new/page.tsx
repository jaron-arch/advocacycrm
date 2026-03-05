import { prisma } from "@/lib/prisma";
import AccountForm from "@/components/AccountForm";
import { createAccount } from "@/app/actions";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function NewAccountPage() {
  const [industries, products] = await Promise.all([
    prisma.industry.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link href="/accounts" className="text-sm text-gray-500 hover:text-gray-700">
          ← Accounts
        </Link>
        <h1 className="page-title mt-1">New Account</h1>
      </div>

      <AccountForm
        action={createAccount}
        industries={industries}
        products={products}
        cancelHref="/accounts"
      />
    </div>
  );
}

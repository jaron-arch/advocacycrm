import { prisma } from "@/lib/prisma";
import SettingsSection from "@/components/SettingsSection";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [activityTypes, communities, willingnessTags, industries, products] = await Promise.all([
    prisma.activityType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.community.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.willingnessTag.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.industry.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage configurable lists used throughout the CRM.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsSection
          type="activityType"
          title="Activity Types"
          description="Categories for advocacy activities. Used in activity logs and the summary grid."
          items={activityTypes}
        />

        <SettingsSection
          type="community"
          title="Communities"
          description="Internal communities that contacts can be tagged into."
          items={communities}
        />

        <SettingsSection
          type="willingnessTag"
          title="Willingness-to-Help Tags"
          description="What contacts have expressed openness to — distinct from completed activities."
          items={willingnessTags}
        />

        <SettingsSection
          type="industry"
          title="Industries"
          description="Industry options for account classification."
          items={industries}
        />

        <SettingsSection
          type="product"
          title="Products"
          description="Your company's products that accounts may be using."
          items={products}
        />
      </div>

      <div className="mt-8 card p-5 bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-1">V1 Notes</h3>
        <div className="text-sm text-amber-800 space-y-1">
          <p>• User management and role-based permissions (Admin / Editor / Viewer) are planned for V2.</p>
          <p>• Salesforce integration fields are captured on accounts and contacts but not yet synced.</p>
          <p>• CSV data import is available as a stretch goal — contact your developer to enable it.</p>
        </div>
      </div>
    </div>
  );
}

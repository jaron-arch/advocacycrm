"use client";

import { useFormState, useFormStatus } from "react-dom";
import CheckboxGroup from "./CheckboxGroup";
import Link from "next/link";

interface Option {
  id: string;
  name: string;
}

interface ContactFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    accountId?: string;
    relationshipOwner?: string;
    communities?: string[];
    willingnessTags?: string[];
    notes?: string;
    salesforceId?: string;
  };
  accounts: Option[];
  communities: Option[];
  willingnessTags: Option[];
  cancelHref: string;
  lockedAccountId?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : "Save Contact"}
    </button>
  );
}

export default function ContactForm({
  action,
  defaultValues = {},
  accounts,
  communities,
  willingnessTags,
  cancelHref,
  lockedAccountId,
}: ContactFormProps) {
  const [state, formAction] = useFormState(action, null) as [{ error?: string } | null, typeof action];

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Contact Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              defaultValue={defaultValues.firstName}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="label">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              defaultValue={defaultValues.lastName}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultValues.email ?? ""}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="jobTitle" className="label">Job Title</label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              defaultValue={defaultValues.jobTitle ?? ""}
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="label">LinkedIn URL</label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={defaultValues.linkedinUrl ?? ""}
            placeholder="https://linkedin.com/in/…"
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accountId" className="label">
              Account <span className="text-red-500">*</span>
            </label>
            {lockedAccountId ? (
              <>
                <input type="hidden" name="accountId" value={lockedAccountId} />
                <input
                  className="input bg-gray-50 text-gray-500"
                  disabled
                  value={accounts.find((a) => a.id === lockedAccountId)?.name ?? lockedAccountId}
                />
              </>
            ) : (
              <select
                id="accountId"
                name="accountId"
                required
                className="input"
                defaultValue={defaultValues.accountId ?? ""}
              >
                <option value="">Select account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="relationshipOwner" className="label">Relationship Owner</label>
            <input
              id="relationshipOwner"
              name="relationshipOwner"
              type="text"
              defaultValue={defaultValues.relationshipOwner ?? ""}
              placeholder="Who manages this relationship?"
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={defaultValues.notes ?? ""}
            placeholder="Personality, preferences, conversation history…"
            className="input resize-none"
          />
        </div>
      </div>

      {/* Engagement */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Engagement</h2>

        <CheckboxGroup
          name="communities"
          label="Community Memberships"
          hint="Which internal communities does this person belong to?"
          options={communities}
          defaultValues={defaultValues.communities}
        />

        <CheckboxGroup
          name="willingnessTags"
          label="Willingness to Help"
          hint="What has this person expressed openness to? (remove once fulfilled)"
          options={willingnessTags}
          defaultValues={defaultValues.willingnessTags}
        />
      </div>

      {/* Integration */}
      <div className="card p-6">
        <h2 className="section-title">Integration (optional)</h2>
        <div className="mt-3">
          <label htmlFor="salesforceId" className="label">Salesforce Contact ID</label>
          <input
            id="salesforceId"
            name="salesforceId"
            type="text"
            defaultValue={defaultValues.salesforceId ?? ""}
            placeholder="Salesforce record ID for future sync"
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link href={cancelHref} className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}

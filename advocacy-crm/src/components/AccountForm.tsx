"use client";

import { useFormState, useFormStatus } from "react-dom";
import CheckboxGroup from "./CheckboxGroup";
import Link from "next/link";

interface Option {
  id: string;
  name: string;
}

interface AccountFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  defaultValues?: {
    name?: string;
    companySize?: string;
    industry?: string;
    productsUsed?: string[];
    npsScore?: number | null;
    internalOwner?: string;
    notes?: string;
    salesforceId?: string;
  };
  industries: Option[];
  products: Option[];
  cancelHref: string;
}

const COMPANY_SIZES = ["1–50", "51–200", "201–1,000", "1,001–5,000", "5,000+"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : "Save Account"}
    </button>
  );
}

export default function AccountForm({
  action,
  defaultValues = {},
  industries,
  products,
  cancelHref,
}: AccountFormProps) {
  const [state, formAction] = useFormState(action as any, null) as any as [{ error?: string } | null, (payload: FormData) => void];

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Account Details</h2>

        <div>
          <label htmlFor="name" className="label">Account Name <span className="text-red-500">*</span></label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultValues.name}
            placeholder="e.g. Acme Corporation"
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companySize" className="label">Company Size <span className="text-red-500">*</span></label>
            <select id="companySize" name="companySize" required className="input" defaultValue={defaultValues.companySize}>
              <option value="">Select size…</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>{s} employees</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="industry" className="label">Industry <span className="text-red-500">*</span></label>
            <select id="industry" name="industry" required className="input" defaultValue={defaultValues.industry}>
              <option value="">Select industry…</option>
              {industries.map((i) => (
                <option key={i.id} value={i.name}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="internalOwner" className="label">Internal Owner <span className="text-red-500">*</span></label>
            <input
              id="internalOwner"
              name="internalOwner"
              type="text"
              required
              defaultValue={defaultValues.internalOwner}
              placeholder="e.g. Jane Smith"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="npsScore" className="label">NPS / Satisfaction Score</label>
            <input
              id="npsScore"
              name="npsScore"
              type="number"
              min={0}
              max={10}
              defaultValue={defaultValues.npsScore ?? ""}
              placeholder="0–10"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Products Used</label>
          <CheckboxGroup
            name="productsUsed"
            options={products}
            defaultValues={defaultValues.productsUsed}
          />
        </div>

        <div>
          <label htmlFor="notes" className="label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={defaultValues.notes}
            placeholder="General context, relationship history, key details…"
            className="input resize-none"
          />
        </div>
      </div>

      {/* Integration */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Integration (optional)</h2>
        <div>
          <label htmlFor="salesforceId" className="label">Salesforce Account ID</label>
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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link href={cancelHref} className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}

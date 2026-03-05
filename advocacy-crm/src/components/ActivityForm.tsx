"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

interface Option {
  id: string;
  name: string;
}

interface ActivityFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  contactId: string;
  contactName: string;
  activityTypes: Option[];
  cancelHref: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : "Log Activity"}
    </button>
  );
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function ActivityForm({
  action,
  contactId,
  contactName,
  activityTypes,
  cancelHref,
}: ActivityFormProps) {
  const [state, formAction] = useFormState(action, null) as [{ error?: string } | null, typeof action];

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <input type="hidden" name="contactId" value={contactId} />

      <div className="card p-6 space-y-4">
        <h2 className="section-title">Activity Details</h2>

        {/* Contact display */}
        <div>
          <p className="label">Contact</p>
          <p className="text-sm text-gray-700 font-medium">{contactName}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="activityTypeId" className="label">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <select id="activityTypeId" name="activityTypeId" required className="input">
              <option value="">Select type…</option>
              {activityTypes.map((at) => (
                <option key={at.id} value={at.id}>{at.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="label">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={todayISO()}
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="title" className="label">
            Title / Description <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder='e.g. "Spoke on Scaling with Us webinar panel"'
            className="input"
          />
        </div>

        <div>
          <label htmlFor="notes" className="label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Additional context, links, outcomes, follow-ups…"
            className="input resize-none"
          />
        </div>

        <div>
          <label htmlFor="loggedBy" className="label">Logged By</label>
          <input
            id="loggedBy"
            name="loggedBy"
            type="text"
            placeholder="Your name"
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

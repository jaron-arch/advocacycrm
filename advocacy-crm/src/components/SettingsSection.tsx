"use client";

import { useState, useTransition } from "react";
import { createSettingsItem, updateSettingsItem, archiveSettingsItem, restoreSettingsItem } from "@/app/actions";

type SettingsType = "activityType" | "community" | "willingnessTag" | "industry" | "product";

interface Item {
  id: string;
  name: string;
  archived: boolean;
}

interface SettingsSectionProps {
  type: SettingsType;
  title: string;
  description?: string;
  items: Item[];
}

export default function SettingsSection({ type, title, description, items }: SettingsSectionProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  const active = items.filter((i) => !i.archived);
  const archived = items.filter((i) => i.archived);

  function handleAdd() {
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createSettingsItem(type, newName.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setNewName("");
      }
    });
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditName(item.name);
    setError(null);
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSettingsItem(type, id, editName.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setEditingId(null);
      }
    });
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      await archiveSettingsItem(type, id);
    });
  }

  function handleRestore(id: string) {
    startTransition(async () => {
      await restoreSettingsItem(type, id);
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-3">
          {error}
        </div>
      )}

      {/* Active items */}
      <div className="space-y-2 mb-4">
        {active.length === 0 && (
          <p className="text-sm text-gray-400 italic">No items yet.</p>
        )}
        {active.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            {editingId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(item.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="input flex-1 py-1.5 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdate(item.id)}
                  disabled={isPending}
                  className="btn-primary py-1.5 text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="btn-ghost py-1.5 text-xs"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                <button
                  onClick={() => startEdit(item)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(item.id)}
                  disabled={isPending}
                  className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50"
                >
                  Archive
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={`Add new ${title.toLowerCase().replace(/s$/, "")}…`}
          className="input flex-1 py-1.5 text-sm"
          disabled={isPending}
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="btn-primary py-1.5 text-sm"
        >
          Add
        </button>
      </div>

      {/* Archived items toggle */}
      {archived.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showArchived ? "Hide" : "Show"} archived ({archived.length})
          </button>
          {showArchived && (
            <div className="mt-2 space-y-1.5">
              {archived.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-gray-400 line-through">{item.name}</span>
                  <button
                    onClick={() => handleRestore(item.id)}
                    disabled={isPending}
                    className="text-xs text-indigo-500 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

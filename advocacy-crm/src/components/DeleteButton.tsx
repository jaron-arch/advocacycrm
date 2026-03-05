"use client";

import { useTransition } from "react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
  className?: string;
}

export default function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Are you sure? This cannot be undone.",
  className = "btn-danger",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      await action();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`btn ${className}`}
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}

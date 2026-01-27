"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  serviceId: string;
  variant?: "card" | "list";
};

export default function DeleteServiceButton({
  serviceId,
  variant = "card",
}: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!serviceId) return;
    const confirmed = window.confirm(
      "Archive this service? Customers will no longer see it.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || data?.message || "Delete failed");
      }

      router.refresh();
    } catch {
      // Swallow errors for now; toast can be added later.
    } finally {
      setIsDeleting(false);
    }
  };

  if (variant === "list") {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="Archive service"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 p-0 motion-standard motion-press hover:bg-red-50 hover:text-red-600 motion-reduce:transition-none"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-label="Archive service"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg border-border motion-standard motion-press hover:border-red-200 hover:bg-red-50 hover:text-red-600 motion-reduce:transition-none"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

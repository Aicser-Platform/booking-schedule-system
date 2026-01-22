"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  serviceId: string;
};

export default function DeleteServiceButton({ serviceId }: Props) {
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

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-label="Archive service"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

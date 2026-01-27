"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type Props = {
  serviceId: string;
  serviceName?: string;
  variant?: "card" | "list";
  onDeleted?: (serviceId: string) => void;
};

export default function DeleteServiceButton({
  serviceId,
  serviceName,
  variant = "card",
  onDeleted,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!serviceId) return;

    setIsDeleting(true);
    setErrorMessage(null);
    setOpen(true);
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || data?.message || "Delete failed");
      }

      onDeleted?.(serviceId);
      router.refresh();
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to archive service";
      setErrorMessage(message);
      setOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const trigger =
    variant === "list" ? (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="Archive service"
        disabled={isDeleting}
        className="h-8 w-8 p-0 motion-standard motion-press hover:bg-red-50 hover:text-red-600 motion-reduce:transition-none"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ) : (
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label="Archive service"
        disabled={isDeleting}
        className="rounded-lg border-border motion-standard motion-press hover:border-red-200 hover:bg-red-50 hover:text-red-600 motion-reduce:transition-none"
      >
        <Trash2 className="size-4" />
      </Button>
    );

  const titleText = serviceName
    ? `Archive “${serviceName}”?`
    : "Archive this service?";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          setOpen(nextOpen);
          if (nextOpen) {
            setErrorMessage(null);
          }
        }
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titleText}</AlertDialogTitle>
          <AlertDialogDescription>
            Customers will no longer see this service in the booking flow.
            You can restore it later by editing it.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Archiving..." : "Archive Service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

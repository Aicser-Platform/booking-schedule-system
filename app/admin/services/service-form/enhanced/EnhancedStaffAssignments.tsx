"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type StaffOption = {
  id: string;
  full_name: string | null;
  role: "staff" | "admin" | "superadmin" | "customer";
  is_active: boolean;
};

type EnhancedStaffAssignmentsProps = {
  staffOptions: StaffOption[];
  selectedStaffIds: string[];
  setSelectedStaffIds: (ids: string[]) => void;
};

export default function EnhancedStaffAssignments({
  staffOptions,
  selectedStaffIds,
  setSelectedStaffIds,
}: EnhancedStaffAssignmentsProps) {
  const [localStaff, setLocalStaff] = useState<StaffOption[]>(staffOptions);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (staffOptions.length > 0) {
      setLocalStaff(staffOptions);
      return;
    }

    let cancelled = false;
    const loadStaff = async () => {
      try {
        const res = await fetch("/api/admin/staff", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Unable to load staff list");
        }
        const data = (await res.json()) as StaffOption[];
        if (!cancelled) {
          setLocalStaff(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load staff",
          );
        }
      }
    };

    loadStaff();
    return () => {
      cancelled = true;
    };
  }, [staffOptions]);

  const availableStaff = localStaff.filter(
    (staff) => staff.role === "staff" && staff.is_active !== false,
  );

  const toggleStaff = (id: string) => {
    setSelectedStaffIds(
      selectedStaffIds.includes(id)
        ? selectedStaffIds.filter((staffId) => staffId !== id)
        : [...selectedStaffIds, id],
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Assign Staff</h4>
        <p className="text-xs text-muted-foreground">
          Optional: select staff members who can deliver this service.
        </p>
      </div>

      {availableStaff.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          {loadError
            ? loadError
            : "No active staff found. Add staff accounts first, then assign them to this service."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {availableStaff.map((staff) => {
            const isSelected = selectedStaffIds.includes(staff.id);
            return (
              <button
                key={staff.id}
                type="button"
                onClick={() => toggleStaff(staff.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border/60 bg-background text-foreground hover:border-primary/30"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {staff.full_name || "Staff Member"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {staff.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <Badge variant="secondary">{staff.role}</Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

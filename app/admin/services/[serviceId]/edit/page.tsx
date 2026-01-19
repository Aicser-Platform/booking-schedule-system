import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import ServiceForm from "../../ServiceForm";
import ServiceStaffAssignments from "../../ServiceStaffAssignments";
import ServiceOperatingSchedule from "../../ServiceOperatingSchedule";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
};

type ServiceRow = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  buffer_minutes: number;
  max_capacity: number;
  is_active: boolean;
};

type StaffRow = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  role: "customer" | "staff" | "admin" | "superadmin";
  is_active: boolean;
};

type AssignedStaff = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: string;
  assignment_id: string;
};

type RouteContext = {
  params: { serviceId: string } | Promise<{ serviceId: string }>;
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as MeUser;
}

async function getService(serviceId: string): Promise<ServiceRow | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/services/${serviceId}`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as ServiceRow;
}

async function getStaff(): Promise<StaffRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/admin/staff`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return (await res.json()) as StaffRow[];
}

async function getAssignedStaff(serviceId: string): Promise<AssignedStaff[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/staff/${serviceId}/staff`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return (await res.json()) as AssignedStaff[];
}

export default async function AdminServiceEditPage({ params }: RouteContext) {
  const resolvedParams = await Promise.resolve(params);
  const { serviceId } = resolvedParams;
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "admin" && me.role !== "superadmin") redirect("/dashboard");

  const [service, staff, assignedStaff] = await Promise.all([
    getService(serviceId),
    getStaff(),
    getAssignedStaff(serviceId),
  ]);

  if (!service) redirect("/admin/services");

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Service</h2>
          <p className="text-muted-foreground">
            Update details and assign staff members
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/services">Back to Services</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ServiceForm
          mode="edit"
          serviceId={service.id}
          initialValues={service}
        />
        <ServiceStaffAssignments
          serviceId={service.id}
          staffOptions={staff}
          assignedStaff={assignedStaff}
        />
      </div>
      <div className="mt-6">
        <ServiceOperatingSchedule serviceId={service.id} />
      </div>
    </DashboardLayout>
  );
}

import { redirect } from "next/navigation";
import { headers } from "next/headers";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
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

export default async function CustomerBookingsPage() {
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role === "admin" || me.role === "superadmin") {
    redirect("/admin/dashboard");
  }
  if (me.role === "staff") redirect("/staff/dashboard");

  redirect("/#services");
}

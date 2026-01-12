import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ user: null });
  }

  const user = await res.json();
  return NextResponse.json({ user });
}

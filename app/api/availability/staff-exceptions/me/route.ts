import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getUser(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");

  if (!token && !authHeader) {
    return { status: 401, user: null, token: null };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : authHeader
          ? { Authorization: authHeader }
          : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { status: res.status, user: null, token };
  }

  const user = await res.json();
  return { status: 200, user, token };
}

export async function GET(request: NextRequest) {
  try {
    const { status, user, token } = await getUser(request);
    if (status !== 200 || !user?.id || !token) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: status === 401 ? 401 : 401 },
      );
    }

    if (!["staff", "admin", "superadmin"].includes(user.role)) {
      return NextResponse.json([], { status: 200 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(
      `${apiUrl}/api/availability/staff-exceptions/${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: token
            ? `Bearer ${token}`
            : request.headers.get("authorization") || "",
        },
        cache: "no-store",
      },
    );

    if (res.status === 403 || res.status === 404) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("staff-exceptions/me error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}

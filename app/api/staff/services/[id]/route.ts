import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = _request.headers.get("authorization");
  const cookieHeader = _request.headers.get("cookie");

  if (!token && !authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const { id } = params ?? {};
  if (!id || id === "undefined") {
    return NextResponse.json({ message: "Invalid staff id" }, { status: 400 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/staff/services/${id}`, {
    method: "GET",
    headers: {
      ...(authHeader
        ? { Authorization: authHeader }
        : token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = _request.headers.get("authorization");
  const cookieHeader = _request.headers.get("cookie");

  if (!token && !authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const { id } = params ?? {};
  if (!id || id === "undefined") {
    return NextResponse.json(
      { message: "Invalid assignment id" },
      { status: 400 },
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/staff/services/${id}`, {
    method: "DELETE",
    headers: {
      ...(authHeader
        ? { Authorization: authHeader }
        : token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const endpoint = `${apiUrl}/api/services${query ? `?${query}` : ""}`;

  const res = await fetch(endpoint, {
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

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");

  if (!token && !authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const bodyText = await request.text();
  const hasBody = bodyText.trim().length > 0;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/services`, {
    method: "POST",
    headers: {
      ...(authHeader
        ? { Authorization: authHeader }
        : token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(request.headers.get("content-type")
        ? { "Content-Type": request.headers.get("content-type") as string }
        : {}),
    },
    body: hasBody ? bodyText : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

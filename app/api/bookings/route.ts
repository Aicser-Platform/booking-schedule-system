import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader && !authHeader) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const bodyText = await request.text();
  const hasBody = bodyText.trim().length > 0;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/api/bookings/`, {
    method: "POST",
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
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

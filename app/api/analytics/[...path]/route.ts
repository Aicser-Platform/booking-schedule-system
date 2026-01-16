import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: { path: string[] };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { path } = context.params;
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const endpoint = `${apiUrl}/api/analytics/${path.join("/")}${
    query ? `?${query}` : ""
  }`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

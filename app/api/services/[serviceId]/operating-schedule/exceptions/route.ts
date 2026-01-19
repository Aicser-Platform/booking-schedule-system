import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: { serviceId: string } | Promise<{ serviceId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");

  if (!token && !authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const { serviceId } = params ?? {};
  if (!serviceId || serviceId === "undefined") {
    return NextResponse.json(
      { message: "Invalid service id" },
      { status: 400 },
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const bodyText = await request.text();
  const hasBody = bodyText.trim().length > 0;

  const res = await fetch(
    `${apiUrl}/api/services/${serviceId}/operating-schedule/exceptions`,
    {
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
    },
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

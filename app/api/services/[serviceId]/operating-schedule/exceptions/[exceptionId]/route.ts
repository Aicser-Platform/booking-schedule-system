import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params:
    | { serviceId: string; exceptionId: string }
    | Promise<{ serviceId: string; exceptionId: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");

  if (!token && !authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const { serviceId, exceptionId } = params ?? {};
  if (!serviceId || serviceId === "undefined" || !exceptionId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(
    `${apiUrl}/api/services/${serviceId}/operating-schedule/exceptions/${exceptionId}`,
    {
      method: "DELETE",
      headers: {
        ...(authHeader
          ? { Authorization: authHeader }
          : token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    },
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

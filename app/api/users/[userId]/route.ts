import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: { userId: string };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId } = context.params;
  if (!userId || userId === "undefined") {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }
  const bodyText = await request.text();
  const hasBody = bodyText.trim().length > 0;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(request.headers.get("content-type")
        ? { "Content-Type": request.headers.get("content-type") as string }
        : {}),
    },
    body: hasBody ? bodyText : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

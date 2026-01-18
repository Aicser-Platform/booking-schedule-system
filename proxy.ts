import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function forwardWithAuth(
  request: NextRequest,
  method: string,
  endpoint: string,
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    if (!token && !authHeader) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const bodyText = await request.text();
    const hasBody = bodyText.trim().length > 0;

    const res = await fetch(endpoint, {
      method,
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

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text().catch(() => "");
    return new NextResponse(text, { status: res.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}

export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

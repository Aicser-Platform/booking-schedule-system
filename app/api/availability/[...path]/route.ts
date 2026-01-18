import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function resolveMe(
  apiUrl: string,
  token?: string,
  authHeader?: string | null,
  cookieHeader?: string | null,
) {
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
    return null;
  }

  const user = await res.json().catch(() => null);
  return user ?? null;
}

async function forward(request: NextRequest, method: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    if (!token && !authHeader) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/availability/, "");
    const query = url.searchParams.toString();
    const endpoint = `${apiUrl}/api/availability${path}${query ? `?${query}` : ""}`;

    if (path === "/weekly-schedules/me" || path === "/staff-exceptions/me") {
      const user = await resolveMe(apiUrl, token, authHeader, cookieHeader);
      if (!user || !user.id) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }

      if (!["staff", "admin", "superadmin"].includes(user.role)) {
        return NextResponse.json([], { status: 200 });
      }

      const resolvedPath = path.replace("/me", `/${user.id}`);
      const resolvedEndpoint = `${apiUrl}/api/availability${resolvedPath}${
        query ? `?${query}` : ""
      }`;

      const res = await fetch(resolvedEndpoint, {
        method,
        headers: {
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : authHeader
              ? { Authorization: authHeader }
              : {}),
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          ...(request.headers.get("content-type")
            ? { "Content-Type": request.headers.get("content-type") as string }
            : {}),
        },
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => []);
        if (res.status === 403 || res.status === 404) {
          return NextResponse.json([], { status: 200 });
        }
        return NextResponse.json(data, { status: res.status });
      }

      const text = await res.text().catch(() => "");
      return new NextResponse(text, { status: res.status });
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
    console.error("Availability proxy error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return forward(request, "GET");
}

export async function POST(request: NextRequest) {
  return forward(request, "POST");
}

export async function PATCH(request: NextRequest) {
  return forward(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return forward(request, "DELETE");
}

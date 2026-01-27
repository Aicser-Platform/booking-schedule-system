import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: { serviceId: string } | Promise<{ serviceId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  const { serviceId } = params ?? {};
  if (!serviceId || serviceId === "undefined") {
    return NextResponse.json(
      { message: "Invalid service id" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = _request.headers.get("authorization");
  const cookieHeader = _request.headers.get("cookie");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/api/services/${serviceId}`, {
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

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

  const bodyText = await request.text();
  const hasBody = bodyText.trim().length > 0;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${apiUrl}/api/services/${serviceId}`, {
    method: "PUT",
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

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authHeader = _request.headers.get("authorization");
  const cookieHeader = _request.headers.get("cookie");

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
  const res = await fetch(`${apiUrl}/api/services/${serviceId}`, {
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

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

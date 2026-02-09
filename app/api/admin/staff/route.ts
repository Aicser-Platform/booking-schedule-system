import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/admin/staff`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text().catch(() => "");
    return NextResponse.json(
      {
        message: "Upstream returned non-JSON response.",
        status: res.status,
        body: text.slice(0, 400),
      },
      { status: res.status },
    );
  } catch (error) {
    console.error("Admin staff proxy error:", error);
    return NextResponse.json(
      { message: "Failed to load staff list." },
      { status: 502 },
    );
  }
}

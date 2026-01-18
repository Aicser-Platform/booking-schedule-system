import { NextRequest } from "next/server";
import { forwardWithAuth } from "@/proxy";

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const endpoint = `${apiUrl}/api/availability/schedule-requests${query ? `?${query}` : ""}`;

  return forwardWithAuth(request, "GET", endpoint);
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${apiUrl}/api/availability/schedule-requests`;

  return forwardWithAuth(request, "POST", endpoint);
}

import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { PaymentForm } from "@/components/payment/payment-form";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
};

type PaymentBookingRow = {
  id: string;
  status: string;
  payment_status?: string | null;
  start_time_utc: string;

  services: {
    name: string;
    price: number;
    deposit_amount: number;
  } | null;

  staff: {
    full_name?: string | null;
  } | null;

  // include any other fields your PaymentForm expects (e.g. customer_id, total, etc.)
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as MeUser;
}

async function getBookingForPayment(
  bookingId: string
): Promise<PaymentBookingRow | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/bookings/:bookingId/payment
  // Return booking + service (name, price, deposit_amount) + staff (full_name)
  try {
    const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/payment`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as PaymentBookingRow;
  } catch {
    return null;
  }
}

export default async function PaymentPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const { bookingId } = params;

  const me = await getMe();
  if (!me) redirect("/auth/login");

  const booking = await getBookingForPayment(bookingId);
  if (!booking || !booking.services) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <PaymentForm booking={booking} />
        </div>
      </div>
    </div>
  );
}

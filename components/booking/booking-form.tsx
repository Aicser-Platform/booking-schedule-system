"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TimeSlotSkeletonGrid } from "@/components/skeletons/TimeSlotSkeletonGrid";

interface BookingCustomer {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  timezone?: string | null;
  role?: "customer" | "staff" | "admin" | "superadmin";
}

interface BookingStaff {
  id: string;
  name: string;
  avatar_url?: string | null;
  price_override?: number | string | null;
  deposit_override?: number | string | null;
  duration_override?: number | string | null;
  buffer_override?: number | string | null;
  capacity_override?: number | string | null;
}

interface BookingService {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | string;
  deposit_amount: number | string;
  max_capacity?: number | string | null;
}

interface AvailableSlot {
  start_time: string;
  end_time: string;
  staff_id: string;
  staff_name?: string | null;
}

interface BookingFormProps {
  service: BookingService;
  staff: BookingStaff[];
  customer: BookingCustomer;
  bookingSource?: "web" | "social";
}

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatSlotTime = (value: string) => {
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return "";
  return format(dateValue, "h:mm a");
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (!parts.length) return "";
  return parts
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export function BookingForm({
  service,
  staff,
  customer,
  bookingSource = "web",
}: BookingFormProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [monthAvailability, setMonthAvailability] = useState<
    Record<string, boolean>
  >({});
  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const [nextAvailableDate, setNextAvailableDate] = useState<Date | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);

  const router = useRouter();

  const timezone =
    customer.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isStaffAccount = customer.role === "staff";

  const selectedStaff = useMemo(
    () => staff.find((member) => member.id === selectedStaffId) || null,
    [staff, selectedStaffId],
  );

  const effectivePrice = useMemo(() => {
    const basePrice = toNumber(service.price, 0);
    if (
      selectedStaff?.price_override !== null &&
      selectedStaff?.price_override !== undefined
    ) {
      return toNumber(selectedStaff.price_override, basePrice);
    }
    return basePrice;
  }, [service.price, selectedStaff]);

  const effectiveDeposit = useMemo(() => {
    const baseDeposit = toNumber(service.deposit_amount, 0);
    if (
      selectedStaff?.deposit_override !== null &&
      selectedStaff?.deposit_override !== undefined
    ) {
      return toNumber(selectedStaff.deposit_override, baseDeposit);
    }
    return baseDeposit;
  }, [service.deposit_amount, selectedStaff]);

  const effectiveCapacity = useMemo(() => {
    const baseCapacity = toNumber(service.max_capacity, 1);
    if (
      selectedStaff?.capacity_override !== null &&
      selectedStaff?.capacity_override !== undefined
    ) {
      return toNumber(selectedStaff.capacity_override, baseCapacity);
    }
    return baseCapacity;
  }, [service.max_capacity, selectedStaff]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [calendarMonth]);

  const fetchMonthAvailability = async (targetMonth: Date, staffId: string) => {
    if (!staffId) {
      setMonthAvailability({});
      return;
    }

    setIsLoadingCalendar(true);
    try {
      const month = targetMonth.getMonth() + 1;
      const year = targetMonth.getFullYear();
      const response = await fetch(
        `/api/availability/slots-v2/month?service_id=${service.id}&year=${year}&month=${month}&timezone=${encodeURIComponent(
          timezone,
        )}&staff_id=${staffId}`,
        { credentials: "include" },
      );
      if (!response.ok) {
        setMonthAvailability({});
        return;
      }
      const data = (await response.json()) as Array<{
        date: string;
        has_slots: boolean;
      }>;
      const nextAvailability: Record<string, boolean> = {};
      data.forEach((entry) => {
        if (entry?.date) {
          nextAvailability[entry.date] = entry.has_slots;
        }
      });
      setMonthAvailability(nextAvailability);
    } catch (error) {
      console.error("Error loading month availability", error);
      setMonthAvailability({});
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const fetchAvailableSlots = async (date: Date, staffId: string) => {
    setIsLoadingSlots(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await fetch(
        `/api/availability/slots-v2?service_id=${service.id}&date=${dateStr}&timezone=${encodeURIComponent(
          timezone,
        )}&staff_id=${staffId}`,
        { credentials: "include" },
      );
      if (!response.ok) {
        setAvailableSlots([]);
        return;
      }
      const data = (await response.json()) as AvailableSlot[];
      setAvailableSlots(data);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchNextAvailableDate = async (date: Date, staffId: string) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await fetch(
        `/api/availability/slots-v2/next-available?service_id=${service.id}&timezone=${encodeURIComponent(
          timezone,
        )}&staff_id=${staffId}&from_date=${dateStr}`,
        { credentials: "include" },
      );
      if (!response.ok) {
        setNextAvailableDate(null);
        return;
      }
      const data = (await response.json()) as { date: string | null };
      if (!data?.date) {
        setNextAvailableDate(null);
        return;
      }
      setNextAvailableDate(new Date(`${data.date}T00:00:00`));
    } catch (error) {
      console.error("Error fetching next available date:", error);
      setNextAvailableDate(null);
    }
  };

  useEffect(() => {
    if (!selectedStaffId) return;
    fetchMonthAvailability(calendarMonth, selectedStaffId);
  }, [calendarMonth, selectedStaffId]);

  useEffect(() => {
    if (!selectedStaffId || !selectedDate) return;
    fetchAvailableSlots(selectedDate, selectedStaffId);
  }, [selectedDate, selectedStaffId]);

  useEffect(() => {
    if (!selectedDate || !selectedStaffId) {
      setNextAvailableDate(null);
      return;
    }
    if (!isLoadingSlots && availableSlots.length === 0) {
      fetchNextAvailableDate(selectedDate, selectedStaffId);
    } else {
      setNextAvailableDate(null);
    }
  }, [availableSlots, isLoadingSlots, selectedDate, selectedStaffId]);

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    setSelectedSlot("");
    setAvailableSlots([]);
    setNextAvailableDate(null);
    setCalendarMonth(startOfMonth(selectedDate ?? new Date()));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  const handleBooking = async () => {
    if (!selectedStaffId || !selectedSlot || !selectedDate) return;

    setIsBooking(true);
    setBookingError(null);
    setWaitlistMessage(null);
    try {
      if (!customer.email) {
        setBookingError(
          "Please add your email in your profile before booking.",
        );
        return;
      }

      const customerData = await ensureCustomerProfile();

      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          service_id: service.id,
          staff_id: selectedStaffId,
          customer_id: customerData.id,
          start_time_utc: selectedSlot,
          booking_source: bookingSource,
          customer_timezone: timezone,
        }),
      });

      const booking = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(booking?.detail || "Failed to create booking");
      }

      router.push(`/booking-confirmed/${booking.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create booking.";
      console.error("Error creating booking:", error);
      setBookingError(message);
    } finally {
      setIsBooking(false);
    }
  };

  const ensureCustomerProfile = async () => {
    if (isStaffAccount) {
      throw new Error(
        "Staff accounts cannot book services. Please use a customer account.",
      );
    }
    const customerResponse = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        full_name: customer.full_name || "Customer",
        email: customer.email,
        phone: customer.phone || null,
        timezone,
      }),
    });

    const customerData = await customerResponse.json();
    if (!customerResponse.ok) {
      throw new Error(customerData?.detail || "Failed to create customer");
    }

    return customerData as { id: string };
  };

  const handleJoinWaitlist = async () => {
    if (!selectedStaffId || !selectedDate) return;

    setIsJoiningWaitlist(true);
    setWaitlistMessage(null);
    setBookingError(null);
    try {
      if (!customer.email) {
        setBookingError(
          "Please add your email in your profile before booking.",
        );
        return;
      }

      const customerData = await ensureCustomerProfile();

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          service_id: service.id,
          customer_id: customerData.id,
          preferred_date: format(selectedDate, "yyyy-MM-dd"),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail || "Failed to join waitlist");
      }

      setWaitlistMessage(
        "You are on the waitlist. We will notify you if a slot opens.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join waitlist.";
      setBookingError(message);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const canContinue = Boolean(selectedStaffId && selectedDate && selectedSlot);
  const today = startOfDay(new Date());

  return (
    <div className="space-y-8 text-slate-100">
      {isStaffAccount ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          Staff accounts cannot book services. Please switch to a customer
          account.
        </div>
      ) : null}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Select Staff</span>
          {selectedStaff ? (
            <span className="text-[10px] text-slate-500">Selected</span>
          ) : null}
        </div>
        {staff.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
            No staff members are available for this service right now.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {staff.map((member) => {
              const isSelected = member.id === selectedStaffId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleStaffSelect(member.id)}
                  className={cn(
                    "group flex min-w-[110px] flex-col items-center gap-3 rounded-2xl border px-4 py-4 text-left transition",
                    "bg-white/5 hover:bg-white/10",
                    isSelected
                      ? "border-[var(--booking-accent)] bg-white/10 shadow-[0_0_0_1px_var(--booking-accent)]"
                      : "border-white/10",
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border",
                        isSelected
                          ? "border-[var(--booking-accent)]"
                          : "border-white/10",
                      )}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-200">
                          {getInitials(member.name || "Staff")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-100">
                      {member.name}
                    </p>
                    {member.price_override ? (
                      <p className="text-xs text-slate-400">
                        {formatCurrency(toNumber(member.price_override))}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Select Date</span>
          <span className="text-[10px] text-slate-500">
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a day"}
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCalendarMonth((prev) => subMonths(prev, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-white/30 hover:text-white"
              aria-label="Previous month"
              disabled={isLoadingCalendar}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-slate-100">
              {format(calendarMonth, "MMMM yyyy")}
            </p>
            <button
              type="button"
              onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-white/30 hover:text-white"
              aria-label="Next month"
              disabled={isLoadingCalendar}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] uppercase text-slate-500">
            {weekdayLabels.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const isInMonth = isSameMonth(day, calendarMonth);
              const isPast = isBefore(day, today);
              const hasSlots = monthAvailability[key];
              const isDisabled =
                !selectedStaffId || !isInMonth || isPast || !hasSlots;
              const isSelected = selectedDate
                ? isSameDay(day, selectedDate)
                : false;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm transition",
                    isSelected
                      ? "bg-[var(--booking-accent)] text-white"
                      : "text-slate-200",
                    isDisabled && "cursor-not-allowed opacity-30",
                    !isDisabled &&
                      !isSelected &&
                      "hover:bg-white/10 hover:text-white",
                    !isInMonth && "opacity-0",
                  )}
                  aria-pressed={isSelected}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
          {isLoadingCalendar ? (
            <p className="mt-3 text-xs text-slate-500">
              Loading availability...
            </p>
          ) : null}
          {!selectedStaffId ? (
            <p className="mt-3 text-xs text-slate-500">
              Select a staff member to unlock available dates.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Select Time</span>
          <span className="text-[10px] text-slate-500">
            {selectedSlot ? formatSlotTime(selectedSlot) : "Choose a slot"}
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {!selectedDate || !selectedStaffId ? (
            <p className="text-sm text-slate-400">
              Choose a staff member and date to see available time slots.
            </p>
          ) : isLoadingSlots ? (
            <TimeSlotSkeletonGrid />
          ) : availableSlots.length > 0 ? (
            <div
              key={`${selectedStaffId}-${selectedDate.toDateString()}`}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-fade-in"
            >
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot.start_time;
                return (
                  <button
                    key={slot.start_time}
                    type="button"
                    onClick={() => setSelectedSlot(slot.start_time)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm font-semibold transition",
                      isSelected
                        ? "border-[var(--booking-accent)] bg-[var(--booking-accent)] text-white"
                        : "border-white/10 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10",
                    )}
                    aria-pressed={isSelected}
                  >
                    {formatSlotTime(slot.start_time)}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                No open slots on this date.
              </p>
              {nextAvailableDate ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(nextAvailableDate);
                    setCalendarMonth(startOfMonth(nextAvailableDate));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  Jump to next available - {format(nextAvailableDate, "MMM d")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleJoinWaitlist}
                disabled={isJoiningWaitlist}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition",
                  isJoiningWaitlist
                    ? "opacity-60"
                    : "hover:border-white/30 hover:text-white",
                )}
              >
                {isJoiningWaitlist ? "Joining waitlist..." : "Join waitlist"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Pricing
          </span>
          <span className="text-xs text-slate-500">
            {selectedStaff ? "Adjusted for staff" : "Standard rate"}
          </span>
        </div>
        <div className="space-y-3 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span>Service price</span>
            <span className="font-semibold">
              {formatCurrency(effectivePrice)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Deposit</span>
            <span className="font-semibold">
              {effectiveDeposit > 0
                ? formatCurrency(effectiveDeposit)
                : "No deposit"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Duration</span>
            <span>{service.duration_minutes} mins</span>
          </div>
          {effectiveCapacity > 1 ? (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Group booking</span>
              <span>Up to {effectiveCapacity} people</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleBooking}
          disabled={!canContinue || isBooking}
          className={cn(
            "w-full rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide transition",
            canContinue
              ? "bg-[var(--booking-accent)] text-white hover:scale-[1.01]"
              : "bg-white/10 text-slate-500",
          )}
        >
          {isBooking ? "Processing..." : "Confirm Booking"}
        </button>
        {waitlistMessage ? (
          <p className="text-xs text-emerald-200" role="status">
            {waitlistMessage}
          </p>
        ) : null}
        {bookingError ? (
          <p className="text-sm text-rose-200" role="alert">
            {bookingError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { Clock, DollarSign, User } from "lucide-react"
import { format } from "date-fns"

interface BookingFormProps {
  service: any
  staff: Array<{ id: string; name: string }>
  userId: string
}

export function BookingForm({ service, staff, userId }: BookingFormProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const router = useRouter()

  const fetchAvailableSlots = async (date: Date, staffId: string) => {
    setIsLoadingSlots(true)
    try {
      const dateStr = format(date, "yyyy-MM-dd")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/availability/slots?service_id=${service.id}&date=${dateStr}&staff_id=${staffId}`,
        { credentials: "include" },
      )
      const data = await response.json()
      setAvailableSlots(data)
    } catch (error) {
      console.error("Error fetching slots:", error)
      setAvailableSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot("")
    if (date && selectedStaff) {
      fetchAvailableSlots(date, selectedStaff)
    }
  }

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId)
    setSelectedSlot("")
    if (selectedDate) {
      fetchAvailableSlots(selectedDate, staffId)
    }
  }

  const handleBooking = async () => {
    if (!selectedSlot || !selectedStaff) return

    setIsBooking(true)
    try {
      // First, create or get customer record
      const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId,
          full_name: "Customer Name", // Should come from user profile
          email: "customer@example.com", // Should come from user
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const customer = await customerResponse.json()

      // Create booking
      const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          service_id: service.id,
          staff_id: selectedStaff,
          customer_id: customer.id,
          start_time_utc: selectedSlot,
          booking_source: "web",
          customer_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const booking = await bookingResponse.json()

      // Redirect to payment or confirmation
      if (service.deposit_amount > 0 || service.price > 0) {
        router.push(`/payment/${booking.id}`)
      } else {
        router.push(`/booking-confirmed/${booking.id}`)
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Failed to create booking. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Date and Time</CardTitle>
            <CardDescription>Choose your preferred appointment slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Staff Member</Label>
              <Select value={selectedStaff} onValueChange={handleStaffSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || !selectedStaff}
                className="rounded-md border"
              />
            </div>

            {selectedDate && selectedStaff && (
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                {isLoadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading available slots...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.start_time}
                        variant={selectedSlot === slot.start_time ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setSelectedSlot(slot.start_time)}
                      >
                        {format(new Date(slot.start_time), "HH:mm")}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No available slots for this date.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Service</p>
                  <p className="text-sm text-muted-foreground">{service.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{service.duration_minutes} minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm text-muted-foreground">${service.price}</p>
                </div>
              </div>

              {selectedDate && (
                <div>
                  <p className="text-sm font-medium">Selected Date</p>
                  <p className="text-sm text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
              )}

              {selectedSlot && (
                <div>
                  <p className="text-sm font-medium">Selected Time</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(selectedSlot), "h:mm a")}</p>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedSlot || !selectedStaff || isBooking}
              onClick={handleBooking}
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

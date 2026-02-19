"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CreditCard, Calendar, User, Clock } from "lucide-react"

interface PaymentFormProps {
  booking: any
}

export function PaymentForm({ booking }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const amount =
    booking.services.deposit_amount > 0
      ? booking.services.deposit_amount
      : booking.services.price

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      router.push(`/booking-confirmed/${booking.id}`)
    } catch (error) {
      console.error("Payment error:", error)
      alert("Unable to continue. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Confirm Booking</h1>
        <p className="mt-2 text-muted-foreground">
          Payment will be collected at your appointment.
        </p>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{booking.services.name}</p>
              <p className="text-sm text-muted-foreground">
                with {booking.staff?.full_name || "Staff Member"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{format(new Date(booking.start_time_utc), "MMMM d, yyyy")}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(booking.start_time_utc), "h:mm a")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{booking.services.duration_minutes} minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service Price</span>
            <span className="font-medium">${booking.services.price}</span>
          </div>

          {booking.services.deposit_amount > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deposit Amount</span>
                <span className="font-medium">${booking.services.deposit_amount}</span>
              </div>
              <Badge variant="secondary" className="w-fit">
                Pay ${booking.services.deposit_amount} now, ${booking.services.price - booking.services.deposit_amount}{" "}
                later
              </Badge>
            </>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Due Now</span>
              <span>${amount}</span>
            </div>
          </div>

          <Button onClick={handlePayment} disabled={isProcessing} className="w-full" size="lg">
            <CreditCard className="mr-2 h-5 w-5" />
            {isProcessing ? "Processing..." : "Confirm and Finish"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Pay in person or as directed by staff.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

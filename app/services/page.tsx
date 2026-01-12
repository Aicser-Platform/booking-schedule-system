import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services } = await supabase.from("services").select("*").eq("is_active", true).order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Available Services</h1>
          <p className="mt-2 text-lg text-muted-foreground">Browse our services and book your appointment</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services?.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">${service.price}</span>
                  </div>
                  {service.deposit_amount > 0 && (
                    <Badge variant="secondary" className="w-fit">
                      ${service.deposit_amount} deposit required
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/book/${service.id}`}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {(!services || services.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground">No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

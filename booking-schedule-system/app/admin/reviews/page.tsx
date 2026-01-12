import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { EmptyState } from "@/components/dashboard/empty-state"

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      customers(full_name),
      services(name)
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h2>
        <p className="text-muted-foreground">Moderate and manage customer feedback</p>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review: any) => (
            <Card key={review.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.customers?.full_name}</span>
                      <Badge variant="outline">{review.services?.name}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                  <Button size="sm" variant="ghost">
                    {review.is_visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Customer reviews will appear here once they're submitted."
        />
      )}
    </DashboardLayout>
  )
}

import { BookingRowSkeleton } from "@/components/skeletons/BookingRowSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBookingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
      </header>

      <div className="container motion-page space-y-4 py-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <BookingRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}


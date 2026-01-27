import { ServiceCardSkeleton } from "@/components/skeletons/ServiceCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container motion-page space-y-12 py-10 sm:py-16">
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-32 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-muted/50 p-6 shadow-[var(--shadow-card)]">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}


import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCardSkeleton } from "@/components/skeletons/ServiceCardSkeleton";

export default function AdminServicesLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8 motion-page">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}


import { Skeleton } from "@/components/ui/skeleton";

type TimeSlotSkeletonGridProps = {
  count?: number;
};

export function TimeSlotSkeletonGrid({
  count = 12,
}: TimeSlotSkeletonGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}


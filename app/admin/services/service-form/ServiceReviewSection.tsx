import type { ServiceFormValues } from "./types";

type ServiceReviewSectionProps = {
  values: ServiceFormValues;
  reviewTags: string[];
  formatMoney: (amount: number) => string;
  surfaceCardClass: string;
  summaryCardClass: string;
};

export function ServiceReviewSection({
  values,
  reviewTags,
  formatMoney,
  surfaceCardClass,
  summaryCardClass,
}: ServiceReviewSectionProps) {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Primary Label
          </p>
          <p className="text-base font-semibold text-foreground">
            {values.name || "Not set"}
          </p>
          <p className="text-sm text-muted-foreground">
            {values.public_name || "Public name not set"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </p>
            <p className="text-sm font-semibold text-foreground">
              {values.category || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Internal Name
            </p>
            <p className="text-sm font-semibold text-foreground">
              {values.internal_name || "Not set"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tags
          </p>
          {reviewTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {reviewTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags added</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Description
          </p>
          <p className="text-sm text-muted-foreground">
            {values.description || "No description provided"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Inclusions
            </p>
            <p className="text-sm text-muted-foreground">
              {values.inclusions || "None"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Prep Notes
            </p>
            <p className="text-sm text-muted-foreground">
              {values.prep_notes || "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {values.image_urls.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {values.image_urls.map((url, index) => (
              <div key={`${url}-${index}`} className={surfaceCardClass}>
                <img
                  src={url}
                  alt={`Service visual preview ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-card text-xs font-semibold text-muted-foreground">
            No image added
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className={summaryCardClass}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Price
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatMoney(values.price)}
            </p>
          </div>
          <div className={summaryCardClass}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Deposit
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatMoney(values.deposit_amount)}
            </p>
          </div>
          <div className={summaryCardClass}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Duration
            </p>
            <p className="text-sm font-semibold text-foreground">
              {values.duration_minutes} min
            </p>
          </div>
          <div className={summaryCardClass}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Buffer
            </p>
            <p className="text-sm font-semibold text-foreground">
              {values.buffer_minutes} min
            </p>
          </div>
          <div className={summaryCardClass}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Capacity
            </p>
            <p className="text-sm font-semibold text-foreground">
              {values.max_capacity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

export function TrustSection() {
  const stats = [
    { value: "10K+", label: "Happy Clients" },
    { value: "4.9/5", label: "Average Rating" },
    { value: "100%", label: "Secure Payments" },
  ];

  return (
    <section id="about" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              The experience
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Trusted by professionals who value excellence
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Every booking is designed with clarity, discretion, and premium
              service at the core.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  quote:
                    "Effortless booking and refined presentation. Everything feels curated.",
                  name: "Nina K.",
                },
                {
                  quote:
                    "Premium service details and a calm, trustworthy experience.",
                  name: "Jacob P.",
                },
              ].map((review) => (
                <div key={review.name} className="rounded-2xl bg-muted/40 p-5">
                  <p className="text-sm text-foreground">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {review.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-muted/30 p-8 shadow-sm">
            <div className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl bg-muted text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Experience Image
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full bg-background px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70"
                >
                  {stat.value} {stat.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

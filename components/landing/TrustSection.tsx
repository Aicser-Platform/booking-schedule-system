"use client";

export function TrustSection() {
  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "4.9/5", label: "Average Rating" },
    { value: "100%", label: "Secure Payments" },
  ];

  return (
    <section id="about" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="motion-safe:animate-fade-in">
            <div className="overflow-hidden rounded-[28px] bg-muted shadow-sm">
              <div className="aspect-[4/5] w-full bg-muted">
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Experience Image
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground/70"
                >
                  {stat.value} {stat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="motion-safe:animate-fade-in" style={{ animationDelay: "120ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              A refined experience
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Trusted by thousands of guests
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From first click to confirmed booking, every detail is designed to
              feel effortless, calm, and premium.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  quote:
                    "Everything was clear, elegant, and fast. Booking felt like ordering from a premium menu.",
                  name: "Nina K.",
                },
                {
                  quote:
                    "Beautiful service presentation and effortless scheduling. I always return here.",
                  name: "Jacob P.",
                },
              ].map((review) => (
                <div
                  key={review.name}
                  className="rounded-2xl bg-muted/40 p-5"
                >
                  <p className="text-sm text-foreground">"{review.quote}"</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {review.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {["Verified reviews", "Secure checkout", "Instant confirmation"].map(
                (item) => (
                  <span key={item} className="rounded-full bg-muted px-4 py-2">
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

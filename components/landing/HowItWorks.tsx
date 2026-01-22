"use client";

export function HowItWorks() {
  const steps = [
    {
      title: "Browse the menu",
      description:
        "Explore curated services and compare details like you would with a menu.",
    },
    {
      title: "Pick your time",
      description:
        "Select a time that fits your schedule with instant availability.",
    },
    {
      title: "Confirm your booking",
      description: "Checkout securely and receive a confirmation immediately.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple steps, refined experience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Book your appointment in three calm, intuitive steps.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl bg-background p-6 shadow-sm motion-safe:animate-fade-in"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step Image
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  Step {index + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

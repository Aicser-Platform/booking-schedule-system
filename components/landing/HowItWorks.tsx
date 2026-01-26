"use client";

export function HowItWorks() {
  const steps = [
    {
      title: "Explore services",
      description:
        "Browse our curated selection and pick the service that suits your needs.",
    },
    {
      title: "Select schedule",
      description:
        "Choose a time that fits your calendar with instant availability.",
    },
    {
      title: "Arrive & enjoy",
      description:
        "Experience a seamless session with professional service delivery.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            The process
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple steps, refined experience
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
                Step {index + 1}
              </div>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

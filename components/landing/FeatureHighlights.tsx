"use client";

import {
  Calendar,
  Shield,
  Clock,
  Star,
  CreditCard,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Instant Booking",
    description:
      "Book your service in under 2 minutes with real-time availability.",
    color: "text-blue-600",
    bgColor: "bg-blue-500/15",
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description:
      "Your payments and personal data are protected with bank-level security.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/15",
  },
  {
    icon: Star,
    title: "Verified Professionals",
    description:
      "All service providers are thoroughly vetted and highly rated.",
    color: "text-amber-600",
    bgColor: "bg-amber-500/15",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Reschedule or cancel anytime with our hassle-free policy.",
    color: "text-purple-600",
    bgColor: "bg-purple-500/15",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description:
      "Multiple payment options with transparent pricing—no hidden fees.",
    color: "text-pink-600",
    bgColor: "bg-pink-500/15",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our dedicated team is always here to help you with any questions.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/15",
  },
];

export function FeatureHighlights() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Built for your peace of mind
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            We&apos;ve designed every detail to make booking effortless, secure,
            and enjoyable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Large feature cards */}
          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)] lg:col-span-7">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${features[0].bgColor}`}
              >
                <Calendar className={`h-6 w-6 ${features[0].color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{features[0].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {features[0].description}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)] lg:col-span-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${features[1].bgColor}`}
              >
                <Shield className={`h-6 w-6 ${features[1].color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{features[1].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {features[1].description}
                </p>
              </div>
            </div>
          </div>

          {/* Medium feature cards */}
          {features.slice(2).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)] lg:col-span-4"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

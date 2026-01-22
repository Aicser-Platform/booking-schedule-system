"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -left-20 top-1/2 h-56 w-56 rounded-full bg-blue-500/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Premium booking experience
            </div>

            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                A calm, premium way to book the services you love
              </h1>
              <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
                Enjoy a refined booking experience with curated services and
                seamless scheduling. Real-time availability, instant
                confirmations, and effortless rescheduling built in.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(91,90,247,0.4)]"
              >
                <Link href="#services">Start booking</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/60 bg-background/60 transition duration-300 hover:-translate-y-0.5 hover:bg-muted/60"
              >
                <Link href="#services">Browse services</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Avg. booking time", value: "38 sec" },
                { label: "Customer satisfaction", value: "4.9/5" },
                { label: "Services available", value: "50+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-card/75 px-4 py-3 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card/80"
                >
                  <p className="text-xl font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-zoom-in">
            <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-primary/20 blur-[80px]" />
            <div className="relative rounded-[28px] border border-border/60 bg-card/85 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Your schedule
                  </p>
                  <p className="text-lg font-semibold">
                    Today •{" "}
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  Available
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  {
                    time: "09:30 - 10:15",
                    label: "Hair Styling",
                    status: "Booked",
                  },
                  {
                    time: "10:30 - 11:00",
                    label: "Consultation",
                    status: "Available",
                  },
                  {
                    time: "11:15 - 12:00",
                    label: "Massage Therapy",
                    status: "Available",
                  },
                ].map((slot) => (
                  <div
                    key={slot.time}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm"
                  >
                    <div>
                      <p className="text-sm font-medium">{slot.time}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.label}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                      {slot.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    This week
                  </p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Rating
                  </p>
                  <p className="text-2xl font-semibold">4.9★</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-t border-border/60 pt-10 md:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              label: "Instant confirmation",
              desc: "Book in seconds",
            },
            {
              icon: Shield,
              label: "Secure payments",
              desc: "Your data protected",
            },
            {
              icon: Clock,
              label: "Flexible scheduling",
              desc: "Reschedule anytime",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card/80"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

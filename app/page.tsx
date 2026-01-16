import type { CSSProperties } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Fraunces, Sora } from "next/font/google";

import { Button } from "@/components/ui/button";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["italic", "normal"],
});

const landingTheme = {
  "--landing-bg": "#0b0b10",
  "--landing-surface": "#12121a",
  "--landing-surface-strong": "#181828",
  "--landing-text": "#f8fafc",
  "--landing-muted": "#9ca3af",
  "--landing-accent": "#5b5af7",
  "--landing-accent-strong": "#6f6dff",
  "--landing-warm": "#8b5cf6",
} as CSSProperties;

export default function HomePage() {
  return (
    <div
      className={`${sora.className} relative min-h-screen overflow-hidden bg-[color:var(--landing-bg)] text-[color:var(--landing-text)]`}
      style={landingTheme}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1c1b39,transparent_65%)]" />
      <div className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-[color:var(--landing-accent)]/20 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[color:var(--landing-bg)]/85 backdrop-blur animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--landing-accent)]/15 text-[color:var(--landing-accent)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--landing-accent)]/25">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">DataBook</p>
                <p className="text-[0.6rem] uppercase tracking-[0.35em] text-[color:var(--landing-muted)]">
                  Operations Suite
                </p>
              </div>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-[color:var(--landing-muted)] md:flex">
              <Link
                className="relative transition duration-300 hover:text-white after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[color:var(--landing-accent)] after:transition-all after:duration-300 hover:after:w-6"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="relative transition duration-300 hover:text-white after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[color:var(--landing-accent)] after:transition-all after:duration-300 hover:after:w-6"
                href="#workflow"
              >
                Workflow
              </Link>
              <Link
                className="relative transition duration-300 hover:text-white after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[color:var(--landing-accent)] after:transition-all after:duration-300 hover:after:w-6"
                href="#insights"
              >
                Insights
              </Link>
              <Link
                className="relative transition duration-300 hover:text-white after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[color:var(--landing-accent)] after:transition-all after:duration-300 hover:after:w-6"
                href="#pricing"
              >
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-transparent text-white/80 transition duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              >
                <Link href="/auth?mode=login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="bg-[color:var(--landing-accent)] text-white shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--landing-accent-strong)] hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]"
              >
                <Link href="/auth?mode=signup">Get started</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[color:var(--landing-muted)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--landing-warm)]" />
                Built for multi-location teams
              </div>
              <div className="space-y-6">
                <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  Scheduling that{" "}
                  <span
                    className={`${fraunces.className} text-[color:var(--landing-accent)]`}
                  >
                    feels
                  </span>{" "}
                  like a concierge.
                </h1>
                <p className="text-pretty text-lg text-[color:var(--landing-muted)] sm:text-xl">
                  Orchestrate services, staff, and client experiences with a
                  booking platform designed to keep your team calm and your
                  calendar full. Real-time availability, instant reminders, and
                  performance insights built in.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-[color:var(--landing-accent)] text-white shadow-[0_16px_40px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--landing-accent-strong)] hover:shadow-[0_20px_45px_rgba(91,90,247,0.4)]"
                >
                  <Link href="/auth?mode=signup">Start free trial</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-transparent text-white/80 transition duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
                >
                  <Link href="/services">Browse services</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Avg. booking time", value: "38 sec" },
                  { label: "Customer retention", value: "92%" },
                  { label: "No-show reduction", value: "34%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-[color:var(--landing-surface)]/70 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
                  >
                    <p className="text-xl font-semibold">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--landing-muted)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-[color:var(--landing-accent)]/20 blur-[80px]" />
              <div className="relative rounded-[28px] border border-white/10 bg-[color:var(--landing-surface)]/85 p-6 shadow-[0_30px_80px_rgba(5,10,20,0.7)] float-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--landing-muted)]">
                      Live day view
                    </p>
                    <p className="text-lg font-semibold">Tuesday · 24 Sep</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--landing-accent)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--landing-accent)]">
                    Online
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    {
                      time: "09:30 - 10:15",
                      label: "Consultation",
                      status: "Booked",
                    },
                    {
                      time: "10:30 - 11:00",
                      label: "Follow-up",
                      status: "Confirmed",
                    },
                    { time: "11:15 - 12:00", label: "Styling", status: "Hold" },
                  ].map((slot) => (
                    <div
                      key={slot.time}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{slot.time}</p>
                        <p className="text-xs text-[color:var(--landing-muted)]">
                          {slot.label}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--landing-muted)]">
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--landing-muted)]">
                      Utilization
                    </p>
                    <p className="text-2xl font-semibold">86%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--landing-muted)]">
                      Reminders
                    </p>
                    <p className="text-2xl font-semibold">24 sent</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 left-10 hidden rounded-2xl border border-white/10 bg-[color:var(--landing-surface-strong)]/95 px-4 py-3 shadow-[0_18px_40px_rgba(6,10,22,0.5)] lg:block">
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--landing-muted)]">
                  Next opening
                </p>
                <p className="text-lg font-semibold">Tomorrow · 08:00 AM</p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 border-t border-white/5 pt-10 md:grid-cols-4">
            {["Bloom Spa", "Aperture Clinic", "Nexa Dental", "Studio 18"].map(
              (name) => (
                <div
                  key={name}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs uppercase tracking-[0.3em] text-[color:var(--landing-muted)] transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {name}
                </div>
              )
            )}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--landing-muted)]">
              Everything you need
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              The control room for your appointments.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(6,10,22,0.45)] lg:col-span-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--landing-accent)]/15 text-[color:var(--landing-accent)]">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Time-slot intelligence
                  </h3>
                  <p className="text-sm text-[color:var(--landing-muted)]">
                    Dynamic buffers, auto-reschedule, and smart slot matching
                    keep your day predictable.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Smart waitlist", "Multi-location routing"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--landing-accent)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(6,10,22,0.45)] lg:col-span-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--landing-warm)]/15 text-[color:var(--landing-warm)]">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Payment protection</h3>
                  <p className="text-sm text-[color:var(--landing-muted)]">
                    Deposit rules, cancellation fees, and secure checkout keep
                    revenue predictable.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[color:var(--landing-muted)]">
                ABA Payway + card vaulting enabled.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(6,10,22,0.45)] lg:col-span-4">
              <Users className="h-8 w-8 text-[color:var(--landing-accent)]" />
              <h3 className="mt-4 text-xl font-semibold">
                Staff orchestration
              </h3>
              <p className="mt-2 text-sm text-[color:var(--landing-muted)]">
                Staff-level schedules, break rules, and skill tagging that
                auto-assigns bookings.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(6,10,22,0.45)] lg:col-span-4">
              <Zap className="h-8 w-8 text-[color:var(--landing-warm)]" />
              <h3 className="mt-4 text-xl font-semibold">Instant messaging</h3>
              <p className="mt-2 text-sm text-[color:var(--landing-muted)]">
                Automated reminders, confirmations, and post-visit reviews built
                in.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(6,10,22,0.45)] lg:col-span-4">
              <Sparkles className="h-8 w-8 text-[color:var(--landing-accent)]" />
              <h3 className="mt-4 text-xl font-semibold">Client concierge</h3>
              <p className="mt-2 text-sm text-[color:var(--landing-muted)]">
                White-labeled booking portal with branded confirmations and rich
                intake forms.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(6,10,22,0.45)] lg:col-span-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    Analytics that speak ops
                  </h3>
                  <p className="text-sm text-[color:var(--landing-muted)]">
                    Track utilization, staff performance, and revenue across
                    every location.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-[color:var(--landing-muted)]">
                  <BarChart3 className="h-5 w-5 text-[color:var(--landing-accent)]" />
                  Weekly summaries · Growth signals · Trend alerts
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--landing-muted)]">
                Workflow
              </p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                From inquiry to checkout in three steps.
              </h2>
              <p className="text-sm text-[color:var(--landing-muted)]">
                Automate the busy work and keep the team focused on service.
                DataBook handles everything behind the scenes.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  title: "Capture demand",
                  desc: "Embed booking on your site, social, and Google Business.",
                },
                {
                  title: "Confirm instantly",
                  desc: "Rules, reminders, and deposits secure every booking.",
                },
                {
                  title: "Measure outcomes",
                  desc: "Daily dashboards and staff insights keep operations on track.",
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[color:var(--landing-surface)]/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--landing-accent)]/15 text-[color:var(--landing-accent)]">
                    <span className="text-sm font-semibold">0{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className="text-sm text-[color:var(--landing-muted)]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="insights" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="rounded-[32px] border border-white/10 bg-[color:var(--landing-surface-strong)]/90 px-8 py-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--landing-muted)]">
                  Intelligence
                </p>
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  A command center for every location.
                </h2>
                <p className="text-sm text-[color:var(--landing-muted)]">
                  Predict demand, see staffing gaps, and track revenue in one
                  clean overview. Share reports with owners in seconds.
                </p>
                <Button
                  asChild
                  className="mt-4 rounded-full bg-[color:var(--landing-accent)] text-white shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--landing-accent-strong)] hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]"
                >
                  <Link href="/auth?mode=signup">Explore analytics</Link>
                </Button>
              </div>
              <div className="space-y-4 text-sm text-[color:var(--landing-muted)]">
                {[
                  "Revenue by service, staff, and location",
                  "Forecasted availability with staffing alerts",
                  "No-show risk dashboard and recovery tools",
                  "Sentiment tracking from post-visit reviews",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--landing-accent)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--landing-muted)]">
                Pricing
              </p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Launch your booking flow this week.
              </h2>
              <p className="text-sm text-[color:var(--landing-muted)]">
                Start free, then scale to teams and multi-location operations
                with clear, predictable pricing.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Unlimited bookings", "Team calendars", "Payment rules"].map(
                  (perk) => (
                    <span
                      key={perk}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--landing-muted)]"
                    >
                      {perk}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[color:var(--landing-surface)]/85 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--landing-muted)]">
                Growth plan
              </p>
              <p className="mt-3 text-4xl font-semibold">$49</p>
              <p className="text-sm text-[color:var(--landing-muted)]">
                per location / month
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[color:var(--landing-muted)]">
                {[
                  "All scheduling and staff tools",
                  "Automated reminders and messaging",
                  "Analytics and reporting suite",
                  "Priority support for teams",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--landing-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-6 w-full rounded-full bg-[color:var(--landing-accent)] text-white shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--landing-accent-strong)] hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]"
              >
                <Link href="/auth?mode=signup">Start now</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-[32px] border border-white/10 bg-[color:var(--landing-surface-strong)]/90 px-8 py-12 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--landing-muted)]">
              Ready to launch
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Give your clients a booking experience they remember.
            </h2>
            <p className="mt-4 text-sm text-[color:var(--landing-muted)]">
              Set up in minutes, automate confirmations, and keep every location
              perfectly scheduled.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-[color:var(--landing-accent)] text-white shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--landing-accent-strong)] hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]"
              >
                <Link href="/auth?mode=signup">Create your account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-transparent text-white/80 transition duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              >
                <Link href="/services">View demo services</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[color:var(--landing-accent)]" />
              <span className="font-semibold">DataBook</span>
            </div>
            <p className="text-sm text-[color:var(--landing-muted)]">
              © 2026 DataBook. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

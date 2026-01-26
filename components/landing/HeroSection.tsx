"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-muted shadow-sm">
          <div className="absolute inset-0">
            <Image
              src="/Office.webp"
              alt="Office workspace"
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative z-10 max-w-2xl px-8 py-16 sm:px-12 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Aicser Booking System
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Excellence in Every{" "}
              <span className="italic font-normal">Appointment</span>
            </h1>
            <p className="mt-5 text-base text-white/80 sm:text-lg">
              Curated experiences and premium service booking, designed for
              discerning professionals.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-sm font-semibold uppercase tracking-wide"
              >
                <Link href="#services">Book Your Session</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 border-white/50 bg-transparent text-sm font-semibold uppercase tracking-wide text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#services">View Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

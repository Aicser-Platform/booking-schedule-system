"use client";

import Lottie from "lottie-react";
import bookingAnimation from "@/components/lottie/auth-switch.json";

export function LandingHeroAnimation() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 p-8 shadow-2xl backdrop-blur">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />

      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10">
        <p className="text-sm uppercase tracking-widest text-indigo-300 font-semibold">
          ⏱️ Today
        </p>
        <p className="mt-3 text-3xl font-bold text-white">Book in seconds</p>
        <p className="mt-2 text-slate-300">
          Pick a service, choose a time, and you&apos;re set.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <div className="h-48 w-48 drop-shadow-lg">
            <Lottie animationData={bookingAnimation} loop />
          </div>
        </div>
      </div>
    </div>
  );
}

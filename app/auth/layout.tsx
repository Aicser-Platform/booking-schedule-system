"use client";

import type React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import AuthTransition from "@/components/auth/auth-transition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [useFallback] = useState(() => {
    if (typeof document === "undefined") return true;
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };
    return !doc.startViewTransition;
  });

  return (
    <div className="relative overflow-hidden">
      <AuthTransition />
      <div
        key={pathname}
        className={`relative z-10 transform transition duration-500 ease-out ${
          useFallback
            ? "animate-in fade-in slide-in-from-bottom-2"
            : "opacity-100 translate-y-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

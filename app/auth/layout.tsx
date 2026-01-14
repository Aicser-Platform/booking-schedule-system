"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import AuthTransition from "@/components/auth/auth-transition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(true);
  const [useFallback, setUseFallback] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };
    setUseFallback(!doc.startViewTransition);
  }, []);

  useEffect(() => {
    if (!useFallback) {
      return;
    }

    setIsReady(false);
    const raf = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div className="relative overflow-hidden">
      <AuthTransition />
      <div
        key={pathname}
        className={`relative z-10 transform transition duration-500 ease-out ${
          useFallback
            ? isReady
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
            : "opacity-100 translate-y-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

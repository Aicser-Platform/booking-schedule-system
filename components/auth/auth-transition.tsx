"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

import animationData from "@/components/lottie/auth-switch.json";

const TRANSITION_MS = 550;

export default function AuthTransition() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const hasMounted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setIsActive(true);
    lottieRef.current?.goToAndPlay(0, true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsActive(false);
    }, TRANSITION_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
        isActive ? "opacity-70 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
      />
    </div>
  );
}

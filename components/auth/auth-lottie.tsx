"use client";

import Lottie from "lottie-react";

import animationData from "@/components/lottie/auth-switch.json";

type AuthLottieProps = {
  className?: string;
};

export default function AuthLottie({ className }: AuthLottieProps) {
  return (
    <div className={`pointer-events-none ${className ?? ""}`}>
      <Lottie animationData={animationData} loop />
    </div>
  );
}

import { Suspense } from "react";

import AuthClient from "./auth-client";

type AuthPageProps = {
  searchParams?: { mode?: string | string[] };
};

export default function AuthPage({ searchParams }: AuthPageProps) {
  const rawMode = searchParams?.mode;
  const modeParam = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  const initialMode = modeParam === "signup" ? "signup" : "login";

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0b10]" />}>
      <AuthClient initialMode={initialMode} />
    </Suspense>
  );
}

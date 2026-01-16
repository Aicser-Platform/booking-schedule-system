import { Suspense } from "react";

import AuthClient from "./auth-client";

type AuthPageProps = {
  searchParams: Promise<{ mode?: string | string[] }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const rawMode = params?.mode;
  const modeParam = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  const initialMode = modeParam === "signup" ? "signup" : "login";

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0b10]" />}>
      <AuthClient initialMode={initialMode} />
    </Suspense>
  );
}

"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

type AuthClientProps = {
  initialMode: Mode;
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AuthClient({ initialMode }: AuthClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    if (modeParam === "login" || modeParam === "signup") {
      setMode(modeParam);
    }
  }, [modeParam]);

  const handleModeChange = (nextMode: Mode) => {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setLoginError(null);
    setSignupError(null);

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", nextMode);
    const query = params.toString();
    router.replace(query ? `/auth?${query}` : "/auth", { scroll: false });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!res.ok) {
        let message = "Invalid email or password";
        try {
          const data = await res.json();
          message = data?.detail || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const me = await meRes.json();

      const userRole = me?.user?.role;
      if (userRole === "admin" || userRole === "superadmin") {
        router.push("/admin/dashboard");
      } else if (userRole === "staff") {
        router.push("/staff/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);

    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match");
      setSignupLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      setSignupLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          full_name: fullName,
          phone,
        }),
      });

      if (!res.ok) {
        let message = "Failed to create account";
        try {
          const data = await res.json();
          message = data?.detail || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      router.push("/auth/signup-success");
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div
      className={`${spaceGrotesk.className} relative min-h-screen overflow-hidden bg-[#0b0b10] text-white`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1c1b39,transparent_65%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-160px] h-72 w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                Back to landing
              </Link>
            </Button>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-100 shadow-[0_12px_30px_rgba(79,70,229,0.25)]">
              <span className="text-2xl font-semibold">A</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              AppointBook <span className="text-indigo-300">Elite</span>
            </p>
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.45em] text-white/50">
              Authorized access only
            </p>
          </div>

          <Card
            className="glass-card shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            style={{ border: "none" }}
          >
            <CardContent className="px-6 py-8 sm:px-8">
              <div className="relative mb-6 flex rounded-full bg-white/5 p-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                <span
                  className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-indigo-500/90 shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-transform duration-500 ${
                    mode === "signup" ? "translate-x-full" : "translate-x-0"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className={`relative z-10 flex-1 rounded-full px-3 py-2 text-center transition ${
                    mode === "login"
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("signup")}
                  className={`relative z-10 flex-1 rounded-full px-3 py-2 text-center transition ${
                    mode === "signup"
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>

              <div>
                {mode === "login" ? (
                  <form onSubmit={handleLogin}>
                    <div className="flex flex-col gap-5">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="login-email"
                          className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                        >
                          Institutional email
                        </Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@organization.com"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            disabled={loginLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="login-password"
                            className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                          >
                            Master password
                          </Label>
                          <Link
                            href="/auth/reset-password"
                            className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80 transition hover:text-indigo-200"
                          >
                            Recovery
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="login-password"
                            type="password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            disabled={loginLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-white/50">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-white/10 accent-indigo-500"
                        />
                        Remember credentials
                      </label>

                      {loginError && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                          {loginError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-indigo-500/35"
                        disabled={loginLoading}
                      >
                        {loginLoading ? "Authorizing..." : "Authorize session"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-white/40">
                      New here?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeChange("signup")}
                        className="text-indigo-300 transition hover:text-indigo-200"
                      >
                        Create access
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignup}>
                    <div className="flex flex-col gap-5">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="fullName"
                          className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                        >
                          Full name
                        </Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={signupLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="signup-email"
                          className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                        >
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="name@organization.com"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            disabled={signupLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="phone"
                          className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                        >
                          Phone number
                        </Label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={signupLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="signup-password"
                          className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                        >
                          Create password
                        </Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="signup-password"
                            type="password"
                            required
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            disabled={signupLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/50"
                        >
                          Confirm password
                        </Label>
                        <div className="relative">
                          <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={signupLoading}
                            className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      {signupError && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                          {signupError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-indigo-500/35"
                        disabled={signupLoading}
                      >
                        {signupLoading
                          ? "Creating access..."
                          : "Authorize account"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-white/40">
                      Already cleared?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeChange("login")}
                        className="text-indigo-300 transition hover:text-indigo-200"
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

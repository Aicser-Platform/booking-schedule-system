"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function Navbar() {
  const { user } = useAuth();
  const role = user?.role;
  const isStaff = role === "staff";
  const isAdmin = role === "admin" || role === "superadmin";
  const showStaffAdminButton = isStaff || isAdmin || !user;
  const staffAdminLabel = isStaff
    ? "Staff Dashboard"
    : isAdmin
      ? "Admin Dashboard"
      : "Staff/Admin Sign In";
  const staffAdminHref = isStaff
    ? "/staff/dashboard"
    : isAdmin
      ? "/admin/dashboard"
      : "/auth?mode=login";

  const handleScroll = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Image
              src="/logo.png"
              alt="AICSER"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">AICSER</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60 md:flex">
          <Link
            href="#services"
            onClick={(event) => handleScroll(event, "services")}
            className="transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link
            href="#about"
            onClick={(event) => handleScroll(event, "about")}
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="#contact"
            onClick={(event) => handleScroll(event, "contact")}
            className="transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {showStaffAdminButton && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-full border-border/70 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70"
            >
              <Link href={staffAdminHref}>{staffAdminLabel}</Link>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            className="h-10 px-6 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            <Link
              href="#services"
              onClick={(event) => handleScroll(event, "services")}
            >
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

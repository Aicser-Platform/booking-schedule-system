"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const handleScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          onClick={(event) => handleScroll(event, "top")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
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
          <span className="text-xl font-semibold tracking-tight">AICSER</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="#services"
            onClick={(event) => handleScroll(event, "services")}
            className="text-[15px] font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Menu
          </Link>
          <Link
            href="#about"
            onClick={(event) => handleScroll(event, "about")}
            className="text-[15px] font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="#contact"
            onClick={(event) => handleScroll(event, "contact")}
            className="text-[15px] font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>

        <Button
          asChild
          size="lg"
          className="h-11 px-8 font-semibold transition-transform active:scale-[0.98]"
        >
          <Link
            href="#services"
            onClick={(event) => handleScroll(event, "services")}
          >
            Book Now
          </Link>
        </Button>
      </div>
    </header>
  );
}

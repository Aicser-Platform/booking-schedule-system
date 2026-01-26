"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { name: "Services", href: "#services" },
      { name: "About", href: "#about" },
      { name: "How It Works", href: "#how-it-works" },
    ],
    Company: [
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    Support: [
      { name: "Help Center", href: "/support" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer id="contact" className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Image
                  src="/logo.png"
                  alt="AICSER"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              </div>
              <span className="text-lg font-semibold tracking-tight">AICSER</span>
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Premium booking for curated, professional services.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>123 Avenue Montaigne</p>
              <p>Phnom Penh</p>
              <p>+855 000-1234</p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/70">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground sm:flex-row">
          <p>&copy; {currentYear} AICSER Booking System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

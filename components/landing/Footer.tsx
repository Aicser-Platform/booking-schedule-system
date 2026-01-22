"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Services: [
      { name: "Haircut & Styling", href: "/services?category=1" },
      { name: "Spa & Massage", href: "/services?category=2" },
      { name: "Beauty & Makeup", href: "/services?category=3" },
      { name: "Fitness & Training", href: "/services?category=4" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
    ],
    Support: [
      { name: "Help Center", href: "/support" },
      { name: "FAQs", href: "/faq" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="AICSER"
                  width={28}
                  height={28}
                  className="h-7 w-7 brightness-0 invert"
                />
              </div>
              <span className="text-xl font-bold tracking-tight">AICSER</span>
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Your trusted platform for booking exceptional appointments and
              services
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-bold tracking-wide uppercase text-foreground/80">
                {category}
              </h3>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AICSER. All rights reserved
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

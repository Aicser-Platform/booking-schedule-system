"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { FeaturedServices } from "@/components/landing/FeaturedServices";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { TrustSection } from "@/components/landing/TrustSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Category, FilterState, Service } from "@/lib/types/landing";

type ApiService = {
  id: string;
  name: string;
  public_name?: string | null;
  description?: string | null;
  category?: string | null;
  tags?: string[] | null;
  price: number | string;
  duration_minutes: number | string;
  deposit_amount?: number | string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
};

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    priceRange: [0, 500],
    duration: "all",
  });
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const servicesSection = useScrollAnimation({ threshold: 0.1 });
  const trustSection = useScrollAnimation({ threshold: 0.2 });
  const howItWorksSection = useScrollAnimation({ threshold: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();

    const loadServices = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/services", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          setServices([]);
          return;
        }

        const data = (await res.json()) as ApiService[];
        const normalized = data.map((service) => ({
          id: service.id,
          name: service.name,
          publicName: service.public_name ?? null,
          description: service.description ?? null,
          price: Number(service.price ?? 0),
          durationMinutes: Number(service.duration_minutes ?? 0),
          category: service.category ?? null,
          tags: service.tags ?? [],
          imageUrl: service.image_url ?? null,
          imageUrls: service.image_urls ?? [],
          depositAmount:
            service.deposit_amount !== null &&
            service.deposit_amount !== undefined
              ? Number(service.deposit_amount)
              : null,
        }));

        setServices(normalized);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setServices([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
    return () => controller.abort();
  }, []);

  // Filter services based on current filters
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const displayName = service.publicName || service.name;
      const description = service.description || "";

      // Search filter
      if (
        filters.search &&
        !displayName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !description.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && service.category !== filters.category) {
        return false;
      }

      // Price filter
      if (service.price > filters.priceRange[1]) {
        return false;
      }

      // Duration filter
      if (filters.duration !== "all") {
        const maxDuration = parseInt(filters.duration);
        if (service.durationMinutes > maxDuration) {
          return false;
        }
      }

      return true;
    });
  }, [filters, services]);

  const handleCategorySelect = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }));
    document.getElementById("services")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const categories = useMemo(() => {
    const unique = new Map<string, Category>();
    services.forEach((service) => {
      if (!service.category) return;
      if (!unique.has(service.category)) {
        unique.set(service.category, {
          id: service.category,
          name: service.category,
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [services]);

  const featuredServices = useMemo(() => {
    const popular = services.filter((service) =>
      (service.tags ?? []).includes("Popular"),
    );
    const source = popular.length ? popular : services;
    return source.slice(0, 4);
  }, [services]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />

        <section id="services" className="bg-background">
          <div
            ref={servicesSection.ref}
            className={`mx-auto max-w-7xl px-6 py-16 lg:px-8 motion-safe:transition-opacity motion-safe:duration-[var(--motion-duration-page)] motion-safe:ease-[var(--motion-ease-standard)] motion-reduce:transition-none ${
              servicesSection.isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Curated offerings
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Our Services
              </h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Tailored solutions designed for clients who value precision and
                care.
              </p>
            </div>

            {/* Services Grid */}
            <ServicesGrid services={filteredServices} isLoading={isLoading} />
          </div>
        </section>

        <FeaturedServices services={featuredServices} />

        <div
          id="about"
          ref={trustSection.ref}
          className={`motion-safe:transition-opacity motion-safe:duration-[var(--motion-duration-page)] motion-safe:ease-[var(--motion-ease-standard)] motion-reduce:transition-none ${
            trustSection.isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <TrustSection />
        </div>

        <div
          ref={howItWorksSection.ref}
          className={`motion-safe:transition-opacity motion-safe:duration-[var(--motion-duration-page)] motion-safe:ease-[var(--motion-ease-standard)] motion-reduce:transition-none ${
            howItWorksSection.isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <HowItWorks />
        </div>
      </main>
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}

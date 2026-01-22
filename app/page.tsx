"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { TrustSection } from "@/components/landing/TrustSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

  // Scroll animation hooks for each section
  const servicesSection = useScrollAnimation({ threshold: 0.1 });
  const trustSection = useScrollAnimation({ threshold: 0.2 });
  const howItWorksSection = useScrollAnimation({ threshold: 0.2 });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />

        {/* All Services Section with integrated search */}
        <section id="services" className="bg-background">
          <div
            ref={servicesSection.ref}
            className={`mx-auto max-w-7xl px-6 py-16 transition-all duration-700 lg:px-8 ${
              servicesSection.isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* Header with Search Bar */}
            <div className="mb-12 space-y-8">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Explore our services
                </p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                  All Services
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Browse and search through our complete service catalog
                </p>
              </div>

              {/* Prominent Search Bar */}
              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search services by name or description..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="h-14 rounded-full border-2 pl-12 pr-6 text-base shadow-lg transition-all focus-visible:border-primary focus-visible:shadow-xl"
                  />
                </div>
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  {filteredServices.length} service
                  {filteredServices.length !== 1 ? "s" : ""} found
                  {filters.search && " for your search"}
                </p>
              </div>
            </div>

            {/* Services Grid */}
            <ServicesGrid services={filteredServices} isLoading={isLoading} />
          </div>
        </section>

        {/* Trust Section with scroll animation */}
        <div
          id="about"
          ref={trustSection.ref}
          className={`transition-all duration-700 ${
            trustSection.isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <TrustSection />
        </div>

        {/* How It Works with scroll animation */}
        <div
          ref={howItWorksSection.ref}
          className={`transition-all duration-700 delay-100 ${
            howItWorksSection.isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
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

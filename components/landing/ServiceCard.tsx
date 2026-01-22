"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/types/landing";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const displayName = service.publicName || service.name;
  const allImages =
    service.imageUrls && service.imageUrls.length > 0
      ? service.imageUrls
      : service.imageUrl
        ? [service.imageUrl]
        : [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const depositAmount = service.depositAmount
    ? Number(service.depositAmount)
    : 0;
  const tags = new Set(service.tags ?? []);

  if (depositAmount > 0) {
    tags.add("Deposit");
  }

  const tagStyles = (tag: string) => {
    if (tag === "Popular") {
      return "border-primary/30 bg-primary/10 text-primary";
    }
    if (tag === "New") {
      return "border-emerald-200/60 bg-emerald-50 text-emerald-700";
    }
    if (tag === "Deposit") {
      return "border-amber-200/60 bg-amber-50 text-amber-700";
    }
    return "border-border bg-background text-foreground/70";
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  return (
    <div className="group flex h-full flex-row gap-6 overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)]">
      {/* Image Gallery Section */}
      <div className="relative aspect-square h-[180px] w-[180px] flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIndex]}
              alt={`${displayName} - Image ${currentImageIndex + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.05]"
            />

            {/* Image Navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.65rem] font-semibold backdrop-blur-sm">
                  {currentImageIndex + 1}/{allImages.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted-foreground/10" />
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Service
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.size > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {Array.from(tags).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] backdrop-blur-sm ${tagStyles(
                  tag,
                )}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Category & Tags Row */}
          <div className="mb-3 flex items-center gap-2">
            {service.category && (
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {service.category}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {service.durationMinutes} min
              </span>
            </div>
            {depositAmount > 0 && (
              <div className="rounded-full bg-amber-50 px-3 py-1">
                <span className="text-xs font-semibold text-amber-700">
                  ${depositAmount} deposit
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-semibold leading-tight line-clamp-1">
            {displayName}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {service.description ||
              "Experience premium service with our expert team."}
          </p>
        </div>

        {/* Price & CTA Row */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="text-3xl font-bold tracking-tight">
              ${service.price}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/services/${service.id}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View details
            </Link>
            <Button
              asChild
              size="default"
              className="rounded-full bg-primary px-6 font-semibold shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]"
            >
              <Link href={`/book/${service.id}?serviceId=${service.id}`}>
                Book now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Star, Clock, Users } from "lucide-react";

type ServicePreviewData = {
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  image_urls: string[];
  is_active: boolean;
};

type ServicePreviewCardProps = {
  service: ServicePreviewData;
  onDataChange?: (data: ServicePreviewData) => void;
};

export function ServicePreviewCard({
  service,
  onDataChange,
}: ServicePreviewCardProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set(),
  );

  // Default image when no image is provided
  const defaultImage =
    "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop";

  const displayImage =
    service.image_url || service.image_urls?.[0] || defaultImage;
  const displayName = service.name || "Full System Optimization";
  const displayDescription =
    service.description ||
    "Perfect your routine by switching your digital ecosystem. We streamline peak performance and productivity by hardening and reduce inefficiency.";
  const priceValue = Number(service.price ?? 0);
  const displayPrice = Number.isFinite(priceValue) ? priceValue : 0;
  const displayDuration = service.duration_minutes || 60;
  const displayCategory = service.category || "WELLNESS";

  const imageError = failedImages.has(displayImage);

  const handleImageError = () => {
    if (failedImages.has(displayImage)) return;
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(displayImage);
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageError ? defaultImage : displayImage}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />

        {/* Featured Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            FEATURED
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              service.is_active
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }`}
          >
            {service.is_active ? "ACTIVE" : "DRAFT"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            {displayCategory}
          </div>
          <h3 className="text-lg font-bold text-foreground leading-tight">
            {displayName}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-foreground">
            ${displayPrice.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs text-muted-foreground ml-1">5.0</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{displayDuration} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>1-2 guests</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button className="w-full rounded-full py-2.5 font-semibold shadow-[var(--shadow-card)]">
            Book Now
          </Button>
        </div>

        {/* Bottom Note */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          This is how your service will appear to customers
        </div>
      </div>
    </div>
  );
}

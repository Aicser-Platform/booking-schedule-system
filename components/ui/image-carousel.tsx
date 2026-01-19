"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ImageCarousel({
  images,
  alt,
  className,
  imageClassName,
}: Props) {
  const normalized = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);

  if (normalized.length === 0) return null;

  const current = normalized[index] ?? normalized[0];
  const hasMany = normalized.length > 1;

  const goNext = () => {
    setIndex((prev) => (prev + 1) % normalized.length);
  };

  const goPrev = () => {
    setIndex((prev) => (prev - 1 < 0 ? normalized.length - 1 : prev - 1));
  };

  return (
    <div className={`relative ${className ?? ""}`.trim()}>
      <img
        src={current}
        alt={alt}
        className={imageClassName ?? "h-full w-full object-cover"}
      />
      {hasMany && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow transition hover:text-indigo-600"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow transition hover:text-indigo-600"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
            {normalized.map((_, dotIndex) => (
              <span
                key={`dot-${dotIndex}`}
                className={`h-1.5 w-1.5 rounded-full ${
                  dotIndex === index ? "bg-white" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

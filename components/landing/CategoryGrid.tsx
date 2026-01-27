"use client";

import type { Category } from "@/lib/types/landing";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect?: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  onCategorySelect,
}: CategoryGridProps) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Curated offerings
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Discover services arranged like a tailored menu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect?.(category.id)}
              className="group relative overflow-hidden rounded-3xl border border-border bg-muted motion-card motion-safe:active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none"
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category Image
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 motion-standard group-hover:bg-black/10" />
              <div className="absolute inset-x-4 bottom-4 rounded-full border border-border bg-background px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-foreground shadow-[var(--shadow-card)]">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

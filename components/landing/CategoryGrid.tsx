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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Explore the menu
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover services arranged like a curated menu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect?.(category.id)}
              className="group relative overflow-hidden rounded-3xl bg-muted shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
              <div className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/10" />
              <div className="absolute inset-x-4 bottom-4 rounded-full bg-background/95 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

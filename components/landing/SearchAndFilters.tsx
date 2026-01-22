"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, FilterState } from "@/lib/types/landing";

interface SearchAndFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
}

const defaultFilters: FilterState = {
  search: "",
  category: "all",
  priceRange: [0, 500],
  duration: "all",
};

export function SearchAndFilters({
  onFilterChange,
  categories,
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilters = [
    filters.search.trim() !== "",
    filters.category !== "all",
    filters.duration !== "all",
    filters.priceRange[1] !== 500,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilters > 0;

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <section className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Search services
            </label>
            <Input
              placeholder="Search for services..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-12 text-base transition-shadow focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="filters-panel"
              className="h-12 px-6 font-semibold transition-colors transition-transform active:scale-[0.98]"
            >
              Filters{hasActiveFilters ? ` (${activeFilters})` : ""}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`grid transition-all duration-200 ease-out ${
            showFilters
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div
              id="filters-panel"
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Duration Filter */}
              <Select
                value={filters.duration}
                onValueChange={(value) => updateFilter("duration", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="30">Under 30 min</SelectItem>
                  <SelectItem value="60">Under 1 hour</SelectItem>
                  <SelectItem value="90">Under 90 min</SelectItem>
                  <SelectItem value="120">Under 2 hours</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select
                value={filters.priceRange[1].toString()}
                onValueChange={(value) =>
                  updateFilter("priceRange", [0, parseInt(value)])
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">Any Price</SelectItem>
                  <SelectItem value="50">Under $50</SelectItem>
                  <SelectItem value="100">Under $100</SelectItem>
                  <SelectItem value="150">Under $150</SelectItem>
                  <SelectItem value="200">Under $200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

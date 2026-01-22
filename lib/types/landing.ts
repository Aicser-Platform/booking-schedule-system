export interface Category {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
  imageUrl?: string;
}

export interface Service {
  id: string;
  name: string;
  publicName?: string | null;
  description?: string | null;
  price: number;
  durationMinutes: number; // in minutes
  category?: string | null;
  tags?: string[] | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  depositAmount?: number | null;
}

export interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  duration: string;
}

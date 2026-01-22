import { Category, Service } from "@/lib/types/landing";

export const categories: Category[] = [
  { id: "1", name: "Haircut & Styling", slug: "haircut" },
  { id: "2", name: "Spa & Massage", slug: "spa" },
  { id: "3", name: "Beauty & Makeup", slug: "beauty" },
  { id: "4", name: "Fitness & Training", slug: "fitness" },
  { id: "5", name: "Consultation", slug: "consultation" },
  { id: "6", name: "Wellness", slug: "wellness" },
];

export const services: Service[] = [
  {
    id: "1",
    name: "Premium Haircut & Style",
    description: "Professional haircut with styling consultation",
    price: 45,
    durationMinutes: 60,
    category: "Haircut & Styling",
    tags: ["Popular"],
  },
  {
    id: "2",
    name: "Deep Tissue Massage",
    description: "Therapeutic massage for muscle tension relief",
    price: 85,
    durationMinutes: 90,
    category: "Spa & Massage",
    tags: ["Popular", "Deposit"],
    depositAmount: 20,
  },
  {
    id: "3",
    name: "Full Makeup Application",
    description: "Professional makeup for special events",
    price: 120,
    durationMinutes: 120,
    category: "Beauty & Makeup",
    tags: ["Deposit"],
    depositAmount: 30,
  },
  {
    id: "4",
    name: "Personal Training Session",
    description: "One-on-one fitness coaching and workout plan",
    price: 65,
    durationMinutes: 60,
    category: "Fitness & Training",
    tags: ["Popular"],
  },
  {
    id: "5",
    name: "Business Consultation",
    description: "Strategic planning and business development",
    price: 150,
    durationMinutes: 90,
    category: "Consultation",
    tags: ["Deposit"],
    depositAmount: 50,
  },
  {
    id: "6",
    name: "Yoga Class",
    description: "Relaxing group yoga session for all levels",
    price: 25,
    durationMinutes: 60,
    category: "Wellness",
    tags: ["New", "Group"],
  },
];

export const featuredServices = services.filter((s) =>
  (s.tags ?? []).includes("Popular"),
);

import type { ElementType } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  Briefcase,
  Clock,
  User,
  Bell,
  HelpCircle,
  ShieldCheck,
  FileText,
  ClipboardList,
  Star,
} from "lucide-react";

export type Role = "customer" | "staff" | "admin" | "superadmin";

export type SidebarItem = {
  title: string;
  href: string;
  icon: ElementType;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const roleLabelMap: Record<Role, string> = {
  customer: "Customer",
  staff: "Staff",
  admin: "Admin",
  superadmin: "SuperAdmin",
};

export const roleIconMap: Record<Role, ElementType> = {
  customer: User,
  staff: Briefcase,
  admin: ShieldCheck,
  superadmin: ShieldCheck,
};

const customerSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard / Home", icon: LayoutDashboard, href: "/dashboard" },
      { title: "Profile", icon: User, href: "/profile" },
      { title: "Bookings / Orders", icon: Calendar, href: "/bookings" },
      { title: "Payments / History", icon: CreditCard, href: "/payments" },
    ],
  },
  {
    title: "Support",
    items: [
      { title: "Notifications", icon: Bell, href: "/notifications" },
      { title: "Support / Help", icon: HelpCircle, href: "/support" },
    ],
  },
];

const staffSections: SidebarSection[] = [
  {
    title: "Staff",
    items: [
      {
        title: "Staff Dashboard",
        icon: LayoutDashboard,
        href: "/staff/dashboard",
      },
      {
        title: "Assigned Tasks / Services",
        icon: Briefcase,
        href: "/staff/schedule",
      },
      {
        title: "Availability Management",
        icon: Clock,
        href: "/staff/availability",
      },
      { title: "Customer Requests", icon: Users, href: "/staff/requests" },
    ],
  },
  {
    title: "Communication",
    items: [{ title: "Notifications", icon: Bell, href: "/notifications" }],
  },
];

const adminSections: SidebarSection[] = [
  {
    title: "Admin",
    items: [
      {
        title: "Admin Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
      },
      { title: "User Management", icon: Users, href: "/admin/staff" },
      {
        title: "Role & Permission Management",
        icon: ShieldCheck,
        href: "/admin/roles",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Services", icon: Briefcase, href: "/admin/services" },
      { title: "Bookings", icon: Calendar, href: "/admin/bookings" },
      { title: "Availability", icon: Clock, href: "/admin/availability" },
      { title: "Payments", icon: CreditCard, href: "/admin/payments" },
      { title: "Reviews", icon: Star, href: "/admin/reviews" },
    ],
  },
  {
    title: "Insights",
    items: [
      { title: "Reports & Analytics", icon: BarChart3, href: "/admin/reports" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "System Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
];

const superAdminSections: SidebarSection[] = [
  {
    title: "SuperAdmin",
    items: [
      {
        title: "SuperAdmin Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
      },
      { title: "Admin Management", icon: ShieldCheck, href: "/admin/admins" },
      { title: "Full User Management", icon: Users, href: "/admin/staff" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Services", icon: Briefcase, href: "/admin/services" },
      { title: "Bookings", icon: Calendar, href: "/admin/bookings" },
      { title: "Availability", icon: Clock, href: "/admin/availability" },
      { title: "Payments", icon: CreditCard, href: "/admin/payments" },
      { title: "Reviews", icon: Star, href: "/admin/reviews" },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Global System Settings",
        icon: Settings,
        href: "/admin/system-settings",
      },
      { title: "Audit Logs", icon: FileText, href: "/admin/audit-logs" },
      {
        title: "Analytics & Monitoring",
        icon: ClipboardList,
        href: "/admin/monitoring",
      },
    ],
  },
];

export const sidebarConfig: Record<Role, SidebarSection[]> = {
  customer: customerSections,
  staff: staffSections,
  admin: adminSections,
  superadmin: superAdminSections,
};

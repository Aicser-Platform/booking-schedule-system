"use client";

import type React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  CreditCard,
  Star,
  BarChart3,
  Briefcase,
  Clock,
  User,
  LogOut,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const rawRole =
    profile?.role ||
    ((user as any)?.role as "customer" | "staff" | "admin" | "superadmin") ||
    "customer";
  const role = rawRole === "superadmin" ? "admin" : rawRole;

  const handleLogout = async () => {
    try {
      // Logout via backend (clears session + cookie)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // send auth_token cookie
      });
    } catch {
      // ignore errors; still redirect
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  const getNavigationItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            title: "Overview",
            items: [
              {
                title: "Dashboard",
                icon: LayoutDashboard,
                href: "/admin/dashboard",
              },
              { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
            ],
          },
          {
            title: "Management",
            items: [
              { title: "Services", icon: Briefcase, href: "/admin/services" },
              { title: "Staff", icon: Users, href: "/admin/staff" },
              { title: "Bookings", icon: Calendar, href: "/admin/bookings" },
              {
                title: "Availability",
                icon: Clock,
                href: "/admin/availability",
              },
            ],
          },
          {
            title: "Financial",
            items: [
              { title: "Payments", icon: CreditCard, href: "/admin/payments" },
              { title: "Reports", icon: BarChart3, href: "/admin/reports" },
            ],
          },
          {
            title: "Engagement",
            items: [{ title: "Reviews", icon: Star, href: "/admin/reviews" }],
          },
        ];
      case "staff":
        return [
          {
            title: "My Work",
            items: [
              {
                title: "Dashboard",
                icon: LayoutDashboard,
                href: "/staff/dashboard",
              },
              { title: "Schedule", icon: Calendar, href: "/staff/schedule" },
              {
                title: "Availability",
                icon: Clock,
                href: "/staff/availability",
              },
            ],
          },
        ];
      default:
        return [
          {
            title: "Menu",
            items: [
              { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
              { title: "Browse Services", icon: Briefcase, href: "/services" },
              { title: "My Bookings", icon: Calendar, href: "/dashboard" },
              { title: "Profile", icon: User, href: "/profile" },
            ],
          },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center gap-2 px-2 py-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-primary-subtle">
                <Calendar className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">BookingPro</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {role} Portal
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {navigationItems.map((section, idx) => (
              <SidebarGroup key={idx}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const itemKey = `${section.title}-${item.title}-${item.href}`;
                      return (
                        <SidebarMenuItem key={itemKey}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={item.href}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" className="w-full">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.full_name?.charAt(0).toUpperCase() ||
                            user?.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {profile?.full_name ||
                            user?.email?.split("@")[0] ||
                            "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email || ""}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 size-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 size-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card/50 backdrop-blur-lg px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {pathname
                    .split("/")
                    .pop()
                    ?.replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard"}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-5" />
                  <span className="absolute top-1 right-1 size-2 rounded-full bg-primary glow-primary-subtle" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

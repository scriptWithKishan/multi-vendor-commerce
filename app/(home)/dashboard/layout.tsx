"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

interface NavTab {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const dashboardTabs: NavTab[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Add Product", href: "/dashboard/add-product", icon: PlusCircle },
  { name: "My Products", href: "/dashboard/my-products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Sales", href: "/dashboard/sales", icon: TrendingUp },
];

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Vendor Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your store catalog, track sales, and process customer orders
        </p>
      </div>

      {/* Horizontal Navbar Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto">
        {dashboardTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">{children}</div>
    </div>
  );
}

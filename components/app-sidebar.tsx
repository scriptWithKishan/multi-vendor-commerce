"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, Settings, LogOut, Store, LayoutDashboard, ShoppingCart, PackageCheck } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { IconType } from "react-icons";

interface MenuProps {
  name: string;
  route: string;
  icon: IconType;
}

const menuItems: MenuProps[] = [
  { name: "Home", route: "/", icon: Home},
  { name: "Dashboard", route: "/dashboard", icon: LayoutDashboard },
  { name: "Cart", route: "/Cart", icon: ShoppingCart},
  { name: "Orders", route: "/Orders", icon: PackageCheck}
]

export function AppSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b p-3 group-data-[collapsible=icon]:p-2.5">
        <div className="flex items-center gap-2 font-semibold group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" />
          </div>
          <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
            Menu
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {
            menuItems.map(item => (
              <SidebarGroupContent key={item.name}>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href={item.route} />}
                      isActive={pathname === item.route}
                      tooltip={item.name}
                    >
                      <item.icon className="size-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/settings" />}
              isActive={pathname === "/settings"}
              tooltip="Settings"
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

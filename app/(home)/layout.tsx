import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen flex flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">Multi-Vendor</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

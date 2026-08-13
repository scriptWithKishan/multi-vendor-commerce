import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}

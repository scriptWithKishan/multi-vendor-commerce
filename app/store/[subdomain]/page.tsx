import React from "react";
import Link from "next/link";
import { Store, MapPin, Phone, Mail, ShieldCheck, ShoppingBag, ArrowLeft } from "lucide-react";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StorefrontPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function VendorStorefrontPage({ params }: StorefrontPageProps) {
  const { subdomain } = await params;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "domainname.com";

  await dbConnect();

  const vendor = await User.findOne({
    "vendorStore.subdomain": subdomain.toLowerCase().trim(),
    role: "vendor",
  });

  if (!vendor || !vendor.vendorStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Store className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Store Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The store subdomain <span className="font-mono text-foreground font-semibold">&quot;{subdomain}&quot;</span> does not exist or is no longer active on our marketplace.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="outline" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4" /> Return to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { shopName, shopDescription, phoneNumber, storeAddress } = vendor.vendorStore;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Storefront Hero Header */}
      <header className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5 py-12 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Store className="size-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {shopName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                    <ShieldCheck className="size-3.5" /> Verified Vendor
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  https://{subdomain}.{rootDomain}
                </p>
              </div>
            </div>

            <Link href="/">
              <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
                <ArrowLeft className="size-4" /> Marketplace Home
              </Button>
            </Link>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed pt-2">
            {shopDescription}
          </p>

          {/* Contact Details Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <Mail className="size-3.5 text-primary" />
              <span>{vendor.email}</span>
            </div>

            {phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary" />
                <span>{phoneNumber}</span>
              </div>
            )}

            {storeAddress && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                <span>{storeAddress}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Products Content Placeholder */}
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Store Catalog
          </h2>
          <span className="text-xs text-muted-foreground">0 Products</span>
        </div>

        <Card className="border border-dashed border-border/80 bg-muted/20">
          <CardContent className="p-12 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No products available yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {shopName} has not added any products to their store catalog yet. Check back soon!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

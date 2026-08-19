import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";
import Product from "@/app/models/Product";
import {
  Store,
  CheckCircle,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Package,
  TrendingUp,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/dashboard");
  }

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });

  const isVendor = user?.role === "vendor" || user?.role === "admin";
  const vendorStore = user?.vendorStore;

  if (!isVendor || !vendorStore?.subdomain) {
    return (
      <Card className="border border-border/70">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              You are not a registered vendor yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Upgrade your account to a seller account to access the vendor dashboard, list products, and manage your custom store.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/settings">
              <Button className="font-medium flex items-center gap-2 mx-auto">
                <Sparkles className="size-4" /> Become a Vendor
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { shopName, subdomain, shopDescription, phoneNumber, storeAddress } = vendorStore;
  const productCount = await Product.countDocuments({ vendor: user._id });

  const envRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "domainname.com").toLowerCase();
  const cleanRoot = envRoot.split(":")[0].replace(/^www\./, "");
  const isLocal = cleanRoot === "localhost" || cleanRoot === "127.0.0.1" || process.env.NODE_ENV === "development";
  const port = isLocal ? ":3000" : "";

  const storefrontUrl = isLocal
    ? `http://${subdomain}.localhost${port}`
    : `https://${subdomain}.${cleanRoot}`;

  return (
    <div className="space-y-6">
      {/* Store Information Overview Card */}
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shrink-0">
              <Store className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold">{shopName}</CardTitle>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  <CheckCircle className="size-3.5" /> Active Vendor
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Subdomain: <span className="text-primary font-semibold">{storefrontUrl}</span>
              </p>
            </div>
          </div>

          <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
              <ExternalLink className="size-4" /> Visit Storefront
            </Button>
          </a>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Shop Description
            </h4>
            <p className="text-sm text-foreground">{shopDescription}</p>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-muted-foreground border-t">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>

            {phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-primary shrink-0" />
                <span>{phoneNumber}</span>
              </div>
            )}

            {storeAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary shrink-0" />
                <span className="truncate">{storeAddress}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Performance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{productCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active items in catalog
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer orders received
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime store earnings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Category from "@/app/models/Category";
import { SearchBar } from "@/components/search-bar";
import { Categories } from "@/components/categories";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Store,
  PackageSearch,
  Tag,
  X,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

interface ProductPopulated {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  tags?: string[];
  images: string[];
  vendor?: {
    _id: string;
    name: string;
    email: string;
    vendorStore?: {
      shopName: string;
      subdomain: string;
    };
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search, category: categorySlug } = await searchParams;

  await dbConnect();

  const query: Record<string, unknown> = {};
  let categoryFilterName = "";

  // Category filter
  if (categorySlug) {
    const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
    if (categoryDoc) {
      query.category = categoryDoc._id;
      categoryFilterName = categoryDoc.name;
    }
  }

  // Search query filter
  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  const rawProducts = await Product.find(query)
    .populate("vendor", "name email vendorStore")
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const products: ProductPopulated[] = JSON.parse(JSON.stringify(rawProducts));

  const hasActiveFilters = Boolean(search || categorySlug);
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "domainname.com").toLowerCase();
  const cleanRoot = rootDomain.split(":")[0].replace(/^www\./, "");
  const isLocal = cleanRoot === "localhost" || cleanRoot === "127.0.0.1" || process.env.NODE_ENV === "development";
  const port = isLocal ? ":3000" : "";

  return (
    <div className="flex-1 flex flex-col p-4 md:p-10 bg-gradient-to-b from-background to-muted/20 space-y-6 max-w-7xl mx-auto w-full">
      {/* Search Header */}
      <div className="w-full flex justify-center">
        <SearchBar />
      </div>

      {/* Dynamic Single-Line Category Filter Navigation */}
      <Categories />

      {/* Filter Status Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border/70 shadow-2xs">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active Filter:</span>
            {categoryFilterName && (
              <Badge variant="secondary" className="font-semibold">
                Category: {categoryFilterName}
              </Badge>
            )}
            {search && (
              <Badge variant="outline" className="font-medium">
                Search: &quot;{search}&quot;
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-1">
              ({products.length} {products.length === 1 ? "product" : "products"} found)
            </span>
          </div>

          <Link href="/">
            <Button variant="ghost" size="xs" className="text-xs inline-flex items-center gap-1">
              <X className="size-3.5" /> Clear Filters
            </Button>
          </Link>
        </div>
      )}

      {/* Products Grid Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="size-6 text-primary" />
            Featured Products
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Showing {products.length} Products
          </span>
        </div>

        {products.length === 0 ? (
          <Card className="border border-border/70 shadow-xs">
            <CardContent className="p-12 text-center space-y-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <PackageSearch className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  No products found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {hasActiveFilters
                    ? "No products match your current search or category filter. Try clearing filters or searching for something else."
                    : "No products have been published yet. Be the first vendor to add products to the marketplace!"}
                </p>
              </div>

              {hasActiveFilters && (
                <div className="pt-2">
                  <Link href="/">
                    <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                      <X className="size-4" /> Clear All Filters
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const vendorStore = product.vendor?.vendorStore;
              const hasDiscount = product.salePrice && product.salePrice < product.price;

              const storeUrl = vendorStore?.subdomain
                ? isLocal
                  ? `http://${vendorStore.subdomain}.localhost${port}`
                  : `https://${vendorStore.subdomain}.${cleanRoot}`
                : null;

              return (
                <Card
                  key={product._id}
                  className="group overflow-hidden border border-border/70 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Aspect Ratio Product Image */}
                    <div className="relative">
                      <AspectRatio ratio={1 / 1} className="bg-muted overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center bg-muted text-muted-foreground">
                            <ShoppingBag className="size-10" />
                          </div>
                        )}
                      </AspectRatio>

                      {/* Floating Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                        {product.category && (
                          <Badge variant="secondary" className="text-xs backdrop-blur-md bg-background/80 font-medium">
                            {product.category.name}
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge className="text-xs bg-destructive text-destructive-foreground font-semibold flex items-center gap-1">
                            <Tag className="size-3" /> SALE
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardHeader className="p-4 pb-2 space-y-1">
                      {/* Vendor Badge Link */}
                      {vendorStore && storeUrl ? (
                        <a
                          href={storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <Store className="size-3.5" />
                          <span>{vendorStore.shopName}</span>
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Store className="size-3.5" /> Direct Seller
                        </span>
                      )}

                      <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 space-y-2">

                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 pt-1">
                        {hasDiscount ? (
                          <>
                            <span className="text-lg font-extrabold text-primary">
                              ${product.salePrice?.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through font-medium">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-extrabold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="p-2">
                    {storeUrl ? (
                      <Link href={storeUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full transition-colors font-medium inline-flex items-center justify-center gap-2"
                        >
                          <span>Visit Storefront</span>
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-medium inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="size-4" /> View Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

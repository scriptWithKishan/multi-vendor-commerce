import React from "react";
import { Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function MyProductsPage() {
  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="size-5 text-primary" />
          My Products
        </CardTitle>
        <CardDescription>
          View and manage all products listed in your store
        </CardDescription>
      </CardHeader>
      <CardContent className="p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium text-foreground">My Products Page</p>
        <p className="text-xs text-muted-foreground mt-1">Product list table and management options will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { ShoppingBag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="size-5 text-primary" />
          Orders
        </CardTitle>
        <CardDescription>
          Track and fulfill customer orders
        </CardDescription>
      </CardHeader>
      <CardContent className="p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium text-foreground">Orders Page</p>
        <p className="text-xs text-muted-foreground mt-1">Customer order list and fulfillment status will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

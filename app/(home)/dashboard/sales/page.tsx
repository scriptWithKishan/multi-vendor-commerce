import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SalesPage() {
  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          Sales & Analytics
        </CardTitle>
        <CardDescription>
          View lifetime revenue and store performance insights
        </CardDescription>
      </CardHeader>
      <CardContent className="p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium text-foreground">Sales Page</p>
        <p className="text-xs text-muted-foreground mt-1">Revenue analytics charts and sales performance insights will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

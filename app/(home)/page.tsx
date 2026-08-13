import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground">
          <span>🛍️ Multi-Vendor Commerce Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          {session?.user?.name ? (
            <>
              Welcome back, <span className="text-primary">{session.user.name}</span>!
            </>
          ) : (
            <>
              Welcome to <span className="text-primary">Multi-Vendor Marketplace</span>
            </>
          )}
        </h1>

        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Theme
          </span>
          <ThemeToggle />
        </div>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
          Discover thousands of products from independent sellers, or start your own store and expand your reach today.
        </p>

        {session?.user ? (
          <Card className="max-w-md mx-auto mt-8 border border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Logged in as <span className="text-foreground font-semibold">{session.user.email}</span>
              </p>
              <div className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                Role: {session.user.role || "customer"}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 font-medium">
                Create Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

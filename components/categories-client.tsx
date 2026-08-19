"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoriesClientProps {
  categories: CategoryItem[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams.get("category") || "";

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(categories.length);

  useEffect(() => {
    const calculateFitting = () => {
      if (!containerRef.current || !measureRef.current) return;

      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const measureChildren = Array.from(measureRef.current.children) as HTMLElement[];

      const moreButtonWidth = 70;
      let currentWidth = 0;
      let count = 0;

      for (let i = 0; i < measureChildren.length; i++) {
        const itemWidth = measureChildren[i].getBoundingClientRect().width + 4;
        const isLast = i === measureChildren.length - 1;
        const requiredWidth = isLast
          ? currentWidth + itemWidth
          : currentWidth + itemWidth + moreButtonWidth;

        if (requiredWidth <= containerWidth) {
          currentWidth += itemWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, Math.min(categories.length, count)));
    };

    calculateFitting();

    const resizeObserver = new ResizeObserver(calculateFitting);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [categories]);

  const getCategoryHref = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategorySlug === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(0, visibleCount);
  const overflowCategories = categories.slice(visibleCount);

  return (
    <section className="w-full mx-auto my-4">
      {/* Off-screen measurement container matching exact NavigationMenuLink styles */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute top-[-9999px] left-[-9999px] flex gap-1 invisible pointer-events-none whitespace-nowrap"
      >
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="px-2.5 py-1.5 text-sm font-medium whitespace-nowrap"
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* Dynamic Single-Line Navigation */}
      <div ref={containerRef} className="w-full flex items-center justify-center">
        <NavigationMenu className="w-full max-w-full justify-center">
          <NavigationMenuList className="flex items-center gap-1 flex-nowrap w-full justify-center">
            {visibleCategories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug;
              return (
                <NavigationMenuItem key={cat._id} className="shrink-0">
                  <NavigationMenuLink
                    render={<Link href={getCategoryHref(cat.slug)} />}
                    className={isActive ? "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90" : ""}
                  >
                    {cat.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}

            {overflowCategories.length > 0 && (
              <NavigationMenuItem className="shrink-0">
                <NavigationMenuTrigger className="px-2.5 py-1.5 text-sm font-medium">
                  More
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-2 min-w-[200px]">
                  <div className="flex flex-col gap-1">
                    {overflowCategories.map((cat) => {
                      const isActive = activeCategorySlug === cat.slug;
                      return (
                        <NavigationMenuLink
                          key={cat._id}
                          render={<Link href={getCategoryHref(cat.slug)} />}
                          className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                            isActive ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-accent"
                          }`}
                        >
                          <span>{cat.name}</span>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </section>
  );
}

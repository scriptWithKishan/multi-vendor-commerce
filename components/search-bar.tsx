"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, X } from "lucide-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get("search") || "";

  // Derive initial value from URL or user typing
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const query = userQuery ?? searchParamValue;

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    setUserQuery(null);
    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setUserQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="w-full max-w-140 self-center">
      <InputGroup className="w-full">
        <InputGroupInput
          ref={inputRef}
          placeholder="Search products..."
          value={query}
          onChange={(e) => setUserQuery(e.target.value)}
        />
        <InputGroupAddon>
          <button type="submit" className="flex items-center justify-center cursor-pointer">
            <Search className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center p-1 rounded-md hover:bg-muted cursor-pointer"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          ) : (
            <KbdGroup>
              <Kbd>⌘ + K</Kbd>
            </KbdGroup>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
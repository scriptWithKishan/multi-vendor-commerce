import React from "react";
import dbConnect from "@/app/lib/mongodb";
import Category from "@/app/models/Category";
import { CategoriesClient, CategoryItem } from "@/components/categories-client";

export async function Categories() {
  await dbConnect();

  const rawCategories = await Category.find().sort({ name: 1 }).lean();
  const categories: CategoryItem[] = JSON.parse(JSON.stringify(rawCategories));

  if (!categories || categories.length === 0) {
    return null;
  }

  return <CategoriesClient categories={categories} />;
}
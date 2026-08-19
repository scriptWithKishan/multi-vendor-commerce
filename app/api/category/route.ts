import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/mongodb";
import Category from "@/app/models/Category";

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: "Successfully fetched categories",
      categories,
    });
  } catch (err: unknown) {
    console.error("Categories fetch error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch categories";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { name, description } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Category creation error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import User from "@/app/models/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const vendorId = searchParams.get("vendor");
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (vendorId) {
      query.vendor = vendorId;
    }

    if (categoryId) {
      query.category = categoryId;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("vendor", "name email vendorStore")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (err: unknown) {
    console.error("Products fetch error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user || (user.role !== "vendor" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden: Vendor or Admin account required to create products" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      tags,
      category,
      images,
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Valid product name is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Valid product description is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return NextResponse.json(
        { error: "Valid non-negative price is required" },
        { status: 400 }
      );
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
      return NextResponse.json(
        { error: "Valid non-negative stock count is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category reference is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }


    const newProduct = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      price: Number(price),
      salePrice:
        salePrice !== undefined && salePrice !== null && salePrice !== ""
          ? Number(salePrice)
          : undefined,
      stock: Number(stock),
      tags: Array.isArray(tags) ? tags : [],
      vendor: user._id, // Automatically attach authenticated vendor's ID
      category,
      images,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Product creation error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
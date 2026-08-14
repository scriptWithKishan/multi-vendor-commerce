import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopName, shopDescription } = await req.json();

    if (!shopName || !shopDescription) {
      return NextResponse.json(
        { error: "Shop name and shop description are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        role: "vendor",
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Congratulations! Your account has been upgraded to Vendor status.",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: unknown) {
    console.error("Become vendor error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upgrade account to vendor";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

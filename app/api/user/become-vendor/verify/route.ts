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

    const { otp, shopName, shopDescription, phoneNumber, storeAddress } =
      await req.json();

    if (!otp || !shopName || !shopDescription) {
      return NextResponse.json(
        { error: "OTP, shop name, and shop description are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const userEmail = session.user.email.toLowerCase().trim();
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const expectedOtp = String(user.otp?.code || "").trim();
    const receivedOtp = String(otp || "").trim();

    console.log("expected OTP", expectedOtp);

    if (!expectedOtp || expectedOtp !== receivedOtp) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please check your email and try again." },
        { status: 400 }
      );
    }

    if (!user.otp?.expiresAt || new Date(user.otp.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new verification code." },
        { status: 400 }
      );
    }

    const shopSlug = shopName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

    user.role = "vendor";
    user.vendorStore = {
      shopName: shopName.trim(),
      subdomain: shopSlug,
      shopDescription: shopDescription.trim(),
      phoneNumber: phoneNumber?.trim() || "",
      storeAddress: storeAddress?.trim() || "",
    };
    user.otp = undefined; // Clear OTP

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Congratulations! Your account has been upgraded to Vendor status.",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        subdomain: shopSlug,
      },
    });
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

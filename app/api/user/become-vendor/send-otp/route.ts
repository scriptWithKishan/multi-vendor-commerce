import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { sendOtpEmail } from "@/app/lib/mail";

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

    const shopSlug = shopName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

    if (!shopSlug) {
      return NextResponse.json(
        { error: "Please enter a valid shop name with letters or numbers" },
        { status: 400 }
      );
    }

    await dbConnect();

    const userEmail = session.user.email.toLowerCase().trim();

    // Check if another user already claimed this subdomain
    const existingVendor = await User.findOne({
      "vendorStore.subdomain": shopSlug,
      email: { $ne: userEmail },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: `Subdomain '${shopSlug}' is already taken by another store. Please choose a different shop name.` },
        { status: 409 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.otp = {
      code: otpCode,
      expiresAt: expiresAt,
    };

    await user.save();
    console.log("OTP saved for user:", user.email, "Code:", user.otp?.code);

    // Send OTP email via Zoho
    await sendOtpEmail(userEmail, otpCode, shopName);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${userEmail}`,
      shopSlug,
    });
  } catch (error: unknown) {
    console.error("Send OTP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send OTP email";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

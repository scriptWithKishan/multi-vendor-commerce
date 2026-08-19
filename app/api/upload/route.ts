import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files are allowed." },
        { status: 400 }
      );
    }

    // Validate maximum file size limit (5 MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds maximum limit of 5 MB." },
        { status: 400 }
      );
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);

    if (uploadPreset) {
      cloudinaryFormData.append("upload_preset", uploadPreset);
    } else {
      cloudinaryFormData.append("upload_preset", "ml_default");
    }

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      throw new Error(data.error?.message || "Failed to upload image to Cloudinary");
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Upload image (base64 or URL-based for Vercel compatibility)
// For production, integrate with Vercel Blob, Cloudinary, or S3
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, filename } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Gambar wajib diisi" }, { status: 400 });
    }

    // For demo: accept image URLs directly
    // In production, integrate with Vercel Blob:
    // const blob = await put(filename, image, { access: 'public' });
    // return NextResponse.json({ url: blob.url });

    // If it's already a URL, return it
    if (image.startsWith("http")) {
      return NextResponse.json({ url: image });
    }

    // For base64 images, in production you'd upload to a storage service
    // For now, return a placeholder
    return NextResponse.json({
      url: `https://placehold.co/600x400/1e40af/ffffff?text=${encodeURIComponent(filename || "Product")}`,
      message: "Using placeholder. Integrate Vercel Blob for real uploads.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

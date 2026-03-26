import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getPresignedUploadUrl,
  validateFile,
  IMAGE_UPLOAD_OPTIONS,
  EVENT_IMAGE_OPTIONS,
  GALLERY_IMAGE_OPTIONS,
  TEAM_PHOTO_OPTIONS,
  UploadOptions,
} from "@/lib/s3";

// Map of upload categories to options
const UPLOAD_CATEGORIES: Record<string, UploadOptions> = {
  image: IMAGE_UPLOAD_OPTIONS,
  event: EVENT_IMAGE_OPTIONS,
  gallery: GALLERY_IMAGE_OPTIONS,
  team: TEAM_PHOTO_OPTIONS,
};

// POST /api/upload - Get presigned URL for upload
export async function POST(request: Request) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, contentType, size, category = "image" } = body;

    // Validate required fields
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
        { status: 400 }
      );
    }

    // Get upload options for category
    const options = UPLOAD_CATEGORIES[category] || IMAGE_UPLOAD_OPTIONS;

    // Validate file if size is provided
    if (size) {
      const validation = validateFile({ size, type: contentType }, options);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    // Generate presigned URL
    const result = await getPresignedUploadUrl(
      filename,
      contentType,
      user.id,
      options
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating upload URL:", error);
    const message = error instanceof Error ? error.message : "Failed to generate upload URL";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

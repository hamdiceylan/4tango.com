// S3 utilities for file uploads

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 configuration
const s3Config = {
  region: process.env.AWS_REGION || "eu-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "4tango-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL || "";

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface UploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

// Generate a unique key for the file
function generateKey(folder: string, filename: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const sanitizedName = filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric with dash
    .substring(0, 50); // Limit length

  return `${folder}/${userId}/${timestamp}-${random}-${sanitizedName}.${ext}`;
}

// Get the public URL for a file
function getPublicUrl(key: string): string {
  if (CLOUDFRONT_URL) {
    return `${CLOUDFRONT_URL}/${key}`;
  }
  return `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${key}`;
}

// Generate a presigned URL for upload
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  userId: string,
  options: UploadOptions = {}
): Promise<PresignedUploadResult> {
  const {
    folder = "uploads",
    allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
  } = options;

  // Validate content type
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`File type ${contentType} is not allowed`);
  }

  // Generate unique key
  const key = generateKey(folder, filename, userId);

  // Create the command
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Metadata for tracking
    Metadata: {
      "uploaded-by": userId,
      "original-filename": filename,
    },
  });

  // Generate presigned URL (valid for 15 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900, // 15 minutes
  });

  return {
    uploadUrl,
    publicUrl: getPublicUrl(key),
    key,
  };
}

// Delete a file from S3
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

// Extract the key from a public URL
export function getKeyFromUrl(url: string): string | null {
  try {
    // CloudFront URL
    if (CLOUDFRONT_URL && url.startsWith(CLOUDFRONT_URL)) {
      return url.replace(CLOUDFRONT_URL + "/", "");
    }

    // S3 URL
    const s3UrlPattern = new RegExp(
      `https://${BUCKET_NAME}\\.s3\\..*\\.amazonaws\\.com/(.+)`
    );
    const match = url.match(s3UrlPattern);
    if (match) {
      return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

// Validate file before upload
export function validateFile(
  file: { size: number; type: string },
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
  } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}

// Image-specific upload options
export const IMAGE_UPLOAD_OPTIONS: UploadOptions = {
  folder: "images",
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ALLOWED_IMAGE_TYPES,
};

// Event images folder
export const EVENT_IMAGE_OPTIONS: UploadOptions = {
  folder: "events",
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
};

// Gallery images folder
export const GALLERY_IMAGE_OPTIONS: UploadOptions = {
  folder: "gallery",
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
};

// DJ/Team member photos
export const TEAM_PHOTO_OPTIONS: UploadOptions = {
  folder: "team",
  maxSize: 2 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
};

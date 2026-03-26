import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDancerSession } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '4tango-uploads';
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || `https://${BUCKET_NAME}.s3.eu-west-1.amazonaws.com`;

// Get presigned URL for uploading profile picture
export async function POST(request: Request) {
  try {
    const dancerUser = await getDancerSession();

    if (!dancerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentType, fileName } = body;

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Generate unique key for the file
    const ext = fileName?.split('.').pop() || 'jpg';
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `dancers/${dancerUser.id}/profile-${uniqueId}.${ext}`;

    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // Return the presigned URL and the final URL
    const finalUrl = `${CLOUDFRONT_URL}/${key}`;

    return NextResponse.json({
      uploadUrl,
      finalUrl,
      key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}

// Confirm profile picture upload and update database
export async function PATCH(request: Request) {
  try {
    const dancerUser = await getDancerSession();

    if (!dancerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profilePictureUrl } = body;

    if (!profilePictureUrl) {
      return NextResponse.json({ error: 'Profile picture URL is required' }, { status: 400 });
    }

    // Update dancer profile with new picture URL
    const updatedDancer = await prisma.dancer.update({
      where: { id: dancerUser.id },
      data: { profilePictureUrl },
      select: {
        id: true,
        profilePictureUrl: true,
      },
    });

    return NextResponse.json(updatedDancer);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    sesRegion: process.env.SES_REGION || "NOT_SET",
    sesFromEmail: process.env.SES_FROM_EMAIL || "NOT_SET",
    sesAccessKeyId: process.env.SES_ACCESS_KEY_ID ? `${process.env.SES_ACCESS_KEY_ID.substring(0, 4)}...` : "NOT_SET",
    sesSecretAccessKey: process.env.SES_SECRET_ACCESS_KEY ? "SET (hidden)" : "NOT_SET",
    timestamp: new Date().toISOString(),
  });
}

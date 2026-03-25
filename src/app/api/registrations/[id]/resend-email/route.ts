import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail, getRegistrationConfirmationEmailHtml } from "@/lib/email";

// POST /api/registrations/[id]/resend-email - Resend confirmation email
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = await prisma.registration.findFirst({
      where: {
        id: params.id,
        event: { organizerId: user.organizerId }
      },
      include: { event: true }
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Generate confirmation number
    const confirmationNumber = `4T-${registration.event.startAt.getFullYear()}-${registration.id.slice(-6).toUpperCase()}`;

    // Generate registration URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";
    const registrationUrl = `${baseUrl}/registration/${registration.accessToken}`;

    await sendEmail({
      to: registration.emailSnapshot,
      subject: `Registration Confirmed - ${registration.event.title}`,
      html: getRegistrationConfirmationEmailHtml({
        eventTitle: registration.event.title,
        eventDate: registration.event.startAt.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        dancerName: registration.fullNameSnapshot,
        confirmationNumber,
        registrationUrl,
      }),
    });

    // Update email sent timestamp
    await prisma.registration.update({
      where: { id: registration.id },
      data: { emailSentAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resending email:", error);
    return NextResponse.json(
      { error: "Failed to resend email" },
      { status: 500 }
    );
  }
}

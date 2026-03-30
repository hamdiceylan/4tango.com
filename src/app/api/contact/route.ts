import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const CONTACT_EMAIL = "hamdiceylan+4tango@gmail.com";

const subjectLabels: Record<string, string> = {
  general: "General Inquiry",
  organizer: "Event Organizer Inquiry",
  support: "Technical Support",
  billing: "Billing Question",
  partnership: "Partnership Opportunity",
};

function getContactEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px; color: #18181b; font-size: 24px; font-weight: 600;">New Contact Form Submission</h1>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px; color: #52525b; font-size: 14px;">
                  <strong style="color: #18181b;">From:</strong><br>
                  ${params.name} &lt;${params.email}&gt;
                </p>
                <p style="margin: 0; color: #52525b; font-size: 14px;">
                  <strong style="color: #18181b;">Subject:</strong><br>
                  ${subjectLabels[params.subject] || params.subject}
                </p>
              </div>

              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #18181b; font-size: 14px; font-weight: 600;">Message:</p>
                <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px;">
                  <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${params.message}</p>
                </div>
              </div>

              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                Reply directly to this email to respond to ${params.name}.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          4Tango Contact Form
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send email
    const subjectLine = `[4Tango Contact] ${subjectLabels[subject] || "General Inquiry"} from ${name}`;

    await sendEmail({
      to: CONTACT_EMAIL,
      subject: subjectLine,
      html: getContactEmailHtml({ name, email, subject, message }),
      text: `New contact form submission\n\nFrom: ${name} <${email}>\nSubject: ${subjectLabels[subject] || subject}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.SES_REGION || "eu-west-1",
  credentials: process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  } : undefined,
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@4tango.com";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
        ...(text && {
          Text: {
            Data: text,
            Charset: "UTF-8",
          },
        }),
      },
    },
  });

  try {
    const result = await ses.send(command);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function getMagicLinkEmailHtml(loginUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to 4Tango</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 24px; color: #18181b; font-size: 24px; font-weight: 600;">Sign in to 4Tango</h1>
              <p style="margin: 0 0 32px; color: #52525b; font-size: 16px; line-height: 24px;">
                Click the button below to sign in to your account. This link will expire in 15 minutes.
              </p>
              <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Sign In
              </a>
              <p style="margin: 32px 0 0; color: #a1a1aa; font-size: 14px; line-height: 20px;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          © 2026 4Tango. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function getRegistrationConfirmationEmailHtml(params: {
  eventTitle: string;
  eventDate: string;
  dancerName: string;
  confirmationNumber: string;
  registrationUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - ${params.eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Registration Confirmed!</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                ${params.eventTitle}
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Name:</strong> ${params.dancerName}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Event Date:</strong> ${params.eventDate}
                </p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Confirmation #:</strong> ${params.confirmationNumber}
                </p>
              </div>

              <a href="${params.registrationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Registration
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          © 2026 4Tango. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

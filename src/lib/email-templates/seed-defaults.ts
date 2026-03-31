import prisma from "@/lib/prisma";

interface DefaultTemplateData {
  name: string;
  subject: string;
  htmlContent: string;
  variables: { name: string; description: string }[];
}

const defaultTemplates: DefaultTemplateData[] = [
  {
    name: "Registration Confirmation",
    subject: "You're Registered! - {{eventTitle}}",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Registration Confirmed!</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Welcome to {{eventTitle}}
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Name:</strong> {{dancerName}}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Role:</strong> {{dancerRole}}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Location:</strong> {{eventLocation}}
                </p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Confirmation:</strong> {{confirmationNumber}}
                </p>
              </div>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px;">
                We're excited to have you join us! You can view your registration details and make any updates using the link below.
              </p>

              <a href="{{registrationUrl}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Registration
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { name: "dancerName", description: "Dancer's full name" },
      { name: "dancerRole", description: "Dance role (leader/follower)" },
      { name: "eventTitle", description: "Event name" },
      { name: "eventLocation", description: "Event city and country" },
      { name: "confirmationNumber", description: "Registration confirmation number" },
      { name: "registrationUrl", description: "Link to view registration" },
    ],
  },
  {
    name: "Payment Reminder",
    subject: "Payment Reminder - {{eventTitle}}",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">💳</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Payment Reminder</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Hi {{dancerName}}, this is a friendly reminder about your registration for {{eventTitle}}.
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">Amount Due</p>
                <p style="margin: 0; color: #18181b; font-size: 28px; font-weight: 700;">{{paymentAmount}}</p>
              </div>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px;">
                Please complete your payment to secure your spot. Spaces are limited and fill up quickly!
              </p>

              <a href="{{paymentLink}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Complete Payment
              </a>

              <p style="margin: 24px 0 0; color: #a1a1aa; font-size: 14px;">
                Questions? Simply reply to this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { name: "dancerName", description: "Dancer's full name" },
      { name: "eventTitle", description: "Event name" },
      { name: "paymentAmount", description: "Amount due with currency" },
      { name: "paymentLink", description: "Link to complete payment" },
    ],
  },
  {
    name: "Event Reminder",
    subject: "See You Soon! - {{eventTitle}} Starts This Week",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">🎉</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">The Event is Almost Here!</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Hi {{dancerName}}, we can't wait to see you at {{eventTitle}}!
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">📍 Location:</strong> {{eventLocation}}
                </p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">🎫 Your Role:</strong> {{dancerRole}}
                </p>
              </div>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px;">
                Here are a few things to remember:
              </p>

              <div style="text-align: left; margin-bottom: 24px; color: #52525b; font-size: 14px;">
                <p style="margin: 0 0 8px;">✓ Bring comfortable dance shoes</p>
                <p style="margin: 0 0 8px;">✓ Arrive 15 minutes early for check-in</p>
                <p style="margin: 0 0 8px;">✓ Bring your confirmation email or ID</p>
              </div>

              <a href="{{registrationUrl}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Details
              </a>

              <p style="margin: 24px 0 0; color: #52525b; font-size: 14px;">
                See you on the dance floor! 💃🕺
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { name: "dancerName", description: "Dancer's full name" },
      { name: "dancerRole", description: "Dance role (leader/follower)" },
      { name: "eventTitle", description: "Event name" },
      { name: "eventLocation", description: "Event city and country" },
      { name: "registrationUrl", description: "Link to view registration" },
    ],
  },
  {
    name: "Waitlist Notification",
    subject: "You're on the Waitlist - {{eventTitle}}",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #fed7aa; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">⏳</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">You're on the Waitlist</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Hi {{dancerName}}, thank you for your interest in {{eventTitle}}!
              </p>

              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  The event is currently at full capacity. We've added you to our waitlist and will notify you immediately if a spot becomes available.
                </p>
              </div>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px;">
                We process the waitlist on a first-come, first-served basis. If a spot opens up, you'll receive an email with payment instructions.
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px;">
                In the meantime, you can check your waitlist status:
              </p>

              <a href="{{registrationUrl}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Check Status
              </a>

              <p style="margin: 24px 0 0; color: #a1a1aa; font-size: 14px;">
                Thank you for your patience!
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { name: "dancerName", description: "Dancer's full name" },
      { name: "eventTitle", description: "Event name" },
      { name: "registrationUrl", description: "Link to view registration" },
    ],
  },
  {
    name: "Thank You - Post Event",
    subject: "Thank You for Joining Us at {{eventTitle}}!",
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #fce7f3; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">❤️</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Thank You!</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Hi {{dancerName}}, it was wonderful having you at {{eventTitle}}!
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
                We hope you had an amazing time on the dance floor and made some wonderful connections. Events like this are only possible because of passionate dancers like you.
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; color: #18181b; font-size: 16px; font-weight: 600;">
                  We'd love to hear from you!
                </p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  Your feedback helps us make future events even better.
                </p>
              </div>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px;">
                Stay connected for updates on our upcoming events. We hope to see you again soon!
              </p>

              <p style="margin: 0; color: #52525b; font-size: 14px;">
                With gratitude,<br>
                <strong>{{organizerName}}</strong>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    variables: [
      { name: "dancerName", description: "Dancer's full name" },
      { name: "eventTitle", description: "Event name" },
      { name: "organizerName", description: "Organizer's name" },
    ],
  },
];

/**
 * Seeds default email templates for an organizer.
 * Skips templates that already exist (by name).
 */
export async function seedDefaultTemplates(organizerId: string): Promise<number> {
  let created = 0;

  for (const template of defaultTemplates) {
    // Check if template already exists
    const existing = await prisma.emailTemplate.findFirst({
      where: {
        organizerId,
        name: template.name,
      },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          organizerId,
          name: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          variables: template.variables,
          isActive: true,
        },
      });
      created++;
    }
  }

  return created;
}

/**
 * Get the list of default template names
 */
export function getDefaultTemplateNames(): string[] {
  return defaultTemplates.map((t) => t.name);
}

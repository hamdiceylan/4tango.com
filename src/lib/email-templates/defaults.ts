import { EmailType } from "@prisma/client";

interface DefaultTemplate {
  subject: string;
  htmlContent: string;
}

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  .container { max-width: 500px; margin: 0 auto; }
  .card { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
  .header { text-align: center; padding: 40px 40px 20px; }
  .content { padding: 0 40px 40px; }
  .footer { text-align: center; padding: 24px; color: #71717a; font-size: 12px; }
  .btn { display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; }
  .btn:hover { background-color: #e11d48; }
  .info-box { background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin: 24px 0; }
  .info-row { margin-bottom: 12px; }
  .info-row:last-child { margin-bottom: 0; }
  .label { color: #71717a; font-size: 14px; }
  .value { color: #18181b; font-weight: 500; }
  h1 { margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600; }
  p { margin: 0; color: #52525b; font-size: 16px; line-height: 24px; }
  .icon-success { width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
  .icon-warning { width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
  .icon-info { width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
`;

const wrapTemplate = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        ${content}
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const registrationConfirmationTemplate: DefaultTemplate = {
  subject: "Registration Confirmed - {{eventTitle}}",
  htmlContent: wrapTemplate(`
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">&#10003;</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Registration Confirmed!</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                {{eventTitle}}
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Name:</strong> {{dancerName}}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Role:</strong> {{dancerRole}}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Event Date:</strong> {{eventDates}}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Location:</strong> {{eventLocation}}
                </p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Confirmation #:</strong> {{confirmationNumber}}
                </p>
              </div>

              <a href="{{registrationUrl}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Registration
              </a>
            </td>
          </tr>
        </table>
  `),
};

const organizerNotificationTemplate: DefaultTemplate = {
  subject: "New Registration for {{eventTitle}}",
  htmlContent: wrapTemplate(`
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">&#128100;</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">New Registration</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                {{eventTitle}}
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Name:</strong> {{dancerName}}
                </p>
                <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Email:</strong> {{dancerEmail}}
                </p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  <strong style="color: #18181b;">Role:</strong> {{dancerRole}}
                </p>
              </div>

              <p style="margin: 0; color: #71717a; font-size: 14px;">
                Log in to your dashboard to manage this registration.
              </p>
            </td>
          </tr>
        </table>
  `),
};

const paymentReminderTemplate: DefaultTemplate = {
  subject: "Payment Reminder - {{eventTitle}}",
  htmlContent: wrapTemplate(`
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">&#128176;</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Payment Reminder</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Hi {{dancerName}}, this is a reminder to complete your payment for {{eventTitle}}.
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">Amount Due</p>
                <p style="margin: 0; color: #18181b; font-size: 28px; font-weight: 700;">{{paymentAmount}}</p>
              </div>

              {{customMessage}}

              <a href="{{paymentLink}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                Complete Payment
              </a>

              <p style="margin: 24px 0 0; color: #a1a1aa; font-size: 14px;">
                If you have any questions, please contact the event organizer.
              </p>
            </td>
          </tr>
        </table>
  `),
};

const statusUpdateTemplate: DefaultTemplate = {
  subject: "Registration Update - {{eventTitle}}",
  htmlContent: wrapTemplate(`
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; margin: 0 auto 24px; line-height: 64px;">
                <span style="font-size: 32px;">&#128221;</span>
              </div>
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px; font-weight: 600;">Registration Update</h1>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px;">
                Hi {{dancerName}}, your registration status for {{eventTitle}} has been updated.
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">New Status</p>
                <p style="margin: 0; color: #18181b; font-size: 20px; font-weight: 600;">{{registrationStatus}}</p>
              </div>

              {{customMessage}}

              <a href="{{registrationUrl}}" style="display: inline-block; padding: 14px 32px; background-color: #f43f5e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                View Registration
              </a>
            </td>
          </tr>
        </table>
  `),
};

const customEmailTemplate: DefaultTemplate = {
  subject: "{{eventTitle}} - Important Information",
  htmlContent: wrapTemplate(`
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px; color: #18181b; font-size: 24px; font-weight: 600; text-align: center;">{{eventTitle}}</h1>

              <div style="color: #52525b; font-size: 16px; line-height: 24px;">
                {{customMessage}}
              </div>

              <p style="margin: 32px 0 0; color: #a1a1aa; font-size: 14px; text-align: center;">
                If you have any questions, please contact the event organizer.
              </p>
            </td>
          </tr>
        </table>
  `),
};

export function getDefaultTemplate(emailType: EmailType): DefaultTemplate {
  switch (emailType) {
    case "REGISTRATION_CONFIRMATION":
      return registrationConfirmationTemplate;
    case "ORGANIZER_NOTIFICATION":
      return organizerNotificationTemplate;
    case "PAYMENT_REMINDER":
      return paymentReminderTemplate;
    case "STATUS_UPDATE":
      return statusUpdateTemplate;
    case "CUSTOM":
    default:
      return customEmailTemplate;
  }
}

// Available template variables for each email type
export const templateVariables: Record<EmailType, { name: string; description: string }[]> = {
  REGISTRATION_CONFIRMATION: [
    { name: "dancerName", description: "Full name of the dancer" },
    { name: "dancerEmail", description: "Email address of the dancer" },
    { name: "dancerRole", description: "Dance role (leader/follower/switch)" },
    { name: "eventTitle", description: "Title of the event" },
    { name: "eventDates", description: "Event date range" },
    { name: "eventLocation", description: "Event location (city, country)" },
    { name: "confirmationNumber", description: "Registration confirmation number" },
    { name: "registrationUrl", description: "Link to view registration" },
  ],
  ORGANIZER_NOTIFICATION: [
    { name: "dancerName", description: "Full name of the dancer" },
    { name: "dancerEmail", description: "Email address of the dancer" },
    { name: "dancerRole", description: "Dance role (leader/follower/switch)" },
    { name: "eventTitle", description: "Title of the event" },
    { name: "organizerName", description: "Name of the organizer" },
  ],
  PAYMENT_REMINDER: [
    { name: "dancerName", description: "Full name of the dancer" },
    { name: "eventTitle", description: "Title of the event" },
    { name: "paymentAmount", description: "Amount due with currency" },
    { name: "paymentLink", description: "Link to complete payment" },
    { name: "customMessage", description: "Custom message from organizer" },
  ],
  STATUS_UPDATE: [
    { name: "dancerName", description: "Full name of the dancer" },
    { name: "eventTitle", description: "Title of the event" },
    { name: "registrationStatus", description: "New registration status" },
    { name: "registrationUrl", description: "Link to view registration" },
    { name: "customMessage", description: "Custom message from organizer" },
  ],
  CUSTOM: [
    { name: "dancerName", description: "Full name of the dancer" },
    { name: "eventTitle", description: "Title of the event" },
    { name: "customMessage", description: "Custom message content" },
  ],
};

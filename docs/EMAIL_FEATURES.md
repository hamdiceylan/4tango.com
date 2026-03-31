# Email Module Documentation

## Overview

The 4Tango Email Module provides comprehensive email functionality for tango event organizers, including manual email sending, automatic transactional emails, template management, and delivery tracking.

---

## Features

### 1. Email Sending

#### Manual Emails
Send emails to individual registrations from the registration detail page:
- **Custom messages**: Write subject and body directly
- **Template-based**: Select from saved templates
- **Variable substitution**: Automatic replacement of placeholders like `{{dancerName}}`

#### Automatic Transactional Emails
Triggered automatically on registration:
- **Dancer confirmation**: Sent to the dancer after successful registration
- **Organizer notification**: Sent to the event organizer about new registration

#### Registration Actions
Available actions on each registration:
- **Send Email**: Custom email with optional template selection
- **Send Payment Reminder**: Quick action using payment reminder template

### 2. Email Templates

#### Default Templates
Five built-in templates available via "Add Default Templates" button:

| Template | Purpose |
|----------|---------|
| Registration Confirmation | Sent after successful registration |
| Payment Reminder | Request for outstanding payment |
| Event Reminder | Reminder before event starts |
| Waitlist Notification | Notify when spot becomes available |
| Thank You - Post Event | Follow-up after event ends |

#### Template Variables
Available placeholders for dynamic content:

| Variable | Description |
|----------|-------------|
| `{{dancerName}}` | Full name of the dancer |
| `{{dancerEmail}}` | Email address of the dancer |
| `{{dancerRole}}` | Role (leader/follower/both) |
| `{{eventTitle}}` | Name of the event |
| `{{eventCity}}` | Event city |
| `{{eventCountry}}` | Event country |
| `{{eventLocation}}` | City, Country format |
| `{{registrationStatus}}` | Current registration status |
| `{{paymentStatus}}` | Current payment status |
| `{{confirmationNumber}}` | Unique registration reference |
| `{{registrationUrl}}` | Link to registration details |
| `{{customMessage}}` | Custom text from organizer |

#### Managing Templates
- **Location**: Settings > Email Templates
- **Actions**: Create, edit, activate/deactivate, delete
- **Scope**: Organization-wide or event-specific

### 3. Email Tracking

#### Delivery Status
Track email lifecycle through these statuses:

| Status | Description |
|--------|-------------|
| `QUEUED` | Email created, waiting to send |
| `SENT` | Successfully sent to SES |
| `DELIVERED` | Confirmed delivery (future: SES webhooks) |
| `OPENED` | Recipient opened the email |
| `CLICKED` | Recipient clicked a link |
| `BOUNCED` | Email bounced |
| `FAILED` | Failed to send |

#### Open Tracking
- 1x1 transparent pixel embedded in email HTML
- Updates status to "OPENED" when pixel loads
- Endpoint: `/api/track/open/[trackingId]`

#### Click Tracking
- Links rewritten to track clicks
- Records click timestamp, redirects to original URL
- Endpoint: `/api/track/click/[trackingId]`

### 4. Email History UI

#### Dashboard Location
`/emails` - Main email history page

#### Features
- **List view**: All sent emails with status badges
- **Filters**: Event, status, date range, email type
- **Pagination**: Navigate through large email lists
- **Detail modal**: Click to view full email content
- **Resend**: Re-send failed or older emails

#### Tabs
1. **History**: All sent emails
2. **Templates**: Manage email templates

### 5. Registration Integration

#### Emails Tab
On each registration detail page (`/registrations/dancer/[id]`):
- View all emails sent to this registration
- Timeline with status progression
- Quick resend capability

#### Template Selector
When using "Send Email" action:
- Dropdown shows available templates
- Templates filtered by organization and event
- "No template" option for custom messages

---

## Technical Details

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/emails` | GET | List emails with filters |
| `/api/emails` | POST | Send email to registration |
| `/api/emails/[id]` | GET | Get email details |
| `/api/emails/[id]` | POST | Resend email |
| `/api/emails/preview` | POST | Preview template with variables |
| `/api/email-templates/seed-defaults` | POST | Create default templates |
| `/api/track/open/[trackingId]` | GET | Track email open |
| `/api/track/click/[trackingId]` | GET | Track link click |

### Database Models

#### EmailEvent
Stores all email records with tracking data:
```prisma
model EmailEvent {
  id               String       @id
  organizerId      String
  eventId          String?
  registrationId   String?
  messageId        String?      // SES Message ID
  trackingId       String       // Unique tracking identifier
  emailType        EmailType    // REGISTRATION_CONFIRMATION, PAYMENT_REMINDER, etc.
  templateId       String?
  recipientEmail   String
  recipientName    String?
  subject          String
  htmlContent      String
  status           EmailStatus  // QUEUED, SENT, DELIVERED, OPENED, etc.
  sentAt           DateTime?
  deliveredAt      DateTime?
  openedAt         DateTime?
  clickedAt        DateTime?
  bouncedAt        DateTime?
  errorMessage     String?
  bounceType       String?
}
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/email-service.ts` | Main email service with SES integration |
| `src/lib/email-templates/defaults.ts` | Default HTML templates |
| `src/lib/email-templates/seed-defaults.ts` | Seed function for default templates |
| `src/app/(dashboard)/emails/page.tsx` | Email history UI |
| `src/app/api/emails/route.ts` | Email list/send API |
| `src/app/api/track/open/[trackingId]/route.ts` | Open tracking |
| `src/app/api/track/click/[trackingId]/route.ts` | Click tracking |

---

## Configuration

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `SES_REGION` | AWS SES region (eu-west-1) |
| `SES_FROM_EMAIL` | Sender email (noreply@4tango.com) |
| `SES_ACCESS_KEY_ID` | IAM user access key |
| `SES_SECRET_ACCESS_KEY` | IAM user secret key |
| `NEXT_PUBLIC_URL` | Public URL for tracking links |

### AWS SES Setup
- Domain verified: 4tango.com
- IAM user: 4tango-ses-sender
- Region: eu-west-1

---

## Future Enhancements

### SES Webhooks (Phase 7)
Real-time delivery/bounce tracking:
- AWS SNS topic for SES notifications
- Webhook endpoint for processing events
- Automatic status updates on delivery/bounce

### Reply System (Phase 8)
Allow dancers to reply to emails:
- Unique reply-to addresses
- SES receiving rules
- Support thread management

### Bulk Email Sending
Send emails to multiple registrations:
- Selection from registration list
- Rate limiting for SES compliance
- Progress tracking

---

## Troubleshooting

### Email Not Sending
1. Check SES credentials in environment variables
2. Verify domain is verified in SES console
3. Check SES sending quotas
4. Review CloudWatch logs for errors

### Tracking Not Working
1. Tracking only works with public URLs (not localhost)
2. Some email clients block tracking pixels
3. Check trackingId is correctly embedded in email

### Templates Not Appearing
1. Ensure templates are marked as active
2. Check template is scoped to correct organizer/event
3. Verify template was created successfully

---

## Testing Checklist

- [ ] Send manual email from registration page
- [ ] Verify email appears in Email History
- [ ] Check tracking pixel updates status to "Opened"
- [ ] Register new dancer, verify confirmation email sent
- [ ] Verify organizer receives notification email
- [ ] Filter email history by event, status
- [ ] View email content in detail modal
- [ ] Resend email from history
- [ ] Create and use custom template
- [ ] Seed default templates and verify they appear

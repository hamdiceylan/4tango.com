# 4Tango Dashboard — Manual Testing Checklist

## 1. Dashboard Overview (`/dashboard`)
- [ ] Stats cards show correct counts (total, leaders, followers, confirmed, waitlist, paid, unpaid)
- [ ] Pie charts render for role distribution, status breakdown, payment breakdown
- [ ] Country distribution displays correctly
- [ ] Recent Registrations section shows last 5 with status badges
- [ ] Recent Transfers section shows last 5 with Pending/Confirmed badges
- [ ] Recent Activity section shows last 5 log entries
- [ ] "View all" links navigate to correct pages
- [ ] Quick Actions links work (Page Builder, Registrations, Event Page)
- [ ] Switching events in sidebar updates all dashboard data

## 2. Registrations (`/registrations`)
- [ ] Table loads with all registrations for selected event
- [ ] **Search**: Filter by name, filter by email
- [ ] **Status filter**: Test each status (Registered, Confirmed, Waitlist, Rejected, Cancelled, Checked In)
- [ ] **Payment filter**: Test Paid, Unpaid, Pending
- [ ] **Role filter**: Leaders only, Followers only
- [ ] **Clear filters** button resets all
- [ ] **Column customization**: Open Cols dialog, toggle columns on/off, reorder, save
- [ ] **Custom field columns**: Form field values show as columns (phone, roommate, etc.)
- [ ] **Comments column**: Enable and verify dancer comments appear
- [ ] **Per-row actions (⋮ menu)**:
  - [ ] On REGISTERED: Approve → changes to Confirmed
  - [ ] On REGISTERED: Reject → changes to Rejected
  - [ ] On REGISTERED: Waitlist → changes to Waitlist
  - [ ] On REGISTERED: Cancel → changes to Cancelled
  - [ ] On CONFIRMED: Check In → changes to Checked In
  - [ ] On CONFIRMED: Cancel → changes to Cancelled
  - [ ] On WAITLIST: Approve → changes to Confirmed
  - [ ] Mark Paid → payment changes to Paid
  - [ ] Mark Partially Paid → payment changes to Partially Paid
  - [ ] Send Email → compose and send custom email
- [ ] **Bulk actions**: Select multiple rows via checkboxes
  - [ ] Bulk Approve
  - [ ] Bulk Reject
  - [ ] Bulk Send Email
- [ ] **Pagination**: Navigate between pages (if >25 registrations)
- [ ] Stats bar updates after actions

## 3. Dancer Detail (`/registrations/dancer/[id]`)
- [ ] **Overview tab**: Name, email, phone, location, role displayed
- [ ] **Registrations tab**: Lists all events, click row to expand custom field values
- [ ] Expanded view shows all custom fields with correct labels
- [ ] Boolean values show Yes/No
- [ ] **Notes tab**: Add a new note
- [ ] Edit an existing note
- [ ] Delete a note
- [ ] **Emails tab**: Shows email history for this dancer
- [ ] Resend an email from history
- [ ] **Tags**: Assign a tag to dancer
- [ ] Create a new tag with custom color
- [ ] Remove a tag from dancer
- [ ] Back to Registrations link works

## 4. Transfers (`/transfers`)
- [ ] Table loads with all transfer requests
- [ ] Name, Email, Phone, Status, custom field values, date all display
- [ ] **Search**: Filter by name or email
- [ ] **Status filter**: Pending, Confirmed, Cancelled
- [ ] **Confirm action**: Click Confirm on PENDING → status changes to CONFIRMED
- [ ] **Cancel action**: Click Cancel → status changes to CANCELLED
- [ ] Stats update after actions (Total, Pending, Confirmed, Cancelled)

## 5. Form Builder (`/events/[id]/form-builder`)
- [ ] Default mandatory fields visible (First Name, Last Name, Email, Role, Country) with lock icon
- [ ] Custom fields listed below defaults
- [ ] **Add field**: Click +, select field type, field appears in list
- [ ] **Edit field**: Click field → editor opens with Basic tab
- [ ] Change label, placeholder, help text
- [ ] Toggle required on/off
- [ ] **Translations tab**: Edit labels in all 7 languages (en, es, de, fr, it, pl, tr)
- [ ] **Validation tab**: Set min/max, pattern, length constraints
- [ ] **Conditional tab**: Set "show when" condition on another field
- [ ] **Options editor** (for SELECT/RADIO): Add/edit/delete options
- [ ] **Drag-to-reorder** custom fields
- [ ] **Delete** a custom field (with confirmation)
- [ ] **Save Changes** → saves ALL fields (not just selected)
- [ ] **Live Preview** toggle shows form preview
- [ ] **Open Form** link opens public registration form in new tab

## 6. Transfer Builder (`/events/[id]/transfer-builder`)
- [ ] Default fields visible (First Name, Last Name, Email, Phone) with lock icon
- [ ] Custom transfer fields listed (airport transfer, flight details)
- [ ] Add new field, edit, delete, reorder — all same as Form Builder
- [ ] Translations tab works for transfer fields
- [ ] Conditional logic works (flight fields depend on airport_transfer)
- [ ] Save Changes persists all modifications
- [ ] Open Transfer Form link works

## 7. Page Builder (`/events/[id]/page-builder`)
- [ ] Add section (Hero, About, Schedule, DJ Team, Accommodation, Gallery, Pricing, Contact, Custom Text)
- [ ] Edit section content (text, images, links)
- [ ] Reorder sections via drag-and-drop
- [ ] Toggle section visibility on/off
- [ ] Delete a section
- [ ] Image upload works (logo, cover, gallery images)
- [ ] Preview shows live changes
- [ ] Color scheme editor (primary, secondary, dark colors)
- [ ] Language settings (add/remove languages)

## 8. Event Settings (`/events/[id]/edit`)
- [ ] Edit event title, description, short description
- [ ] Upload/change logo and cover image
- [ ] Edit location (city, country, venue, address)
- [ ] Edit dates (start, end, with time)
- [ ] Set registration opens/closes dates
- [ ] Edit pricing (currency, price, capacity)
- [ ] Set contact email for notifications
- [ ] Change status: Draft → Published → Closed
- [ ] DJs/Artists field (comma-separated)
- [ ] Save Changes persists all fields
- [ ] Packages management (add/edit/delete packages with name, description, price, capacity)

## 9. Emails (`/emails`)
- [ ] **History tab**: Email list loads with pagination
- [ ] Filter by status (Sent, Delivered, Opened, Clicked, Bounced, Failed)
- [ ] Filter by type (Registration, Notification, Payment, Custom)
- [ ] Click email row → detail modal with HTML preview
- [ ] Resend email from detail modal
- [ ] Pagination works (Previous/Next when >25 emails)
- [ ] **Templates tab**: List all templates
- [ ] Seed default templates (if none exist)
- [ ] Preview a template
- [ ] Edit template (name, subject, HTML content)
- [ ] Create new template
- [ ] Delete template

## 10. Settings
- [ ] **Account** (`/settings`): Edit name, email, org name
- [ ] **Team** (`/settings/team`): View members, invite new member, change role, remove member
- [ ] Invitation flow: Send invite → check email → accept
- [ ] **Email Templates** (`/settings/email-templates`): Same as Emails > Templates tab
- [ ] **Activity Log** (`/settings/activity-log`): View logs, filter by category/actor/event/date

## 11. Public Forms (Dancer-facing)
- [ ] **Registration**: `/en/sol-de-invierno/register` — fill all fields, submit, receive emails (dancer + organizer)
- [ ] **Transfer**: `/en/sol-de-invierno/transfer` — fill all fields, submit, see success message
- [ ] **Language switching**: Change language on both forms, verify i18n labels
- [ ] **Confirmation page**: `/registration/[token]` — shows event logo, status badges, dancer details
- [ ] **Dancer portal**: `/dancer/login` → magic link → edit registration

## 12. Dancer Portal
- [ ] Enter email at `/dancer/login` → receive magic link email
- [ ] Click link → redirected to edit page (single registration) or list (multiple)
- [ ] Edit custom fields → save → verify changes in dashboard
- [ ] Locked fields show lock icon when CONFIRMED
- [ ] Logout works

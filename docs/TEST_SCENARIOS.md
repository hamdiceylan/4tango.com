# 4Tango Test Scenarios

> **Last Updated**: 2026-03-27
> **Purpose**: Comprehensive test scenarios for manual and automated testing
> **Maintainer**: Keep this file updated when adding/removing features (see CLAUDE.md)

---

## Table of Contents

1. [Organizer Features](#organizer-features)
   - [Authentication](#1-organizer-authentication)
   - [Dashboard](#2-dashboard)
   - [Event Management](#3-event-management)
   - [Page Builder](#4-page-builder)
   - [Form Builder](#5-form-builder)
   - [Registration Management](#6-registration-management)
   - [Registration Actions](#7-registration-actions)
   - [Payment Management](#8-payment-management)
   - [Team Management](#9-team-management)
   - [Email Templates](#10-email-templates)
   - [Settings](#11-settings)
   - [Activity Log](#12-activity-log)
   - [Dancer Notes & Tags](#13-dancer-notes--tags)
2. [Dancer Features](#dancer-features)
   - [Authentication](#14-dancer-authentication)
   - [Profile Management](#15-dancer-profile-management)
   - [Event Discovery & Registration](#16-event-discovery--registration)
   - [Registration Management](#17-dancer-registration-management)
3. [Public/Guest Features](#publicguest-features)
4. [API Health & Infrastructure](#api-health--infrastructure)
5. [Cross-Feature Scenarios](#cross-feature-scenarios)

---

## Test Environment URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| Dev | https://dev.4tango.com | Testing & QA |
| Prod | https://4tango.com | Production |
| Local | http://localhost:3000 | Development |

---

## Organizer Features

### 1. Organizer Authentication

**Files**: `/src/app/(auth)/*`, `/src/app/api/auth/*`

#### ORG-AUTH-001: Signup with Email/Password
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/signup` | Signup form displayed |
| 2 | Enter email, full name, password, organization name | Fields accept input |
| 3 | Enter password < 8 chars | Error: "Password must be at least 8 characters" |
| 4 | Enter password without uppercase | Error: "Password must contain uppercase letter" |
| 5 | Enter password without lowercase | Error: "Password must contain lowercase letter" |
| 6 | Enter password without number | Error: "Password must contain a number" |
| 7 | Enter valid password (8+ chars, upper, lower, number) | Password accepted |
| 8 | Submit form | Redirect to email verification page |
| 9 | Check email | 6-digit verification code received |

#### ORG-AUTH-002: Email Verification
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter wrong code | Error: "Invalid verification code" |
| 2 | Enter correct 6-digit code | Account verified, redirect to onboarding |
| 3 | Click "Resend code" | New code sent, success message shown |
| 4 | Use expired code (after new one sent) | Error: "Invalid verification code" |

#### ORG-AUTH-003: Login with Email/Password
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login form displayed |
| 2 | Enter registered email + correct password | Logged in, redirect to dashboard |
| 3 | Enter wrong password | Error: "Invalid email or password" |
| 4 | Enter unregistered email | Error: "Invalid email or password" |
| 5 | Enter unverified account credentials | Error: "Please verify your email first" |

#### ORG-AUTH-004: Magic Link Login
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On login page, click "Sign in with magic link" | Magic link form displayed |
| 2 | Enter registered email | Success: "Check your email" |
| 3 | Click link in email within 15 minutes | Logged in successfully |
| 4 | Click same link again | Error: "Link already used" |
| 5 | Click link after 15 minutes | Error: "Link expired" |
| 6 | Enter unregistered email | Error: "No account found with this email" |

#### ORG-AUTH-005: Logout
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | While logged in, click logout | Session ended, redirect to login |
| 2 | Try to access `/dashboard` | Redirect to login page |
| 3 | Browser back button after logout | Still on login page (no session) |

#### ORG-AUTH-006: Session Persistence
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login and close browser | - |
| 2 | Reopen browser and navigate to `/dashboard` | Still logged in (30-day session) |
| 3 | Wait 30+ days and access dashboard | Session expired, redirect to login |

---

### 2. Dashboard

**Files**: `/src/app/(dashboard)/dashboard/page.tsx`

#### ORG-DASH-001: Dashboard Overview
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` after login | Dashboard loads with stats |
| 2 | Verify stats cards | Shows: Total Events, Total Registrations, Total Revenue, Unique Dancers |
| 3 | Verify events list | All user's events displayed with status badges |
| 4 | Check event card info | Shows: title, dates, location, registration count, capacity bar |

#### ORG-DASH-002: Dashboard with No Data
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | New account with no events | Stats show 0 for all metrics |
| 2 | Events list | Shows "No events yet" message with "Create Event" button |

#### ORG-DASH-003: Quick Actions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Create Event" | Navigate to `/events/new` |
| 2 | Click on an event card | Navigate to event details page |
| 3 | Click "View Registrations" | Navigate to registrations page |

---

### 3. Event Management

**Files**: `/src/app/(dashboard)/events/*`, `/src/app/api/events/*`

#### ORG-EVENT-001: Create New Event
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/events/new` | Event creation form displayed |
| 2 | Fill required fields: title, dates, location | Fields accept input |
| 3 | Leave title empty and submit | Error: "Title is required" |
| 4 | Enter title | Slug auto-generated from title |
| 5 | Enter duplicate slug | Slug gets numeric suffix (e.g., "event-2") |
| 6 | Set start date after end date | Error: "End date must be after start date" |
| 7 | Fill all fields and submit | Event created, redirect to event page |

#### ORG-EVENT-002: Edit Event
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to existing event's edit page | Edit form pre-filled with event data |
| 2 | Modify title | Title updated |
| 3 | Clear required field and save | Error shown for required field |
| 4 | Save valid changes | Event updated, success message |

#### ORG-EVENT-003: Event Status Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create new event | Status is "DRAFT" |
| 2 | Publish event | Status changes to "PUBLISHED" |
| 3 | Close event | Status changes to "CLOSED" |
| 4 | Cancel event | Status changes to "CANCELLED" |
| 5 | Access DRAFT event public URL | 404 or "Event not available" message |
| 6 | Access PUBLISHED event public URL | Event page displayed |

#### ORG-EVENT-004: Event Capacity
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set capacity to 50 | Capacity saved |
| 2 | Register 50 dancers | Registration count shows 50/50 |
| 3 | Try to register 51st dancer | Error: "Event is full" or waitlist option |

#### ORG-EVENT-005: Delete Event
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click delete on event with registrations | Confirmation dialog with warning |
| 2 | Confirm deletion | Event deleted, registrations removed |
| 3 | Try to access deleted event URL | 404 error |

---

### 4. Page Builder

**Files**: `/src/app/(dashboard)/events/[id]/page-builder/*`, `/src/app/api/events/[id]/sections/*`

#### ORG-PAGE-001: Add Page Sections
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to event page builder | Page builder UI displayed |
| 2 | Click "Add Section" | Section type selector shown |
| 3 | Select "Hero" section | Hero section added with default content |
| 4 | Add About, Schedule, Pricing sections | Sections appear in order |

#### ORG-PAGE-002: Edit Section Content
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click on Hero section | Editor panel opens |
| 2 | Edit title, subtitle, background image | Changes reflect in preview |
| 3 | Save changes | Section content saved |
| 4 | Reload page | Saved content persists |

#### ORG-PAGE-003: Reorder Sections
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Drag Hero section below About | Order changes in UI |
| 2 | Save and view public page | Sections display in new order |

#### ORG-PAGE-004: Toggle Section Visibility
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hide a section using visibility toggle | Section marked as hidden |
| 2 | View public event page | Hidden section not displayed |
| 3 | Show section again | Section visible on public page |

#### ORG-PAGE-005: Delete Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click delete on section | Confirmation dialog |
| 2 | Confirm deletion | Section removed |
| 3 | Reload page | Section no longer exists |

#### ORG-PAGE-006: Section Types
| Section Type | Test Content |
|--------------|--------------|
| HERO | Title, subtitle, background image, CTA button |
| ABOUT | Rich text description |
| SCHEDULE | Day-by-day schedule items |
| DJ_TEAM | DJ names, photos, bios |
| PHOTOGRAPHERS | Photographer credits with photos |
| PRICING | Price tiers with descriptions |
| GALLERY | Image grid |
| CONTACT | Contact info, social links |
| CUSTOM_TEXT | Rich text content |
| CUSTOM_HTML | Raw HTML content |

---

### 5. Form Builder

**Files**: `/src/app/(dashboard)/events/[id]/form-builder/*`, `/src/app/api/events/[id]/form-fields/*`

#### ORG-FORM-001: Default Fields
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open form builder for new event | Default fields present: Full Name, Email, Role, Country |
| 2 | Try to delete default fields | Cannot delete mandatory fields |

#### ORG-FORM-002: Add Custom Fields
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Field" | Field type selector shown |
| 2 | Select "Text" field | Text field added |
| 3 | Set label "How did you hear about us?" | Label saved |
| 4 | Set as required | Required flag saved |
| 5 | Preview form | New field appears in form |

#### ORG-FORM-003: Field Types
| Field Type | Test Validation |
|------------|-----------------|
| TEXT | Min/max length, pattern |
| EMAIL | Email format validation |
| TEL | Phone number format |
| NUMBER | Min/max value |
| DATE | Date picker works |
| DATETIME | Date + time picker works |
| SELECT | Options display in dropdown |
| RADIO | Options display as radio buttons |
| CHECKBOX | Multiple selections allowed |
| TEXTAREA | Multiline input works |
| URL | URL format validation |
| FILE | File upload works |

#### ORG-FORM-004: Field Options (SELECT/RADIO)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add SELECT field | Options editor appears |
| 2 | Add options: "Beginner", "Intermediate", "Advanced" | Options saved |
| 3 | Preview form | Dropdown shows all options |
| 4 | Delete an option | Option removed |

#### ORG-FORM-005: Conditional Fields
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add field "Dietary restrictions" | Field added |
| 2 | Set condition: Show when "Meal included" = Yes | Condition saved |
| 3 | Preview form without "Meal included" | Field hidden |
| 4 | Preview form with "Meal included" = Yes | Field visible |

#### ORG-FORM-006: Reorder Fields
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Drag custom field above another | Order changes |
| 2 | Save and preview | Fields display in new order |

#### ORG-FORM-007: Multi-language Labels
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Edit field label in English | English label saved |
| 2 | Switch to Spanish, edit label | Spanish label saved |
| 3 | View form in Spanish | Spanish labels displayed |

---

### 6. Registration Management

**Files**: `/src/app/(dashboard)/registrations/*`, `/src/app/api/registrations/*`

#### ORG-REG-001: View Registrations Table
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/registrations` | Registrations table displayed |
| 2 | Verify columns | Name, Email, Event, Status, Payment, Date visible |
| 3 | Table with no registrations | "No registrations yet" message |

#### ORG-REG-002: Filter Registrations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by event | Only selected event's registrations shown |
| 2 | Filter by status "Confirmed" | Only confirmed registrations shown |
| 3 | Filter by payment status "Paid" | Only paid registrations shown |
| 4 | Combine multiple filters | Filters work together |
| 5 | Clear filters | All registrations shown |

#### ORG-REG-003: Search Registrations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search by dancer name | Matching registrations shown |
| 2 | Search by email | Matching registrations shown |
| 3 | Search with no matches | "No results" message |

#### ORG-REG-004: Sort Registrations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sort by date ascending | Oldest first |
| 2 | Sort by date descending | Newest first |
| 3 | Sort by name | Alphabetical order |

#### ORG-REG-005: View Registration Details
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click on registration row | Detail page opens |
| 2 | Verify dancer info | Name, email, role, country displayed |
| 3 | Verify custom field responses | All form responses visible |
| 4 | Verify email history | Sent emails and status shown |

#### ORG-REG-006: Edit Internal Notes
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open registration details | Internal notes field visible |
| 2 | Add note "VIP guest" | Note saved |
| 3 | Reload page | Note persists |

#### ORG-REG-007: Customize Table Columns
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click column customizer | Column list shown |
| 2 | Hide "Country" column | Column removed from table |
| 3 | Show "Phone" column | Column added to table |
| 4 | Reorder columns | Columns display in new order |
| 5 | Reload page | Preferences persisted |

---

### 7. Registration Actions

**Files**: `/src/lib/registration-actions/*`, `/src/app/api/registrations/[id]/actions/*`

#### ORG-ACTION-001: Approve Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Registration status is REGISTERED | - |
| 1 | Click "Approve" action | Confirmation dialog |
| 2 | Confirm action | Status changes to APPROVED |
| 3 | Dancer receives approval email | Email sent and logged |

#### ORG-ACTION-002: Reject Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Registration status is REGISTERED or PENDING_REVIEW | - |
| 1 | Click "Reject" action | Confirmation with optional message |
| 2 | Enter rejection reason | Reason saved |
| 3 | Confirm action | Status changes to REJECTED |
| 4 | Dancer receives rejection email | Email includes reason |

#### ORG-ACTION-003: Confirm Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Registration status is APPROVED and Payment is PAID | - |
| 1 | Click "Confirm" action | Confirmation dialog |
| 2 | Confirm action | Status changes to CONFIRMED |
| 3 | Dancer receives confirmation email | Email sent |

#### ORG-ACTION-004: Cancel Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Registration is not already CANCELLED | - |
| 1 | Click "Cancel" action | Confirmation with warning |
| 2 | Confirm cancellation | Status changes to CANCELLED |
| 3 | If paid, refund option offered | Refund process initiated |

#### ORG-ACTION-005: Waitlist Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Event at capacity | - |
| 1 | Click "Add to Waitlist" | Confirmation dialog |
| 2 | Confirm action | Status changes to WAITLIST |
| 3 | Dancer receives waitlist email | Email explains waitlist position |

#### ORG-ACTION-006: Check-in Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Registration status is CONFIRMED | - |
| 1 | Click "Check-in" action | Quick action, no confirmation |
| 2 | Action executed | Status changes to CHECKED_IN |
| 3 | Check-in timestamp recorded | Time visible in details |

#### ORG-ACTION-007: Mark as Paid
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Payment status is UNPAID or PENDING | - |
| 1 | Click "Mark as Paid" | Confirmation dialog |
| 2 | Confirm action | Payment status changes to PAID |
| 3 | Payment date recorded | Date visible in details |

#### ORG-ACTION-008: Mark as Partially Paid
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Mark Partially Paid" | Amount input dialog |
| 2 | Enter amount received | Amount saved |
| 3 | Confirm action | Payment status changes to PARTIALLY_PAID |

#### ORG-ACTION-009: Initiate Refund
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Payment status is PAID | - |
| 1 | Click "Initiate Refund" | Refund amount confirmation |
| 2 | Confirm full refund | Payment status changes to REFUND_PENDING |
| 3 | Refund processed | Status changes to REFUNDED |

#### ORG-ACTION-010: Bulk Actions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select multiple registrations (checkboxes) | Bulk action menu enabled |
| 2 | Select "Approve All" | Confirmation shows count |
| 3 | Confirm bulk action | All selected registrations updated |
| 4 | Select more than 100 | Error: "Maximum 100 registrations per bulk action" |

#### ORG-ACTION-011: Action Availability
| Current Status | Available Actions |
|----------------|-------------------|
| REGISTERED | Approve, Reject, Waitlist, Cancel |
| PENDING_REVIEW | Approve, Reject, Waitlist, Cancel |
| APPROVED | Confirm (if paid), Cancel, Reject |
| CONFIRMED | Check-in, Cancel |
| WAITLIST | Approve, Reject, Cancel |
| REJECTED | Approve |
| CANCELLED | (No actions) |
| CHECKED_IN | (No actions) |

---

### 8. Payment Management

**Files**: `/src/lib/registration-actions/actions/payment/*`

#### ORG-PAY-001: View Payment Status
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View registration table | Payment status column visible |
| 2 | Filter by "Unpaid" | Only unpaid registrations shown |
| 3 | View registration details | Payment amount, status, date visible |

#### ORG-PAY-002: Revenue Tracking
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View dashboard | Total revenue shown |
| 2 | Revenue calculation | Sum of all PAID registration amounts |

---

### 9. Team Management

**Files**: `/src/app/(dashboard)/settings/team/*`, `/src/app/api/team/*`

#### ORG-TEAM-001: Invite Team Member
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings/team` | Team page displayed |
| 2 | Click "Invite Member" | Invite modal opens |
| 3 | Enter email and select role | Fields accept input |
| 4 | Submit invitation | Invitation sent, appears in pending list |
| 5 | Invitee receives email | Email contains invitation link |

#### ORG-TEAM-002: Accept Invitation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click invitation link | Invitation acceptance page |
| 2 | Create account (if new) | Account created with assigned role |
| 3 | Login (if existing) | Added to organization with role |
| 4 | User appears in team list | Shows name, email, role |

#### ORG-TEAM-003: Invitation Expiry
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Wait 7+ days after invitation | - |
| 2 | Click invitation link | Error: "Invitation expired" |
| 3 | Organizer can resend | New 7-day invitation created |

#### ORG-TEAM-004: Edit Member Role
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Logged in as OWNER or ADMIN | - |
| 1 | Click edit on team member | Role selector appears |
| 2 | Change role from VIEWER to ADMIN | Role updated |
| 3 | Member's permissions updated | Access changes immediately |

#### ORG-TEAM-005: Remove Team Member
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click remove on team member | Confirmation dialog |
| 2 | Confirm removal | Member removed from team |
| 3 | Removed member tries to access | Access denied |

#### ORG-TEAM-006: Role Permissions
| Role | Permissions |
|------|-------------|
| OWNER | Full access including billing, can transfer ownership |
| ADMIN | Full access except billing, can manage team (not owner) |
| SITE_MANAGER | Edit landing pages only |
| FINANCE_MANAGER | View/manage payments only |
| REGISTRATION_MANAGER | View/manage registrations only |
| VIEWER | Read-only access to everything |

#### ORG-TEAM-007: Permission Enforcement
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as VIEWER | - |
| 2 | Try to edit event | Access denied / button disabled |
| 3 | Login as SITE_MANAGER | - |
| 4 | Try to manage registrations | Access denied |

---

### 10. Email Templates

**Files**: `/src/app/(dashboard)/settings/email-templates/*`, `/src/app/api/email-templates/*`

#### ORG-EMAIL-001: Create Email Template
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to email templates | Templates list displayed |
| 2 | Click "Create Template" | Template editor opens |
| 3 | Enter name, subject, content | Fields accept input |
| 4 | Use variables: `{dancerName}`, `{eventName}` | Variables highlighted |
| 5 | Save template | Template appears in list |

#### ORG-EMAIL-002: Edit Template
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click edit on template | Editor opens with content |
| 2 | Modify subject and body | Changes saved |
| 3 | Preview template | Variables replaced with sample data |

#### ORG-EMAIL-003: Delete Template
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click delete on template | Confirmation dialog |
| 2 | Confirm deletion | Template removed |

#### ORG-EMAIL-004: Duplicate Template
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click duplicate on template | New template created with "Copy of" prefix |
| 2 | Edit duplicated template | Original unchanged |

#### ORG-EMAIL-005: Template Variables
| Variable | Replaced With |
|----------|---------------|
| `{dancerName}` | Dancer's full name |
| `{eventName}` | Event title |
| `{eventDate}` | Event start date |
| `{organizerName}` | Organization name |
| `{registrationStatus}` | Current status |

---

### 11. Settings

**Files**: `/src/app/(dashboard)/settings/*`, `/src/app/api/preferences/*`

#### ORG-SET-001: Update Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings` | Settings form displayed |
| 2 | Update full name | Name saved |
| 3 | Update organization name | Org name saved |
| 4 | Changes reflect in dashboard | Updated info visible |

#### ORG-SET-002: Update Default Currency
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select currency EUR | Currency saved |
| 2 | Create new event | Default currency is EUR |

---

### 12. Activity Log

**Files**: `/src/app/(dashboard)/settings/activity-log/*`, `/src/app/api/activity-log/*`

#### ORG-LOG-001: View Activity Log
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings/activity-log` | Activity log displayed |
| 2 | Verify log entries | Shows action, actor, target, timestamp |

#### ORG-LOG-002: Filter Activity Log
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter by action type | Only matching actions shown |
| 2 | Filter by team member | Only that member's actions shown |
| 3 | Filter by date range | Actions within range shown |
| 4 | Filter by event | Event-specific actions shown |

#### ORG-LOG-003: Logged Actions
| Action | Logged Data |
|--------|-------------|
| registration.approve | Actor, registration ID, old/new status |
| team.invite | Actor, invitee email, role |
| event.create | Actor, event ID, event name |

---

### 13. Dancer Notes & Tags

**Files**: `/src/app/api/dancers/[id]/notes/*`, `/src/app/api/dancers/tags/*`

#### ORG-NOTES-001: Add Dancer Note
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open dancer profile (from registration) | Notes section visible |
| 2 | Click "Add Note" | Note editor opens |
| 3 | Enter note content | Note saved with timestamp |
| 4 | Note visible to all team members | - |

#### ORG-NOTES-002: Edit/Delete Note
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click edit on note | Editor opens |
| 2 | Modify content | Changes saved |
| 3 | Click delete | Note removed |

#### ORG-TAGS-001: Create Dancer Tag
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to tags management | Tag list displayed |
| 2 | Create tag "VIP" with gold color | Tag created |
| 3 | Tag available for assignment | - |

#### ORG-TAGS-002: Assign/Remove Tag
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open dancer profile | Tags section visible |
| 2 | Add "VIP" tag | Tag appears on dancer |
| 3 | Remove tag | Tag removed from dancer |

---

## Dancer Features

### 14. Dancer Authentication

**Files**: `/src/app/dancer/*`, `/src/app/api/auth/dancer/*`

#### DNC-AUTH-001: Dancer Signup
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dancer/signup` | Signup form displayed |
| 2 | Enter email and password | Fields accept input |
| 3 | Password validation | Same rules as organizer (8+ chars, etc.) |
| 4 | Submit form | Verification email sent |

#### DNC-AUTH-002: Email Verification
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click verification link in email | Account verified |
| 2 | Link expires after 24 hours | Error: "Link expired" |
| 3 | Request new verification email | New link sent |

#### DNC-AUTH-003: Dancer Login
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dancer/login` | Login form displayed |
| 2 | Enter credentials | Logged in |
| 3 | Redirect to profile or previous page | Appropriate redirect |

---

### 15. Dancer Profile Management

**Files**: `/src/app/[lang]/profile/*`, `/src/app/api/dancer/profile/*`

#### DNC-PROF-001: View Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/en/profile` | Profile displayed |
| 2 | Verify info | Name, email, role, location visible |

#### DNC-PROF-002: Edit Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click edit | Edit form displayed |
| 2 | Update name, role, location | Changes saved |
| 3 | Add bio | Bio saved |
| 4 | Add social links | Links saved |

#### DNC-PROF-003: Upload Profile Picture
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click upload photo | File picker opens |
| 2 | Select valid image | Image uploaded |
| 3 | Profile picture updated | New image displayed |

---

### 16. Event Discovery & Registration

**Files**: `/src/app/[lang]/[slug]/*`, `/src/app/api/public/events/*`

#### DNC-REG-001: View Public Event Page
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/en/summer-tango-2024` | Event page displayed |
| 2 | Verify sections | Hero, about, schedule, etc. visible |
| 3 | Check language | Content in English |
| 4 | Switch to `/es/summer-tango-2024` | Content in Spanish |

#### DNC-REG-002: Register for Event (Anonymous)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Register" on event page | Registration form displayed |
| 2 | Fill required fields | Fields accept input |
| 3 | Leave required field empty | Error message shown |
| 4 | Fill custom fields | Custom responses saved |
| 5 | Submit registration | Confirmation page shown |
| 6 | Check email | Confirmation email with access token received |

#### DNC-REG-003: Register for Event (Logged In)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as dancer | - |
| 2 | Navigate to event registration | Form pre-filled with profile data |
| 3 | Submit registration | Linked to dancer account |

#### DNC-REG-004: Registration When Full
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Event at capacity | - |
| 1 | Try to register | "Event full" message or waitlist option |
| 2 | If waitlist enabled | Option to join waitlist shown |

#### DNC-REG-005: Registration Closed
| Step | Action | Expected Result |
|------|--------|-----------------|
| Precondition | Registration period ended | - |
| 1 | Visit event page | "Registration closed" message |
| 2 | Register button disabled | Cannot submit registration |

---

### 17. Dancer Registration Management

**Files**: `/src/app/registration/[token]/*`, `/src/app/api/dancer/registrations/*`

#### DNC-MYREG-001: View My Registrations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as dancer | - |
| 2 | Navigate to "My Registrations" | List of registrations displayed |
| 3 | Verify registration info | Event name, status, payment status visible |

#### DNC-MYREG-002: View Registration via Token
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click confirmation link (from email) | Registration details page |
| 2 | Verify details | All submitted info visible |
| 3 | Invalid token | Error: "Registration not found" |

---

## Public/Guest Features

#### PUB-001: Multi-language Event Pages
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Visit `/en/event-slug` | English content |
| 2 | Visit `/de/event-slug` | German content (if available) |
| 3 | Visit unsupported language | Fallback to default language |

#### PUB-002: Event Not Found
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Visit `/en/nonexistent-event` | 404 page displayed |

---

## API Health & Infrastructure

#### INFRA-001: Health Check
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/health` | 200 OK with status info |
| 2 | Database connection working | "database": "connected" |

#### INFRA-002: Authentication Required
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/events` without auth | 401 Unauthorized |
| 2 | GET `/api/events` with valid session | 200 OK with data |

#### INFRA-003: Public API Access
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/public/events/slug` | 200 OK (no auth required) |
| 2 | POST `/api/public/events/slug/register` | 200 OK (no auth required) |

---

## Cross-Feature Scenarios

### END-TO-END: Complete Registration Flow

| Step | Actor | Action | Expected Result |
|------|-------|--------|-----------------|
| 1 | Organizer | Create event | Event in DRAFT status |
| 2 | Organizer | Build landing page | Sections added |
| 3 | Organizer | Create registration form | Custom fields added |
| 4 | Organizer | Publish event | Event status PUBLISHED |
| 5 | Dancer | Visit event page | Page displays correctly |
| 6 | Dancer | Fill registration form | All fields work |
| 7 | Dancer | Submit registration | Status: REGISTERED |
| 8 | Dancer | Receive confirmation email | Email delivered |
| 9 | Organizer | View registration | Appears in table |
| 10 | Organizer | Approve registration | Status: APPROVED |
| 11 | Dancer | Receive approval email | Email with payment info |
| 12 | Dancer | Complete payment | Payment status: PAID |
| 13 | Organizer | Confirm registration | Status: CONFIRMED |
| 14 | Dancer | Receive confirmation | Final confirmation email |
| 15 | Organizer | Check-in at event | Status: CHECKED_IN |

### END-TO-END: Team Collaboration

| Step | Actor | Action | Expected Result |
|------|-------|--------|-----------------|
| 1 | Owner | Invite Admin | Invitation sent |
| 2 | Admin | Accept invitation | Added to organization |
| 3 | Admin | Create event | Event created |
| 4 | Owner | Invite Registration Manager | Invitation sent |
| 5 | Reg Manager | Accept invitation | Limited access |
| 6 | Reg Manager | View registrations | Access granted |
| 7 | Reg Manager | Try to edit event | Access denied |

---

## Test Data Requirements

### Minimum Test Data Set
- 1 Organizer account with completed profile
- 1 Team member (different role)
- 2 Events (1 published, 1 draft)
- 5 Registrations per event (various statuses)
- 2 Dancer accounts
- 1 Email template

### Test User Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Organizer (Owner) | test-owner@4tango.com | Test123! | Full access |
| Organizer (Admin) | test-admin@4tango.com | Test123! | Admin access |
| Organizer (Viewer) | test-viewer@4tango.com | Test123! | Read-only |
| Dancer | test-dancer@4tango.com | Test123! | Dancer account |

---

## Version History

| Date | Changes | Author |
|------|---------|--------|
| 2026-03-27 | Initial version - comprehensive test scenarios | Claude |

---

## Maintenance Notes

- **Update this file** when adding new features or modifying existing ones
- **CLAUDE.md** references this file for test maintenance
- Run through critical paths after each deployment
- Priority order for testing: Auth → Registration → Payments → Team

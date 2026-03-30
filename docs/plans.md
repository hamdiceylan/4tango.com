# 4Tango Pricing Plans

This document defines the pricing structure, features, and limits for each plan. Use this as the source of truth for application logic, feature gating, and subscription management.

---

## Plans Overview

| Plan | Price | Billing | Target User |
|------|-------|---------|-------------|
| Free | 0 EUR | - | First-time organizers trying the platform |
| Starter | 15 EUR/month | Annual | Regular event organizers running multiple small-medium events |
| Professional | 39 EUR/month | Annual | Festivals and large event organizers |

---

## Plan Details

### Free Plan

**Price:** 0 EUR (forever)

**Limits:**
| Feature | Limit |
|---------|-------|
| Active events | 1 |
| Registrations per event | 50 |
| Team members | 1 (owner only) |

**Features:**
| Feature | Included |
|---------|----------|
| Registration form builder | Basic fields only |
| Event page | Basic template |
| Email confirmations | Yes |
| Email tracking (opens/clicks) | No |
| CSV export | Yes |
| Payment collection | No |
| API access | No |
| Priority support | No |
| Dedicated support | No |

**Add-ons available:** No

---

### Starter Plan

**Price:** 15 EUR/month (billed annually = 180 EUR/year)

**Limits:**
| Feature | Limit |
|---------|-------|
| Active events | 5 |
| Registrations per event | 300 |
| Team members | 1 (owner only) |

**Features:**
| Feature | Included |
|---------|----------|
| Registration form builder | Custom fields |
| Event page | Basic template |
| Email confirmations | Yes |
| Email tracking (opens/clicks) | Yes |
| CSV export | Yes |
| Payment collection | Yes |
| API access | No |
| Priority support | Yes |
| Dedicated support | No |

**Add-ons available:** Yes (all add-ons)

---

### Professional Plan

**Price:** 39 EUR/month (billed annually = 468 EUR/year)

**Limits:**
| Feature | Limit |
|---------|-------|
| Active events | Unlimited |
| Registrations per event | Unlimited |
| Team members | 5 |

**Features:**
| Feature | Included |
|---------|----------|
| Registration form builder | Advanced + conditional logic |
| Event page | Basic template |
| Email confirmations | Yes |
| Email tracking (opens/clicks) | Yes |
| CSV export | Yes |
| Payment collection | Yes |
| API access | Yes |
| Priority support | Yes |
| Dedicated support | Yes |

**Add-ons available:** Yes (all add-ons)

---

## Add-on Modules

Add-ons can be added to Starter and Professional plans only. Pricing is per month, billed with subscription.

### Custom Event Page Builder

**Price:** 9 EUR/month

**Description:** Build beautiful, branded event pages with a visual editor.

**Features:**
- Drag & drop page builder
- Custom branding & colors
- Multiple page sections
- Image galleries
- Schedule/program display
- Embedded videos
- Custom domain support (Professional plan only)

---

### Transfer Management

**Price:** 19 EUR/month

**Description:** Manage airport transfers and shuttle services for attendees.

**Features:**
- Collect arrival/departure info during registration
- Airport transfer booking
- Shuttle scheduling
- Driver assignments
- Transfer manifests & reports
- Attendee notifications

---

### Accommodation Management

**Price:** 19 EUR/month

**Description:** Manage hotel room blocks and accommodation bookings.

**Features:**
- Hotel partnership management
- Room block allocation
- Accommodation preferences in registration
- Roommate matching (optional)
- Hotel booking reports
- Direct hotel communication

---

## Application Logic Reference

### Plan IDs

Use these identifiers in code:

```typescript
type PlanId = 'free' | 'starter' | 'professional';
type AddOnId = 'custom-event-page' | 'transfer-management' | 'accommodation';
```

### Feature Flags

```typescript
interface PlanFeatures {
  maxActiveEvents: number | null;        // null = unlimited
  maxRegistrationsPerEvent: number | null; // null = unlimited
  maxTeamMembers: number;
  formBuilder: 'basic' | 'custom' | 'advanced';
  emailTracking: boolean;
  paymentCollection: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  addOnsEnabled: boolean;
}
```

### Plan Configuration

```typescript
const PLANS: Record<PlanId, PlanFeatures> = {
  free: {
    maxActiveEvents: 1,
    maxRegistrationsPerEvent: 50,
    maxTeamMembers: 1,
    formBuilder: 'basic',
    emailTracking: false,
    paymentCollection: false,
    apiAccess: false,
    prioritySupport: false,
    dedicatedSupport: false,
    addOnsEnabled: false,
  },
  starter: {
    maxActiveEvents: 5,
    maxRegistrationsPerEvent: 300,
    maxTeamMembers: 1,
    formBuilder: 'custom',
    emailTracking: true,
    paymentCollection: true,
    apiAccess: false,
    prioritySupport: true,
    dedicatedSupport: false,
    addOnsEnabled: true,
  },
  professional: {
    maxActiveEvents: null,
    maxRegistrationsPerEvent: null,
    maxTeamMembers: 5,
    formBuilder: 'advanced',
    emailTracking: true,
    paymentCollection: true,
    apiAccess: true,
    prioritySupport: true,
    dedicatedSupport: true,
    addOnsEnabled: true,
  },
};
```

### Add-on Configuration

```typescript
interface AddOn {
  id: AddOnId;
  name: string;
  price: number; // EUR per month
  availablePlans: PlanId[];
}

const ADD_ONS: AddOn[] = [
  {
    id: 'custom-event-page',
    name: 'Custom Event Page Builder',
    price: 9,
    availablePlans: ['starter', 'professional'],
  },
  {
    id: 'transfer-management',
    name: 'Transfer Management',
    price: 19,
    availablePlans: ['starter', 'professional'],
  },
  {
    id: 'accommodation',
    name: 'Accommodation Management',
    price: 19,
    availablePlans: ['starter', 'professional'],
  },
];
```

### Custom Domain Logic

Custom domain for event pages requires:
1. Professional plan
2. Custom Event Page Builder add-on

```typescript
function canUseCustomDomain(planId: PlanId, addOns: AddOnId[]): boolean {
  return planId === 'professional' && addOns.includes('custom-event-page');
}
```

---

## Pricing Summary

| Plan | Monthly | Annual | Add-ons |
|------|---------|--------|---------|
| Free | 0 EUR | 0 EUR | Not available |
| Starter | 15 EUR | 180 EUR | +9-19 EUR/mo each |
| Professional | 39 EUR | 468 EUR | +9-19 EUR/mo each |

| Add-on | Price |
|--------|-------|
| Custom Event Page | +9 EUR/month |
| Transfer Management | +19 EUR/month |
| Accommodation | +19 EUR/month |

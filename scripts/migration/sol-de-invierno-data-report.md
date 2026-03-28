# Sol de Invierno Tango Marathon - Data Extraction Report

> **Source:** https://www.inviernotangomarathon.com/
> **Extracted:** 2026-03-28
> **Purpose:** Migration to 4Tango platform

---

## 1. EVENT OVERVIEW

| Field | Value |
|-------|-------|
| **Event Name** | Sol de Invierno Tango Marathon |
| **Dates** | November 6-9, 2025 (4 days) |
| **Location** | Mukarnas Resort & Spa, Antalya, Turkey |
| **Format** | Ultra all-inclusive tango marathon |
| **Languages** | Turkish, English, French |

---

## 2. SCHEDULE / PROGRAM

| Date | Day | Session | Time |
|------|-----|---------|------|
| Nov 6 | Thursday | Opening Milonga | 22:00 - 04:00 |
| Nov 7 | Friday | Day Milonga | 15:00 - 18:30 |
| Nov 7 | Friday | Night Milonga | 22:00 - 04:00 |
| Nov 8 | Saturday | Day Milonga | 15:00 - 18:30 |
| Nov 8 | Saturday | Night Milonga | 22:00 - 04:00 |
| Nov 9 | Sunday | Day Milonga | 15:00 - 18:30 |
| Nov 9 | Sunday | Night Milonga | 22:00 - 04:00 |

---

## 3. VENUE / ACCOMMODATION

**Venue:** Mukarnas Resort & Spa (5-star)

**Details:**
- Check-in: 14:00
- Check-out: 12:00
- 700 sq meter milonga salon with high ceilings
- Multiple pools
- Sports center
- Mediterranean seaside location

**Ultra All-Inclusive Features:**
- 24/7 alcoholic and non-alcoholic drinks
- Open buffet breakfast, lunch, dinner
- Cakes and desserts
- Free post-midnight sandwiches and fruits

---

## 4. PRICING / PACKAGES

| Package | Duration | Room Type | Price (EUR) |
|---------|----------|-----------|-------------|
| Standard | 3 nights / 4 days | Double | €360 |
| Extended | 4 nights / 5 days | Double | €420 |
| Single Standard | 3 nights / 4 days | Single | €570 |
| Single Extended | 4 nights / 5 days | Single | €675 |
| Tour Package | - | No hotel | €150 (milonga only) |

**Payment Terms:**
- €100 deposit required at registration (credit card)
- Balance paid at hotel check-in
- Full refund before July 1, 2025
- 50% deposit refund: Aug 1 - Sep 30, 2025
- No refunds after October 1, 2025

**Children Policy:**
- 1st child under 11: FREE
- 2nd child under 11: 50% off

---

## 5. DJ TEAM (7 DJs)

| Name | Country | Photo URL |
|------|---------|-----------|
| Irene Mahno | Poland | `image/alan/_67e3e0a192f86.png` |
| David Mancini | Italy | `image/alan/_67e3e39d02966.png` |
| Ugur Akar | Turkey | `image/alan/_67e3e1a80b7ba.png` |
| Ricardo Ferreira | Portugal | `image/alan/_67e3e24a45d53.png` |
| Agi Porvai | Hungary | `image/alan/_67e3e32024682.png` |
| Orkun Boragan | Turkey | `image/alan/_67e3e22b28c91.png` |
| DJ Efe | Netherlands | `image/alan/_67e54162b7378.png` |

---

## 6. PHOTOGRAPHERS

| Name | Photo URL |
|------|-----------|
| Öyküm Çayır | `image/alan/_67e3e513db8b1.png` |
| Özcan Özkan | `image/alan/_67e3e5409f94e.png` |
| Maria Traskovskaya | `image/alan/_67e3f461047df.png` |
| Veronika Korchak | `image/alan/_688a25f09fd45.jpeg` |

---

## 7. REGISTRATION FORM FIELDS

### Required Fields

| Field Name | Type | Options |
|------------|------|---------|
| Check-in Date | Date picker | - |
| Check-out Date | Date picker | - |
| Marathon Package | Select | 3 Days Double (€360), 4 Days Double (€420), 3 Days Single (€570), 4 Days Single (€675) |
| Dance Experience | Radio | Less than 1 year, 1-3 years, 3-5 years, More than 5 years |
| Role | Radio | Follower, Leader |

### Optional Fields

| Field Name | Type | Notes |
|------------|------|-------|
| Airport Transfer | Checkbox | "I need transfer from Antalya Airport" |
| Last 3 Marathons | Textarea | Previous marathon history |
| Facebook Profile | URL | Link to FB profile |
| Photo Consent | Checkbox | Permission to use photos |

### Form Submission
- **Endpoint:** `POST https://www.inviernotangomarathon.com/i/reservation`
- **Validation:** No empty fields, AJAX submission

---

## 8. IMAGES TO DOWNLOAD

### Branding
```
https://www.inviernotangomarathon.com/assets/images/logo.png
https://www.inviernotangomarathon.com/assets/images/logo-sol.png
```

### Hotel Gallery (8 images)
```
https://www.inviernotangomarathon.com/assets/hotel/1.jpg
https://www.inviernotangomarathon.com/assets/hotel/2.jpg
https://www.inviernotangomarathon.com/assets/hotel/3.jpg
https://www.inviernotangomarathon.com/assets/hotel/4.jpg
https://www.inviernotangomarathon.com/assets/hotel/5.jpg
https://www.inviernotangomarathon.com/assets/hotel/6.jpg
https://www.inviernotangomarathon.com/assets/hotel/7.jpg
https://www.inviernotangomarathon.com/assets/hotel/8.jpg
```

### DJ Photos
```
https://www.inviernotangomarathon.com/image/alan/_67e3e0a192f86.png
https://www.inviernotangomarathon.com/image/alan/_67e3e39d02966.png
https://www.inviernotangomarathon.com/image/alan/_67e3e1a80b7ba.png
https://www.inviernotangomarathon.com/image/alan/_67e3e24a45d53.png
https://www.inviernotangomarathon.com/image/alan/_67e3e32024682.png
https://www.inviernotangomarathon.com/image/alan/_67e3e22b28c91.png
https://www.inviernotangomarathon.com/image/alan/_67e54162b7378.png
```

### Photographer Photos
```
https://www.inviernotangomarathon.com/image/alan/_67e3e513db8b1.png
https://www.inviernotangomarathon.com/image/alan/_67e3e5409f94e.png
https://www.inviernotangomarathon.com/image/alan/_67e3f461047df.png
https://www.inviernotangomarathon.com/image/alan/_688a25f09fd45.jpeg
```

### Social Icons
```
https://www.inviernotangomarathon.com/assets/images/facebook.png
https://www.inviernotangomarathon.com/assets/images/instagram.png
```

---

## 9. SOCIAL MEDIA & CONTACT

| Platform | Link |
|----------|------|
| Facebook Group | https://facebook.com/groups/569221851539579 |
| Facebook Page | https://facebook.com/soldeinviernotangomarathon |
| Instagram | @soldeinviernotangomarathon |
| Contact | Tyler J. White (FB: aslalabislasbebegim) |

---

## 10. ADDITIONAL SERVICES

- **Airport Transfers:** Available from Antalya Airport (pricing TBA)
- **Shuttle Service:** 24/7, every 1.5-2 hours
- **Early Check-in / Late Check-out:** Available upon request
- **Minimum Stay:** 3 nights (no single or two night bookings)

---

## 11. 4TANGO MAPPING

### Section Mapping

| Old Website Section | 4Tango Section Type |
|---------------------|---------------------|
| Banner/Header | HERO |
| About | ABOUT |
| Program/Schedule | SCHEDULE |
| Accommodation | ACCOMMODATION |
| DJ Team | DJ_TEAM |
| Prices | PRICING |
| Registration Form | (Form Builder) |

### Form Field Mapping

| Old Field | 4Tango Field |
|-----------|--------------|
| Marathon Package | Package selection (built-in) |
| Dance Experience | Custom select field |
| Role | Role field (LEADER/FOLLOWER) |
| Airport Transfer | Custom checkbox |
| Last 3 Marathons | Custom textarea |
| Facebook Profile | Custom URL field |
| Photo Consent | Custom checkbox |

---

## 12. NEXT STEPS

1. ✅ Data extraction complete
2. ⬜ Download all images to S3
3. ⬜ Create event sections in 4Tango
4. ⬜ Set up packages with pricing
5. ⬜ Configure registration form fields
6. ⬜ Import DJ team data
7. ⬜ Set up schedule
8. ⬜ Configure payment/refund policies

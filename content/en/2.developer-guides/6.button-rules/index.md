---
title: WhatsApp Button Rules
description: Complete reference for button types, limits, and allowed combinations in WhatsApp templates.
icon: i-lucide-mouse-pointer-click
---

This section details all rules and limitations for buttons in WhatsApp templates.

## 1. Global Rules

- All buttons are defined in a single `BUTTONS` component
- Buttons are listed in a `buttons[]` array
- **Maximum 10 buttons total** per template
- Specific limits apply per button type

## 2. Allowed Button Types

| Type | Max Limit | Description |
| :--- | :--- | :--- |
| `QUICK_REPLY` | **10** | Quick reply buttons (customizable text) |
| `URL` | **2** | Buttons linking to a website |
| `PHONE_NUMBER` | **1** | Phone call button |
| `COPY_CODE` | **1** | Button to copy a code (OTP) |
| `FLOW` | **1** | WhatsApp Flow button (forms) |

## 3. Allowed Combinations

### Option 1: Quick Reply Only

You can use **up to 10 Quick Reply buttons** without restriction.

```
✅ Valid examples:
[QUICK_REPLY]
[QUICK_REPLY, QUICK_REPLY]
[QUICK_REPLY, QUICK_REPLY, QUICK_REPLY]
[QUICK_REPLY × 10]
```

### Option 2: Non-Quick Reply Only

Freely combine other button types **while respecting per-type limits**.

```
✅ Valid combinations:
[URL]
[URL, URL]
[PHONE_NUMBER]
[PHONE_NUMBER, URL]
[COPY_CODE]
[COPY_CODE, URL]
[COPY_CODE, PHONE_NUMBER, URL]
[FLOW]
```

### Option 3: Mix Quick Reply + Other Types

::warning
**Allowed BUT with strict ordering!** Buttons must be organized in **2 contiguous groups**. Quick Reply buttons must be together, never interleaved.
::

```
✅ Valid orders:

// Option A — Quick Reply FIRST
[QUICK_REPLY, QUICK_REPLY, URL, PHONE_NUMBER]

// Option B — Quick Reply LAST
[URL, PHONE_NUMBER, QUICK_REPLY, QUICK_REPLY]
```

## 4. Forbidden Combinations

::warning
These configurations will be **rejected by the API**:
::

```
❌ Quick Reply interleaved with other buttons:
[QUICK_REPLY, URL, QUICK_REPLY]

❌ Alternating types:
[URL, QUICK_REPLY, URL]

❌ Exceeding per-type limits:
[PHONE_NUMBER, PHONE_NUMBER]  → Max 1 PHONE_NUMBER
[URL, URL, URL]               → Max 2 URL
[COPY_CODE, COPY_CODE]        → Max 1 COPY_CODE
```

## 5. Display Behavior

| Condition | Display | Compatibility |
| :--- | :--- | :--- |
| ≤ 3 buttons | All buttons shown directly | ✅ Mobile + Desktop |
| ≥ 4 buttons | 2 buttons visible + "See all options" button | ✅ Mobile + Desktop |
| Mix Quick Reply + others | Message not visible on Desktop | ⚠️ Mobile only |

::warning
If your template contains **4 or more buttons**, OR a **mix of Quick Reply with other types**, the message will **not be visible on WhatsApp Desktop**. It will only be visible on mobile.
::

## 6. Summary

::card-group
::card{title="✅ Allowed" icon="i-lucide-check-circle"}
- Up to 10 buttons total
- Mix Quick Reply + others **IF grouped**
- Order: `QR… → others` or `others → QR…`
::

::card{title="❌ Forbidden" icon="i-lucide-x-circle"}
- Mixing types button by button
- Doubling a limited type (Phone, Copy Code)
- Quick Reply in the middle of other types
::
::

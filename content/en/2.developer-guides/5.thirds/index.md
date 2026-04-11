---
title: Overview
description: Learn about Third entities and how to manage contacts and customers via the API.
icon: i-mdi-account-group
---

# Thirds

A **Third** represents a contact, customer, or lead in your Digishare account. Use the Thirds API to manage your contact database programmatically.

---

## Quick Example

Create a new contact with a single API call:

::api-playground
---
method: POST
url: "https://api.digishare.ma/v1/thirds"
headers:
  Authorization: "Bearer YOUR_ACCESS_TOKEN"
  Content-Type: "application/json"
body:
  first_name: "Sarah"
  last_name: "Connor"
  email: "sarah@example.com"
  mobile: "+212612345678"
responseSample:
  id: "xYz123AbC"
  status: "created"
---
::

---

## What You Can Do

::card-group
::card{title="Create Contacts" icon="i-mdi-account-plus"}
Add new contacts with profile information, custom data, and group assignments.
::

::card{title="Search & Filter" icon="i-mdi-magnify"}
Find contacts using search, filtering, and custom field queries.
::

::card{title="Sync with CRM" icon="i-mdi-refresh"}
Use `ext_ref` to sync contacts with your external CRM or database.
::

::card{title="Extend with Custom Fields" icon="i-mdi-tag-multiple"}
Store unlimited custom metadata like balance, preferences, or scores.
::
::

---

## The Third Object

Every Third has a unique `id` and belongs to a company. Here's a typical response:

```json
{
  "object": "Third",
  "id": "xYz123AbC",
  "first_name": "Sarah",
  "last_name": "Connor",
  "name": "Sarah Connor",
  "email": "sarah@example.com",
  "mobile": "+212612345678",
  "wa_id": "212612345678",
  "lang": "en",
  "is_company": false,
  "premium": true,
  "verified": true,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-18T14:20:00Z"
}
```

---

## Core Fields

| Field        | Type   | Description                      |
| ------------ | ------ | -------------------------------- |
| `id`         | string | Unique identifier (hashed)       |
| `first_name` | string | First name                       |
| `last_name`  | string | Last name                        |
| `name`       | string | Full name                        |
| `email`      | string | Email address                    |
| `mobile`     | string | Mobile phone                     |
| `wa_id`      | string | WhatsApp ID (unique per company) |

## Contact Details

| Field       | Type   | Description                      |
| ----------- | ------ | -------------------------------- |
| `phone`     | string | Landline phone                   |
| `address`   | string | Primary address                  |
| `address_2` | string | Secondary address                |
| `lang`      | string | Language code (`en`, `fr`, `ar`) |
| `gender`    | string | `male`, `female`, `other`        |
| `birthday`  | string | Birth date (YYYY-MM-DD)          |

## Flags

| Field        | Type    | Default | Description        |
| ------------ | ------- | ------- | ------------------ |
| `is_company` | boolean | false   | Is this a company? |
| `premium`    | boolean | false   | Premium customer   |
| `verified`   | boolean | false   | Verified contact   |
| `status`     | boolean | true    | Active status      |

## Extended Data

Store additional structured data in the `data` object:

```json
{
  "data": {
    "company_name": "Acme Inc",
    "title": "CEO",
    "website": "https://acme.com",
    "customer": true,
    "custom_fields": {
      "balance": 150.75,
      "loyalty_tier": "gold"
    }
  }
}
```

**Standard fields:** `company_name`, `title`, `function`, `website`, `comment`, `zip`, `tz`, `avatar`, `emails[]`, `mobiles[]`, `phones[]`, `facebook_ids[]`, `instagram_ids[]`, `linkedin_ids[]`, `telegram_ids[]`, `customer`, `supplier`, `employee`, `location`.

**Custom fields:** Use `custom_fields` object for your own key-value data. See [Custom Fields](/developer-guides/thirds/custom-fields) for advanced options.

---

## Related IDs

Link thirds to other entities using hashed IDs:

| Field        | Description                    |
| ------------ | ------------------------------ |
| `company_id` | Parent company                 |
| `source_id`  | Lead source                    |
| `country_id` | Country                        |
| `state_id`   | State/Province                 |
| `city_id`    | City                           |
| `parent_id`  | Parent third (for hierarchies) |

---

## Next Steps

::card-group
::card{title="CRUD Operations" icon="i-mdi-database" to="/developer-guides/thirds/crud"}
Create, read, update, and delete contacts.
::

::card{title="Custom Fields" icon="i-mdi-tag-multiple" to="/developer-guides/thirds/custom-fields"}
Store custom metadata on contacts.
::
::


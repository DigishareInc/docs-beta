---
title: WhatsApp Campaigns
description: Orchestrate high-volume WhatsApp campaigns with dynamic personalization.
icon: i-mdi-whatsapp
---

This guide explains how to send WhatsApp campaigns using **Digishare Message Templates**. These templates can be **Text**, **ITM** (Interactive Template Message), or **WABA TM** (Meta-approved Template).

::note
**Prerequisites**:

- Valid **Bearer Token**.
- **Digishare Message Template ID** (created in your Digishare Dashboard).
- **Sender Label ID** (e.g., `YOUR_SENDER_ID`) representing your WhatsApp channel.
::

## 1. API Payload Reference

The campaign payload utilizes a structured JSON schema optimized for high-volume messaging and seamless integration.

### Configuration Fields

| Field | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Required** | Internal name for the campaign (not visible to recipients). |
| `channel` | `string` | **Required** | The communication channel to use. Set to `whatsapp`. |
| `sender_label_id` | `string` | **Required** | The unique identifier for your sender channel. |
| `message_template_id` | `string` | **Required** | The ID of your Digishare Message Template (Text, ITM, or WABA). |
| `conversation_id` | `string` | Optional | Links to an existing thread or sets a trigger: `message-out`, `replay-button`, `any-reply`, or `conversed`. |
| `start_datetime` | `string` | Optional | Scheduled start time for the campaign (ISO-8601 format). |
| `notify_webhooks` | `boolean` | Optional | If `true`, triggers external webhooks for delivery and interaction events. |
| `meta` | `object` | Optional | A custom JSON object for internal analytics, IDs, or external references. |
| `conversation_tags` | `array` | Optional | A list of labels to automatically apply to the generated conversations. |
| `recipients` | `array` | **Required** | A list of recipient objects containing their unique IDs and variables. |
| `global_data` | `object` | Optional | The mapping bridge used to populate template variables with static values or dynamic recipient data. |

## 2. Example: Personalized Order Notification

If your template uses variables like `Hello {{name}}, your order {{order_id}} is ready.`, the following payload demonstrates a full configuration including scheduling, webhooks, and dynamic mapping:

::api-playground
---
method: POST
url: https://api.digishare.ma/v1/campaigns
description: Send a personalized WhatsApp campaign with all configuration keys.
variables:
  token: YOUR_TOKEN
  senderId: YOUR_SENDER_ID
  templateId: YOUR_TEMPLATE_ID
headers:
  Authorization: Bearer {token}
  Content-Type: application/json
body:
  title: Order Notification Campaign
  channel: whatsapp
  sender_label_id: "{senderId}"
  message_template_id: "{templateId}"
  conversation_id: any-reply
  start_datetime: "2026-04-01T10:00:00Z"
  notify_webhooks: true
  meta:
    order_system: shopify
    priority: high
  conversation_tags:
    - order_update
    - automated_notification
  global_data:
    company_name: Digishare
    name: "%recipient.name%"
    order_id: "%recipient.order_id%"
  recipients:
    - wa_id: "212600000000"
      name: John
      order_id: ORD-123
    - wa_id: "212600000001"
      name: Jane
      order_id: ORD-456
---
::

## 3. Dynamic Data Mapping

The `global_data` block serves as the centralized mapping bridge between your recipient data and the message template variables. It supports:

- **Static values**: Fixed data shared across all recipients (e.g., `brand_name`).
- **Mapped values**: Dynamic data pulled from recipient fields using the `%recipient.field%` syntax.

::important
Message templates **only** look for variables within the `global_data` block. If you have a field in your `recipients` list (like `name`) but do not explicitly map it in `global_data` (e.g., `"name": "%recipient.name%"`), that data will not be available to the template.
::

### Use Case: Dynamic Personalization

For a template like `Hello {{name}}, your order {{order_id}} is ready.`, you must map each recipient's field to the corresponding template variable:

```json
{
  "global_data": { 
    "company_name": "Digishare", 
    "name": "%recipient.name%",
    "order_id": "%recipient.order_id%"
  },
  "recipients": [
    { "wa_id": "212600000000", "name": "John", "order_id": "123" },
    { "wa_id": "212600000001", "name": "Jane", "order_id": "456" }
  ]
}
```

> [!TIP]
> In this example, the first recipient will receive a message with `John` and `123`.

## 4. Conversation Orchestration & Tagging

Automatically organize your business threads by linking campaigns to existing conversations or applying classification tags for better management.

```json
{
  "title": "Lead Gen Campaign",
  "channel": "whatsapp",
  "conversation_id": "conv_987654321",
  "conversation_tags": ["new_lead", "summer_promo"],
  "global_data": { "name": "%recipient.name%" },
  "recipients": [ 
    { "wa_id": "212600000000", "name": "John" }
  ]
}
```

::important
Tags are applied to the conversation **as soon as the user responds** to the initial campaign message or when the message is successfully delivered (depending on your channel settings).
::

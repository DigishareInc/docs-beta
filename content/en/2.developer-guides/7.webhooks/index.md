---
title: Webhooks
description: Receive real-time updates about messages, contacts, conversations, and tickets.
icon: i-lucide-webhook
---

Webhooks allow you to receive real-time `POST` notifications directly to your server when specific events occur in Digishare.

## 1. Setup

::steps
### Set Webhook URL
Configure your endpoint URL in your Digishare application settings.

### Listen for Events
Your server must be ready to receive `POST` requests with a JSON payload.

### Acknowledge Receipt
Your endpoint **must** respond with an HTTP `200 OK` status code to confirm receipt.
::

::warning
If your server does not respond with `200 OK`, Digishare will attempt to resend the notification according to a retry policy before temporarily disabling the webhook.
::

## 2. Campaign Events

Triggered for message status updates (sent, delivered, read) or interactions.

::note
To enable these notifications for a campaign, set `"notify_webhooks": true` in the `contacts_and_data` object when creating it.
::

| Event | Description |
| :--- | :--- |
| `campaign_message.delivered` | Message was delivered to the recipient. |
| `campaign_message.read` | Recipient opened the message. |
| `campaign_message.failed` | Delivery failed (invalid number, etc.). |
| `campaign_message.interaction` | User clicked a button. |

### Example: Message Delivered

```json
{
  "event": "campaign_message.delivered",
  "data": {
    "date": "2025-04-09T02:02:11.000000Z",
    "campaign_id": "cmp_abc123def456",
    "provider_id": "prov_whatsapp_prod",
    "channel_id": "whatsapp",
    "recipient_id": "212601020304",
    "campaign_external_ref": "RAMADAN_PROMO_25",
    "provider_message_id": "wamid.HBgNNzA5ODUwOTI0MzE4QkU1QzQ1Rg==",
    "push_log_id": "pl_ghi789jkl012",
    "planned_message_id": "pm_mno345pqr678",
    "status_code": "delivered"
  }
}
```

### Example: Interaction (Button Click)

```json
{
  "event": "campaign_message.interaction",
  "data": {
    "date": "2025-04-09T02:05:30.000000Z",
    "campaign_id": "cmp_abc123def456",
    "provider_id": "prov_whatsapp_prod",
    "channel_id": "whatsapp",
    "recipient_id": "212601020304",
    "campaign_external_ref": "RAMADAN_PROMO_25",
    "provider_message_id": "wamid.HBgNNzA5ODUwOTI0MzE4QkU1QzQ1Rg==",
    "push_log_id": "pl_ghi789jkl012",
    "planned_message_id": "pm_mno345pqr678",
    "status_code": "interaction",
    "payload": "button_yes_opt_in"
  }
}
```

### Example: Delivery Failed

```json
{
  "event": "campaign_message.failed",
  "data": {
    "date": "2025-04-09T02:03:00.000000Z",
    "campaign_id": "cmp_stu789vwx012",
    "provider_id": "prov_sms_global",
    "channel_id": "sms",
    "recipient_id": "212600000000",
    "status_code": "failed",
    "sub_status_code": "failed_invalid_recipient",
    "error_message": "The recipient number is not valid or is blacklisted."
  }
}
```

## 3. LiveChat Events

Track conversations and messages in real time.

| Event | Description |
| :--- | :--- |
| `live_chat.new_conversation` | A new chat session has started. |
| `live_chat.new_message` | A new message (customer or agent) was posted. |
| `live_chat.conversation_archived` | The conversation was closed/archived. |

### Example: New Conversation

```json
{
  "event": "live_chat.new_conversation",
  "data": {
    "id": "conv_abc123xyz789",
    "data": {
      "created_at": "2025-04-29T14:40:47.000000Z",
      "third": {
        "id": "thd_pqr456stu012",
        "name": "Fatima Zahra",
        "platform_link": {
          "id": "plnk_lmn789opq345",
          "channel": "whatsapp",
          "platform_id": "212612345678"
        }
      }
    }
  }
}
```

### Example: New Message (Customer)

```json
{
  "event": "live_chat.new_message",
  "data": {
    "id": "msg_user123abc456",
    "data": {
      "conversation_id": "conv_abc123xyz789",
      "system": false,
      "type": "text",
      "body": "Hello, I have a question about my order.",
      "send_to_third": false,
      "sent_using": "whatsapp",
      "created_at": "2025-04-30T12:14:33.000000Z",
      "sender": {
        "id": "sndr_thd_pqr456stu012",
        "model_type": "third",
        "model_id": "thd_pqr456stu012",
        "name": "Fatima Zahra"
      }
    }
  }
}
```

### Example: New Message (Agent)

```json
{
  "event": "live_chat.new_message",
  "data": {
    "id": "msg_agent789def012",
    "data": {
      "conversation_id": "conv_abc123xyz789",
      "system": false,
      "type": "text",
      "body": "Hi Fatima, I can help you with that. What is your order number?",
      "send_to_third": true,
      "sent_using": "whatsapp",
      "created_at": "2025-04-30T12:15:05.000000Z",
      "sender": {
        "id": "sndr_usr_agent_support_01",
        "model_type": "user",
        "model_id": "usr_agent_support_01",
        "name": "Support Agent Ahmed"
      }
    }
  }
}
```

### Example: Conversation Archived

```json
{
  "event": "live_chat.conversation_archived",
  "data": {
    "conversation_id": "conv_abc123xyz789",
    "archived_at": "2025-05-01T10:30:00.000000Z"
  }
}
```

## 4. Third Party Events (Contacts)

| Event | Description |
| :--- | :--- |
| `third.created` | A new contact was created. |
| `third.updated` | An existing contact was modified. |
| `third.deleted` | A contact was deleted. |
| `third.tags-changed` | Tags on a contact were modified. |

### Example: Contact Created

```json
{
  "event": "third.created",
  "data": {
    "id": "thd_0wyb4mee98mxng8p",
    "data": {
      "id": "thd_0wyb4mee98mxng8p",
      "wa_id": "212611223344",
      "email": "new.contact@example.ma",
      "first_name": "Karim",
      "last_name": "Alaoui",
      "name": "Karim Alaoui",
      "lang": "fr",
      "created_at": "2025-04-09T17:54:54.000000Z"
    },
    "wasRecentlyCreated": true
  }
}
```

### Example: Contact Updated

```json
{
  "event": "third.updated",
  "data": {
    "id": "thd_0wyb4mee98mxng8p",
    "data": {
      "id": "thd_0wyb4mee98mxng8p",
      "name": "Karim ALAOUI (VIP)",
      "premium": true,
      "verified": true,
      "updated_at": "2025-04-10T09:15:00.000000Z"
    },
    "wasRecentlyCreated": false,
    "changes": {
      "premium": true,
      "verified": true,
      "name": "Karim ALAOUI (VIP)",
      "updated_at": "2025-04-10 09:15:00"
    }
  }
}
```

### Example: Tags Changed

```json
{
  "event": "third.tags-changed",
  "data": {
    "model_type": "third",
    "model_id": "thd_80ew4kx3bxkdyjpa",
    "attached_tags": ["vip_customer", "newsletter_subscriber_active"],
    "detached_tags": ["prospect_level_1", "event_invitee_q1_2025"]
  }
}
```

## 5. Ticket Events

| Event | Description |
| :--- | :--- |
| `ticket.created` | A new ticket was created. |
| `ticket.updated` | A ticket was modified (status, assignment, etc.). |
| `ticket.deleted` | A ticket was deleted. |

### Example: Ticket Created

```json
{
  "event": "ticket.created",
  "data": {
    "id": "tkt_n65opmdwby6l84r7",
    "data": {
      "id": "tkt_n65opmdwby6l84r7",
      "ticket_number": "T20250507-001897",
      "subject": "New Inquiry via Webform: Enterprise Plan Pricing",
      "priority_id": 1,
      "ticket_status_id": "tstat_new",
      "tags": ["pricing", "enterprise_plan", "web_inquiry"],
      "information": {
        "fullname": "Leila Kassir",
        "email": "leila.kassir@example.com",
        "phone": "212655112233"
      },
      "created_at": "2025-05-07T10:00:05.000000Z"
    },
    "wasRecentlyCreated": true
  }
}
```

### Example: Ticket Updated

```json
{
  "event": "ticket.updated",
  "data": {
    "id": "tkt_n65opmdwby6l84r7",
    "data": {
      "ticket_number": "T20250507-001897",
      "subject": "RE: Enterprise Plan Pricing [Assigned]",
      "ticket_status_id": "tstat_assigned",
      "handler_id": "usr_agent_amina_sales",
      "note": "Assigned to Amina. Follow up within 2 business hours."
    },
    "wasRecentlyCreated": false,
    "changes": {
      "ticket_status_id": "tstat_assigned",
      "handler_id": "usr_agent_amina_sales",
      "handler_type": "user"
    }
  }
}
```

::tip
For updates (`updated`), the payload includes a `changes` object showing only the modified fields and their new values.
::

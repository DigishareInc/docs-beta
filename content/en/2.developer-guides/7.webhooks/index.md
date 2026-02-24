---
title: Webhooks
description: Receive real-time updates on messages, contacts, conversations, and tickets.
icon: i-lucide-webhook
---

Webhooks allow you to receive real-time `POST` notifications directly on your server when specific events occur in Digishare.

## 1. Setup

::steps
### Set the Webhook URL
Configure your endpoint URL in your Digishare application settings.

### Listen for Events
Your server must be ready to receive `POST` requests with a JSON payload.

### Acknowledge Receipt
Your endpoint **must** respond with an HTTP `200 OK` code to confirm receipt.
::

::warning
If your server does not respond with a `200 OK`, Digishare will attempt to resend the notification following a retry policy before temporarily disabling the webhook.
::

## 2. Campaign Events

Triggered for message status updates (sent, delivered, read) or interactions.

| Event | Description |
| :--- | :---|
| `campaign_message.delivered` | The message has been delivered to the recipient. |
| `campaign_message.read` | The recipient opened the message. |
| `campaign_message.failed` | Delivery failed (invalid number, etc.). |
| `campaign_message.interaction` | The user clicked a button. |

### Example: Interaction (Button Clicked)
```json
{
  "event": "campaign_message.interaction",
  "data": {
    "campaign_id": "cmp_abc123",
    "recipient_id": "212600000000",
    "status_code": "interaction",
    "payload": "button_yes_opt_in"
  }
}
```

## 3. LiveChat Events

Track conversations and messages in real-time.

| Event | Description |
| :--- | :--- |
| `live_chat.new_conversation` | A new chat session has started. |
| `live_chat.new_message` | A new message (client or agent) was posted. |
| `live_chat.conversation_archived` | The conversation was closed. |

### Example: New Message
```json
{
  "event": "live_chat.new_message",
  "data": {
    "conversation_id": "conv_xyz789",
    "type": "text",
    "body": "Hi, I have a question about my order.",
    "sender": {
      "name": "Fatima Zahra"
    }
  }
}
```

## 4. Third Party & Ticket Events

| Object | Event |
| :--- | :--- |
| **Third (Contact)** | `third.created`, `third.updated`, `third.deleted` |
| **Ticket** | `ticket.created`, `ticket.updated`, `ticket.deleted` |

::tip
For updates (`updated`), the payload often includes a `changes` object showing only the modified fields.
::

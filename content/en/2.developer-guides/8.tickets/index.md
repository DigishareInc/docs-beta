---
title: Tickets
description: Manage customer request lifecycles via the integrated ticket system.
icon: i-lucide-ticket
---

The Digishare ticket system allows you to centralize and track support requests from various channels (Web, WhatsApp, Email).

## 1. Ticket Creation

Tickets can be created manually by agents or automatically via web forms or bots.

::api-playground{method="POST" url="https://api.digishare.ma/v1/tickets" description="Create a new support ticket." :variables='{"token": "YOUR_TOKEN"}' :headers='{"Authorization": "Bearer {token}", "Content-Type": "application/json"}' :body='{"subject": "Connection issue", "priority_id": 2, "type_ticket_id": "ttyp_support", "comment": "User is unable to log into their customer area.", "third_id": "thd_123456"}'}
::

## 2. Key Properties

| Field | Type | Description |
| :--- | :--- | :--- |
| `ticket_number` | String | Unique formatted number (e.g., T2024-001) |
| `priority_id` | Integer | Urgency level (1: Low, 2: Medium, 3: High) |
| `ticket_status_id` | String | State (`tstat_new`, `tstat_assigned`, `tstat_closed`) |
| `handler_id` | String | ID of the agent assigned to the ticket |

## 3. Management and Tracking

### Updating a Ticket
Use this method to change status, assign an agent, or add internal notes.

::api-playground{method="PUT" url="https://api.digishare.ma/v1/tickets/{id}" description="Update ticket information." :variables='{"token": "YOUR_TOKEN", "id": "tkt_xyz123"}' :headers='{"Authorization": "Bearer {token}", "Content-Type": "application/json"}' :body='{"ticket_status_id": "tstat_assigned", "handler_id": "usr_agent_01", "note": "Technician is currently processing this request."}'}
::

### Ticket List
Retrieve your tickets with filters by status or date.

::api-playground{method="GET" url="https://api.digishare.ma/v1/tickets" description="List tickets with optional filters." :variables='{"token": "YOUR_TOKEN"}' :headers='{"Authorization": "Bearer {token}"}'}
::

::tip
You can receive real-time notifications for every ticket modification by configuring a [Webhook for Tickets](/en/developer-guides/webhooks#4-third-party--ticket-events).
::

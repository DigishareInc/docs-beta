---
title: Webhooks Configuration
description: Learn how to configure webhooks to receive real-time event notifications from Digishare.
icon: i-lucide-webhook
---

Webhooks allow you to receive real-time HTTP notifications when certain events happen within Digishare. Instead of polling our API for updates, Digishare can push event data directly to your server as soon as it occurs.

## 1. Accessing Webhook Configuration

To set up webhooks, you need to create a **Custom Webhooks** provider.

::steps

### Navigate to Providers

Go to **Settings > Providers** in your Digishare dashboard and click the **Create Provider** button.

### Select Provider Type

Choose **Custom Webhooks** from the list of available provider types.

### Open Webhook Configuration

Scroll down to the **Webhook Configuration** section. Here you will see a list of all supported event categories.
::

![Webhook Configuration Overview](/docs/webhook-overview.png)

## 2. Supported Events

Digishare supports real-time notifications for several core resources. Events are grouped logically:

* **Campaigns**: Events related to campaign messages (Sent, Delivered, Read, Failed, Interactions).
* **Message Templates**: Notifications for template approval status changes.
* **Contacts**: Updates when contacts are created, updated, or opted out.
* **Tickets**: Real-time updates for customer support ticket assignment, status changes, and new replies.
* **Live Chat**: Real-time conversation events for active agent chats.

## 3. Adding a Webhook

To subscribe to a specific event:

1. Expand the relevant category (e.g., **Campaigns**).
2. Find the exact event you want to listen to (e.g., `campaign_message.delivered`).
3. Click the purple **+** (Add) button next to the event row.

This will open the **New Webhook** dialog.

![Add Webhook Dialog](/docs/webhook-dialog.png)

## 4. Webhook Settings

When configuring a new webhook, you can customize how Digishare delivers the payload to your server.

### Endpoint Setup

* **URL**: The endpoint on your server that will receive the requests (must be publicly accessible or accessible via VPN).
* **Method**: The HTTP method to use (defaults to `POST`).
* **Content-Type**: The format of the payload (defaults to `application/json`).
* **Active**: A toggle to instantly enable or disable the specific webhook.

::note
You can configure multiple different webhooks for the exact same event. For example, you can send `ticket.created` events to both your CRM and a specialized Slack notification service simultaneously.
::

### Advanced Configuration

Expand the panels below the endpoint settings to secure your webhook:

#### Headers

Add custom HTTP headers that will be included with every request. This is useful for passing static API keys, routing identifiers, or custom security tokens expected by your server.

#### Authentication

We strongly recommend securing your webhook endpoints. Digishare can automatically authenticate requests sent to your server.

* **Basic Auth**: Provide a Username and Password.
* **Bearer Token**: Provide a static Bearer token.
* **Custom Auth**: Define a custom header key and value for proprietary auth mechanisms.

#### VPN Proxy

If your server sits behind a corporate firewall and is not publicly exposed to the internet, you can enable the internal VPN Proxy. This requires a pre-configured VPN connection in your Digishare workspace settings.

::warning
**Security Best Practice:** We highly recommend validating incoming webhooks using an Authentication token or by verifying requests originate from Digishare's known IP addresses.
::
